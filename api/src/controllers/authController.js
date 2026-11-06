import { userService } from '../services/userService.js';

export const authController = {
  login: async (req, res, next) => {
    try {
      const { email, password, role } = req.body;
      const user = await userService.authenticate(email, password, role);
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  },

  sendOtp: async (req, res, next) => {
    try {
      const { email } = req.body;
      const result = await userService.sendSignupOtp(email);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  verifyOtp: async (req, res, next) => {
    try {
      const { email, otp } = req.body;
      const result = await userService.verifySignupOtp(email, otp);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  register: async (req, res, next) => {
    try {
      const newUser = await userService.createUser({
        ...req.body,
        collegeIdDocument: req.file ? req.file.path : null,
      });
      res.status(201).json({ success: true, data: newUser });
    } catch (error) {
      next(error);
    }
  },

  verifyEmail: async (req, res, next) => {
    try {
      const { email, otp } = req.body;
      const user = await userService.verifyEmailOtp(email, otp);
      res.json({
        success: true,
        message: 'Email verified successfully',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },

  forgotPassword: async (req, res, next) => {
    try {
      const { email } = req.body;
      const result = await userService.sendPasswordResetOtp(email);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  },

  verifyResetOtp: async (req, res, next) => {
    try {
      const { email, otp } = req.body;
      const result = await userService.verifyPasswordResetOtp(email, otp);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  },

  resetPassword: async (req, res, next) => {
    try {
      const { email, otp, newPassword } = req.body;
      const result = await userService.resetPassword(email, otp, newPassword);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  },

  getMe: async (req, res, next) => {
    try {
      const user = await userService.getUserById(req.user.id);
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  },

  updateMe: async (req, res, next) => {
    try {
      const updatedUser = await userService.updateProfile(req.user.id, req.body);
      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  },

  refresh: async (req, res, next) => {
    try {
      const refreshToken =
        req.body?.refreshToken ||
        req.headers['x-refresh-token'] ||
        (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')
          ? req.headers.authorization.slice(7)
          : null);

      const result = await userService.refreshAccessToken(refreshToken);
      res.json({
        success: true,
        message: 'Access token refreshed successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  logout: async (req, res, next) => {
    try {
      const refreshToken =
        req.body?.refreshToken || req.headers['x-refresh-token'];
      if (refreshToken) {
        await userService.revokeRefreshToken(refreshToken);
      }
      res.json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      next(error);
    }
  },
};
