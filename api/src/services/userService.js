import crypto from 'node:crypto';
import mongoose from 'mongoose';
import { generateOtp } from '../utils/otp.js';
import { emailService } from './emailService.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { OtpVerification } from '../models/OtpVerification.js';

const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
const RATE_LIMIT_COOLDOWN_MS = 60 * 1000; // 60 seconds between resends
const MAX_OTP_ATTEMPTS = 5;
const MAX_RESENDS_WINDOW = 5;
const RESEND_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

const hashOtp = (otp) => {
  return crypto.createHash('sha256').update(String(otp).trim()).digest('hex');
};

const getJwtSecrets = () => {
  const jwtSecret = process.env.JWT_SECRET || 'dev_secret_key_showmyskills_2026';
  const refreshSecret =
    process.env.JWT_REFRESH_SECRET || `${jwtSecret}_refresh_showmyskills_secret`;
  return { jwtSecret, refreshSecret };
};

export const generateTokenPair = async (user) => {
  const { jwtSecret, refreshSecret } = getJwtSecrets();

  const accessToken = jwt.sign(
    {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
      roleTag: user.roleTag,
    },
    jwtSecret,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    {
      sub: user._id.toString(),
      type: 'refresh',
      jti: Math.random().toString(36).substring(2) + Date.now().toString(36),
    },
    refreshSecret,
    { expiresIn: '7d' }
  );

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const now = new Date();

  // Retain only valid tokens and append new refresh token (max 10 sessions)
  const validTokens = (user.refreshTokens || []).filter((t) => t.expiresAt > now);
  validTokens.push({ token: refreshToken, expiresAt, createdAt: now });
  user.refreshTokens = validTokens.slice(-10);

  await user.save();

  return {
    accessToken,
    refreshToken,
    token: accessToken, // backward compatibility
  };
};

export const userService = {
  authenticate: async (email, password, role = null) => {
    if (!email || !password) {
      const error = new Error('Email and password are required');
      error.statusCode = 400;
      throw error;
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    // Pre-check database readiness to avoid hanging on disconnected cluster
    if (mongoose.connection.readyState !== 1) {
      const error = new Error('Database service is temporarily unavailable');
      error.statusCode = 503;
      error.isDatabaseError = true;
      throw error;
    }

    let user;
    try {
      user = await User.findOne({ email: normalizedEmail });
    } catch (dbErr) {
      if (
        dbErr.name === 'MongoServerSelectionError' ||
        dbErr.name === 'MongoNetworkError' ||
        dbErr.name === 'MongoTimeoutError' ||
        dbErr.message?.includes('timed out') ||
        dbErr.message?.includes('ECONNREFUSED')
      ) {
        const error = new Error('Database service is temporarily unavailable');
        error.statusCode = 503;
        error.isDatabaseError = true;
        error.originalError = dbErr;
        throw error;
      }
      throw dbErr;
    }

    if (!user) {
      const error = new Error('Email or password is incorrect.');
      error.statusCode = 401;
      throw error;
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      const error = new Error('Email or password is incorrect.');
      error.statusCode = 401;
      throw error;
    }

    if (role) {
      const expectedRole = String(role).trim().toLowerCase();
      const actualRole = String(user.role || '').trim().toLowerCase();
      if (actualRole !== expectedRole) {
        const article = expectedRole === 'admin' ? 'an' : 'a';
        const roleLabel = expectedRole.charAt(0).toUpperCase() + expectedRole.slice(1);
        const error = new Error(
          `This account is not registered as ${article} ${roleLabel} account. Choose the correct account type.`
        );
        error.statusCode = 403;
        error.code = 'ROLE_MISMATCH';
        throw error;
      }
    }

    const tokens = await generateTokenPair(user);

    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.refreshTokens;
    delete userObj.emailVerificationOtp;
    delete userObj.emailVerificationOtpExpires;
    delete userObj.passwordResetOtp;
    delete userObj.passwordResetOtpExpires;

    return {
      id: user._id.toString(),
      ...userObj,
      ...tokens,
    };
  },

  refreshAccessToken: async (refreshToken) => {
    if (!refreshToken) {
      const error = new Error('Refresh token is required');
      error.statusCode = 400;
      throw error;
    }

    const { refreshSecret } = getJwtSecrets();

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, refreshSecret);
    } catch (err) {
      const error = new Error('Invalid or expired refresh token');
      error.statusCode = 401;
      error.code = 'REFRESH_TOKEN_EXPIRED';
      throw error;
    }

    const user = await User.findById(decoded.sub);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    const tokenRecordIndex = (user.refreshTokens || []).findIndex(
      (t) => t.token === refreshToken && t.expiresAt > new Date()
    );

    if (tokenRecordIndex === -1) {
      const error = new Error('Refresh token has been revoked or expired');
      error.statusCode = 401;
      error.code = 'REFRESH_TOKEN_REVOKED';
      throw error;
    }

    // Remove consumed refresh token for rotation
    user.refreshTokens.splice(tokenRecordIndex, 1);

    const tokens = await generateTokenPair(user);

    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.refreshTokens;
    delete userObj.emailVerificationOtp;
    delete userObj.emailVerificationOtpExpires;
    delete userObj.passwordResetOtp;
    delete userObj.passwordResetOtpExpires;

    return {
      ...tokens,
      user: {
        id: user._id.toString(),
        ...userObj,
      },
    };
  },

  revokeRefreshToken: async (refreshToken) => {
    if (!refreshToken) return;
    const { refreshSecret } = getJwtSecrets();

    try {
      const decoded = jwt.verify(refreshToken, refreshSecret);
      await User.findByIdAndUpdate(decoded.sub, {
        $pull: { refreshTokens: { token: refreshToken } },
      });
    } catch {
      await User.updateMany(
        { 'refreshTokens.token': refreshToken },
        { $pull: { refreshTokens: { token: refreshToken } } }
      );
    }
  },

  createUser: async (userData) => {
    const {
      name,
      email,
      phone,
      password,
      role = 'student',
      college = '',
      graduationYear = null,
      collegeId = '',
      collegeIdDocument = null,
      companyName = '',
      website = '',
      collegeName = '',
      verificationToken = null,
    } = userData;

    const normalizedEmail = String(email).trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      const error = new Error('Email is already registered');
      error.statusCode = 409;
      throw error;
    }

    let isEmailPreVerified = false;
    if (verificationToken) {
      const otpRecord = await OtpVerification.findOne({
        target: normalizedEmail,
        type: 'signup_email',
        verified: true,
        verificationToken,
        used: false,
      });
      if (otpRecord) {
        isEmailPreVerified = true;
        otpRecord.used = true;
        await otpRecord.save();
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOtp();
    const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

    const userPayload = {
      name: name || companyName || collegeName || 'New User',
      email: normalizedEmail,
      phone: phone || '',
      password: hashedPassword,
      role,
      roleTag: role === 'admin' ? 'Admin' : 'Regular',
      college: college || collegeName || '',
      graduationYear: graduationYear ? Number(graduationYear) : null,
      collegeId,
      collegeIdDocument,
      emailVerified: isEmailPreVerified,
      emailVerificationOtp: isEmailPreVerified ? null : otp,
      emailVerificationOtpExpires: isEmailPreVerified ? null : otpExpiresAt,
    };

    if (role === 'company') {
      userPayload.companyProfile = {
        companyName: companyName || name,
        website: website || '',
      };
    } else if (role === 'college') {
      userPayload.collegeProfile = {
        collegeName: collegeName || name,
        website: website || '',
      };
    }

    const user = await User.create(userPayload);

    if (!isEmailPreVerified) {
      try {
        await emailService.sendVerificationOtp(normalizedEmail, otp);
      } catch (e) {
        console.warn('Email dispatch failed, continuing:', e.message);
      }
    }

    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.emailVerificationOtp;
    delete userResponse.emailVerificationOtpExpires;

    if (isEmailPreVerified) {
      const tokens = await generateTokenPair(user);
      return {
        ...userResponse,
        ...tokens,
        token: tokens.accessToken,
        user: userResponse,
      };
    }

    return userResponse;
  },

  sendSignupOtp: async (email) => {
    if (!email || !email.includes('@')) {
      const err = new Error('A valid email address is required');
      err.statusCode = 400;
      throw err;
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      const err = new Error('Email is already registered. Please log in.');
      err.statusCode = 409;
      throw err;
    }

    const existingOtp = await OtpVerification.findOne({
      target: normalizedEmail,
      type: 'signup_email',
    });

    const now = new Date();

    if (existingOtp) {
      const elapsedSinceLastSend = now.getTime() - existingOtp.lastSentAt.getTime();
      if (elapsedSinceLastSend < RATE_LIMIT_COOLDOWN_MS) {
        const remainingSec = Math.ceil(
          (RATE_LIMIT_COOLDOWN_MS - elapsedSinceLastSend) / 1000
        );
        const err = new Error(
          `Please wait ${remainingSec} seconds before requesting a new code.`
        );
        err.statusCode = 429;
        throw err;
      }

      const isWithinResendWindow =
        now.getTime() - existingOtp.updatedAt.getTime() < RESEND_WINDOW_MS;
      if (isWithinResendWindow && existingOtp.resendCount >= MAX_RESENDS_WINDOW) {
        const err = new Error(
          'Maximum resend attempts reached. Please try again after 15 minutes.'
        );
        err.statusCode = 429;
        throw err;
      }
    }

    const plainOtp = generateOtp();
    const otpHash = hashOtp(plainOtp);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);

    await OtpVerification.findOneAndUpdate(
      { target: normalizedEmail, type: 'signup_email' },
      {
        otpHash,
        expiresAt,
        attempts: 0,
        resendCount: existingOtp ? existingOtp.resendCount + 1 : 1,
        lastSentAt: now,
        verified: false,
        verifiedAt: null,
        used: false,
        verificationToken: null,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    try {
      await emailService.sendVerificationOtp(normalizedEmail, plainOtp);
    } catch (e) {
      console.warn('[UserService] Email dispatch failed, continuing:', e.message);
    }

    return {
      success: true,
      message: 'Verification code sent to your email address.',
    };
  },

  verifySignupOtp: async (email, otp) => {
    if (!email || !otp) {
      const err = new Error('Email and verification code are required');
      err.statusCode = 400;
      throw err;
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const cleanOtp = String(otp).trim();

    const record = await OtpVerification.findOne({
      target: normalizedEmail,
      type: 'signup_email',
    });

    if (!record) {
      const err = new Error('No OTP found. Please request a new verification code.');
      err.statusCode = 400;
      throw err;
    }

    const now = new Date();

    if (record.expiresAt < now) {
      const err = new Error('Verification code has expired. Please request a new code.');
      err.statusCode = 400;
      throw err;
    }

    if (record.attempts >= MAX_OTP_ATTEMPTS) {
      const err = new Error('Too many failed attempts. Code invalidated. Please request a new code.');
      err.statusCode = 400;
      throw err;
    }

    const inputHash = hashOtp(cleanOtp);
    if (inputHash !== record.otpHash) {
      record.attempts += 1;
      await record.save();
      const remainingAttempts = Math.max(0, MAX_OTP_ATTEMPTS - record.attempts);
      const err = new Error(
        remainingAttempts > 0
          ? `Invalid verification code. ${remainingAttempts} attempts remaining.`
          : 'Invalid verification code. Maximum attempts reached. Please request a new code.'
      );
      err.statusCode = 400;
      throw err;
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    record.verified = true;
    record.verifiedAt = now;
    record.verificationToken = verificationToken;
    await record.save();

    return {
      success: true,
      message: 'Email verified successfully.',
      verificationToken,
    };
  },

  verifyEmailOtp: async (email, otp) => {
    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    if (!user.emailVerificationOtp) {
      const error = new Error('No OTP found. Please request a new OTP.');
      error.statusCode = 400;
      throw error;
    }

    if (user.emailVerificationOtp !== String(otp)) {
      const error = new Error('Invalid OTP');
      error.statusCode = 400;
      throw error;
    }

    if (!user.emailVerificationOtpExpires || user.emailVerificationOtpExpires < new Date()) {
      const error = new Error('OTP has expired');
      error.statusCode = 400;
      throw error;
    }

    user.emailVerified = true;
    user.emailVerificationOtp = null;
    user.emailVerificationOtpExpires = null;

    const tokens = await generateTokenPair(user);

    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.refreshTokens;
    delete userResponse.emailVerificationOtp;
    delete userResponse.emailVerificationOtpExpires;

    return {
      ...userResponse,
      ...tokens,
    };
  },

  sendPasswordResetOtp: async (email) => {
    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      const error = new Error('No account found with this email address');
      error.statusCode = 404;
      throw error;
    }

    const otp = generateOtp();
    user.passwordResetOtp = otp;
    user.passwordResetOtpExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    try {
      await emailService.sendVerificationOtp(normalizedEmail, otp);
    } catch (e) {
      console.warn('Password reset email dispatch warning:', e.message);
    }

    return { success: true, message: 'Password recovery OTP sent to your email.' };
  },

  verifyPasswordResetOtp: async (email, otp) => {
    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    if (!user.passwordResetOtp || user.passwordResetOtp !== String(otp)) {
      const error = new Error('Invalid or expired OTP code');
      error.statusCode = 400;
      throw error;
    }

    if (user.passwordResetOtpExpires && user.passwordResetOtpExpires < new Date()) {
      const error = new Error('OTP code has expired. Please request a new one.');
      error.statusCode = 400;
      throw error;
    }

    return { success: true, message: 'OTP verified successfully.' };
  },

  resetPassword: async (email, otp, newPassword) => {
    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    if (!user.passwordResetOtp || user.passwordResetOtp !== String(otp)) {
      const error = new Error('Invalid or expired OTP code');
      error.statusCode = 400;
      throw error;
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.passwordResetOtp = null;
    user.passwordResetOtpExpires = null;
    await user.save();

    return { success: true, message: 'Password updated successfully. You can now log in.' };
  },

  getUserById: async (userId) => {
    const user = await User.findById(userId).select('-password -emailVerificationOtp -passwordResetOtp');
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }
    return user;
  },

  updateProfile: async (userId, data) => {
    const allowedFields = [
      'name',
      'headline',
      'bio',
      'location',
      'phone',
      'dob',
      'profileIcon',
      'college',
      'course',
      'branch',
      'graduationYear',
      'experienceLevel',
      'skills',
      'primarySkills',
      'projects',
      'certifications',
      'achievements',
      'resumeUrl',
      'portfolioUrl',
      'githubUrl',
      'linkedinUrl',
      'companyProfile',
      'collegeProfile',
      'notificationPreferences',
      'privacyPreferences',
      'twoFactorEnabled',
    ];

    const updateData = {};
    for (const key of allowedFields) {
      if (data[key] !== undefined) {
        updateData[key] = data[key];
      }
    }

    // Map common aliases from frontend forms
    if (data.companyProfile && typeof data.companyProfile === 'object') {
      delete updateData.companyProfile;
      for (const [subKey, subVal] of Object.entries(data.companyProfile)) {
        updateData[`companyProfile.${subKey}`] = subVal;
      }
    }

    if (data.logo !== undefined) {
      updateData['companyProfile.logo'] = data.logo;
      updateData.profileIcon = data.logo;
    } else if (data.companyProfile?.logo !== undefined) {
      updateData.profileIcon = data.companyProfile.logo;
    }

    const yearVal = data.establishedYear !== undefined ? data.establishedYear : data.establishmentYear;
    if (yearVal !== undefined) {
      updateData['companyProfile.establishedYear'] = yearVal ? Number(yearVal) : null;
    }
    const sizeVal = data.companySize !== undefined ? data.companySize : data.teamSize;
    if (sizeVal !== undefined) {
      updateData['companyProfile.companySize'] = sizeVal ? String(sizeVal).trim() : '';
    }

    if (data.github && !updateData.githubUrl) updateData.githubUrl = data.github;
    if (data.linkedin && !updateData.linkedinUrl) updateData.linkedinUrl = data.linkedin;
    if (data.department && !updateData.branch) updateData.branch = data.department;
    if (data.about && !updateData.bio) updateData.bio = data.about;
    if (data.collegeName && !updateData.college) updateData.college = data.collegeName;
    if (data.gradYear && !updateData.graduationYear) updateData.graduationYear = Number(data.gradYear);

    // If password change is requested in profile/settings
    const currentPass = data.currentPassword || data.passwords?.current;
    const newPass = data.newPassword || data.passwords?.newPass;
    if (currentPass && newPass) {
      const user = await User.findById(userId);
      const matches = await bcrypt.compare(currentPass, user.password);
      if (!matches) {
        const error = new Error('Current password is incorrect');
        error.statusCode = 400;
        throw error;
      }
      if (newPass.length < 6) {
        const error = new Error('New password must be at least 6 characters');
        error.statusCode = 400;
        throw error;
      }
      user.password = await bcrypt.hash(newPass, 10);
      await user.save();
    }

    // Auto calculate completion percentage
    let completedPoints = 0;
    if (updateData.name || data.name) completedPoints += 20;
    if (updateData.headline || data.headline) completedPoints += 15;
    if (updateData.bio || data.bio) completedPoints += 15;
    if ((updateData.skills && updateData.skills.length) || (data.skills && data.skills.length)) completedPoints += 20;
    if ((updateData.projects && updateData.projects.length) || (data.projects && data.projects.length)) completedPoints += 20;
    if (updateData.resumeUrl || data.resumeUrl) completedPoints += 10;
    updateData.completionPercentage = Math.min(100, Math.max(30, completedPoints));

    const updatedUser = await User.findByIdAndUpdate(userId, { $set: updateData }, { new: true }).select(
      '-password -emailVerificationOtp -passwordResetOtp -refreshTokens'
    );

    return updatedUser;
  },

  updateSettings: async (userId, data) => {
    const updateData = {};
    if (data.notificationPreferences) {
      updateData.notificationPreferences = data.notificationPreferences;
    }
    if (data.privacyPreferences) {
      updateData.privacyPreferences = data.privacyPreferences;
    }
    if (data.twoFactorEnabled !== undefined) {
      updateData.twoFactorEnabled = data.twoFactorEnabled;
    }

    if (data.newPassword && data.currentPassword) {
      const user = await User.findById(userId);
      const matches = await bcrypt.compare(data.currentPassword, user.password);
      if (!matches) {
        const error = new Error('Current password is incorrect');
        error.statusCode = 400;
        throw error;
      }
      user.password = await bcrypt.hash(data.newPassword, 10);
      await user.save();
    }

    const updatedUser = await User.findByIdAndUpdate(userId, { $set: updateData }, { new: true }).select(
      '-password -emailVerificationOtp -passwordResetOtp'
    );

    return updatedUser;
  },

  searchUsers: async ({ search = '', role = 'student', roleTag, college, skill, page = 1, limit = 20 }) => {
    const filter = { role };

    if (roleTag && roleTag !== 'All') {
      filter.roleTag = roleTag;
    }

    if (college) {
      filter.college = new RegExp(college, 'i');
    }

    if (skill) {
      filter['skills.name'] = new RegExp(skill, 'i');
    }

    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [
        { name: regex },
        { college: regex },
        { headline: regex },
        { 'skills.name': regex },
        { branch: regex },
      ];
    }

    const skip = (Math.max(1, page) - 1) * limit;

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password -emailVerificationOtp -passwordResetOtp')
        .sort({ displayOrder: 1, createdAt: 1 })
        .skip(skip)
        .limit(Number(limit)),
      User.countDocuments(filter),
    ]);

    return {
      users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },
};