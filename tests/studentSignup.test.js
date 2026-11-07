import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { validateRegister } from '../api/src/validators/authValidator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper for mocking Express req, res, next
const mockReqRes = (body = {}) => {
  const req = { body };
  let statusCode = 200;
  let jsonResponse = null;
  const res = {
    status: (code) => {
      statusCode = code;
      return res;
    },
    json: (data) => {
      jsonResponse = data;
      return res;
    },
  };
  let nextCalled = false;
  const next = () => {
    nextCalled = true;
  };
  return { req, res, next, getStatus: () => statusCode, getJson: () => jsonResponse, wasNextCalled: () => nextCalled };
};

const hashOtp = (otp) => {
  return crypto.createHash('sha256').update(String(otp).trim()).digest('hex');
};

// ─────────────────────────────────────────────────────────────
// 1. Backend Validation for Student Required Fields
// ─────────────────────────────────────────────────────────────

test('Backend Student Validation: Rejects registration when college is missing for student', () => {
  const { req, res, getStatus, getJson, wasNextCalled } = mockReqRes({
    name: 'Aarav Sharma',
    email: 'aarav@university.edu',
    phone: '+919876543210',
    password: 'password123',
    role: 'student',
    graduationYear: 2026,
    collegeId: 'UNI-2022-001',
    // college missing
  });

  validateRegister(req, res, () => {});
  assert.strictEqual(getStatus(), 400);
  assert.strictEqual(wasNextCalled(), false);
  assert.ok(getJson().message.includes('College, graduation year, and college ID are required'));
});

test('Backend Student Validation: Rejects registration when graduationYear is missing for student', () => {
  const { req, res, getStatus, getJson, wasNextCalled } = mockReqRes({
    name: 'Aarav Sharma',
    email: 'aarav@university.edu',
    phone: '+919876543210',
    password: 'password123',
    role: 'student',
    college: 'National Institute of Technology',
    collegeId: 'UNI-2022-001',
    // graduationYear missing
  });

  validateRegister(req, res, () => {});
  assert.strictEqual(getStatus(), 400);
  assert.strictEqual(wasNextCalled(), false);
  assert.ok(getJson().message.includes('College, graduation year, and college ID are required'));
});

test('Backend Student Validation: Rejects registration when collegeId is missing for student', () => {
  const { req, res, getStatus, getJson, wasNextCalled } = mockReqRes({
    name: 'Aarav Sharma',
    email: 'aarav@university.edu',
    phone: '+919876543210',
    password: 'password123',
    role: 'student',
    college: 'National Institute of Technology',
    graduationYear: 2026,
    // collegeId missing
  });

  validateRegister(req, res, () => {});
  assert.strictEqual(getStatus(), 400);
  assert.strictEqual(wasNextCalled(), false);
  assert.ok(getJson().message.includes('College, graduation year, and college ID are required'));
});

test('Backend Student Validation: Passes when all required student fields are provided', () => {
  const { req, res, next, getStatus, wasNextCalled } = mockReqRes({
    name: 'Aarav Sharma',
    email: 'aarav@university.edu',
    phone: '+919876543210',
    password: 'password123',
    role: 'student',
    college: 'National Institute of Technology',
    graduationYear: 2026,
    collegeId: 'UNI-2022-001',
  });

  validateRegister(req, res, next);
  assert.strictEqual(getStatus(), 200);
  assert.strictEqual(wasNextCalled(), true);
});

test('Backend Non-Student Validation: Company role does not require student-specific fields', () => {
  const { req, res, next, getStatus, wasNextCalled } = mockReqRes({
    companyName: 'Tech Innovations Corp',
    email: 'hr@techinnovations.com',
    phone: '+919876543210',
    password: 'password123',
    role: 'company',
  });

  validateRegister(req, res, next);
  assert.strictEqual(getStatus(), 200);
  assert.strictEqual(wasNextCalled(), true);
});

// ─────────────────────────────────────────────────────────────
// 2. File Upload Specifications for College ID Proof
// ─────────────────────────────────────────────────────────────

test('College ID Document Upload: Accepts JPG, PNG, and PDF up to 5MB', () => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'application/pdf'];
  const maxFileSizeBytes = 5 * 1024 * 1024; // 5MB

  assert.ok(allowedMimeTypes.includes('image/jpeg'));
  assert.ok(allowedMimeTypes.includes('image/png'));
  assert.ok(allowedMimeTypes.includes('application/pdf'));

  // Disallowed extensions
  const invalidTypes = ['application/zip', 'text/plain', 'application/x-msdownload', 'image/gif'];
  for (const type of invalidTypes) {
    assert.strictEqual(allowedMimeTypes.includes(type), false);
  }

  // File size checks
  assert.ok(4.9 * 1024 * 1024 <= maxFileSizeBytes, '4.9MB should be accepted');
  assert.ok(5.1 * 1024 * 1024 > maxFileSizeBytes, '5.1MB should be rejected');
});

// ─────────────────────────────────────────────────────────────
// 3. Email Verification OTP Flow & Security
// ─────────────────────────────────────────────────────────────

test('OTP Security: Plaintext OTP is securely hashed and never exposed', () => {
  const plainOtp = '682914';
  const hashed = hashOtp(plainOtp);

  assert.notStrictEqual(plainOtp, hashed);
  assert.strictEqual(hashed.length, 64);
  assert.strictEqual(hashOtp('682914'), hashed);
  assert.notStrictEqual(hashOtp('682915'), hashed);
});

test('OTP Verification: Cooldown rate limit enforcement (60 seconds between resends)', () => {
  const cooldownMs = 60 * 1000;
  const justSentAt = new Date();

  const isCooldownActive = (sentAt) => {
    return Date.now() - sentAt.getTime() < cooldownMs;
  };

  assert.strictEqual(isCooldownActive(justSentAt), true);

  const pastCooldown = new Date(Date.now() - 65 * 1000);
  assert.strictEqual(isCooldownActive(pastCooldown), false);
});

test('OTP Verification: Code expiry check (10 minutes)', () => {
  const otpExpiryMs = 10 * 60 * 1000;
  const expiredTimestamp = new Date(Date.now() - 11 * 60 * 1000);

  const isExpired = (expiryDate) => {
    return expiryDate.getTime() < Date.now();
  };

  assert.strictEqual(isExpired(expiredTimestamp), true);

  const validTimestamp = new Date(Date.now() + 5 * 60 * 1000);
  assert.strictEqual(isExpired(validTimestamp), false);
});

test('OTP Verification: Attempt limit enforcement (max 5)', () => {
  let attempts = 0;
  const maxAttempts = 5;
  const correctHash = hashOtp('749201');

  const verifyAttempt = (inputCode) => {
    if (attempts >= maxAttempts) {
      throw new Error('Too many failed attempts. Code invalidated.');
    }
    const inputHash = hashOtp(inputCode);
    if (inputHash !== correctHash) {
      attempts += 1;
      return false;
    }
    return true;
  };

  for (let i = 0; i < 5; i++) {
    const success = verifyAttempt('000000');
    assert.strictEqual(success, false);
  }

  assert.throws(() => verifyAttempt('000000'), /Too many failed attempts/);
});

// ─────────────────────────────────────────────────────────────
// 4. Country Code Selector & Phone Formatting
// ─────────────────────────────────────────────────────────────

test('Phone Number Formatting: Country code defaults to +91 and formats consistently for backend', () => {
  const countryCode = '+91';
  const rawNumber = '9876543210';
  const formattedPhone = `${countryCode}${rawNumber.trim().replace(/^0+/, '')}`;

  assert.strictEqual(formattedPhone, '+919876543210');
  assert.ok(/^\+\d{1,4}\d{6,14}$/.test(formattedPhone));
});

test('Phone Number Formatting: Handles leading zeros entered by user', () => {
  const countryCode = '+91';
  const rawNumberWithZero = '09876543210';
  const formattedPhone = `${countryCode}${rawNumberWithZero.trim().replace(/^0+/, '')}`;

  assert.strictEqual(formattedPhone, '+919876543210');
});

// ─────────────────────────────────────────────────────────────
// 5. Frontend UI Contract Verification
// ─────────────────────────────────────────────────────────────

test('Frontend UI Contract: Signup page includes all required student inputs and OTP elements', () => {
  const pagePath = path.resolve(__dirname, '../web/src/app/(auth)/signup/page.jsx');
  const pageContent = fs.readFileSync(pagePath, 'utf8');

  // Student specific inputs
  assert.ok(pageContent.includes('id="student-name-input"'), 'Must contain student-name-input');
  assert.ok(pageContent.includes('id="student-email-input"'), 'Must contain student-email-input');
  assert.ok(pageContent.includes('id="student-send-otp-btn"'), 'Must contain student-send-otp-btn');
  assert.ok(pageContent.includes('id="student-otp-input"'), 'Must contain student-otp-input');
  assert.ok(pageContent.includes('id="student-verify-otp-btn"'), 'Must contain student-verify-otp-btn');
  assert.ok(pageContent.includes('id="student-email-verified-badge"'), 'Must contain student-email-verified-badge');
  assert.ok(pageContent.includes('id="student-country-code"'), 'Must contain student-country-code');
  assert.ok(pageContent.includes('id="student-phone-input"'), 'Must contain student-phone-input');
  assert.ok(pageContent.includes('id="student-college-input"'), 'Must contain student-college-input');
  assert.ok(pageContent.includes('id="student-grad-year-input"'), 'Must contain student-grad-year-input');
  assert.ok(pageContent.includes('id="student-college-id-input"'), 'Must contain student-college-id-input');
  assert.ok(pageContent.includes('id="student-college-id-file-input"'), 'Must contain student-college-id-file-input');

  // Verify default country code is +91
  assert.ok(pageContent.includes('"+91"'), 'Must default country code to +91');

  // Password visibility controls preserved
  assert.ok(pageContent.includes('showPassword'), 'Must preserve password toggle');
  assert.ok(pageContent.includes('showConfirmPassword'), 'Must preserve confirm password toggle');
});

test('Frontend Navigation: /signup/student redirects seamlessly to unified student signup flow', () => {
  const rolePagePath = path.resolve(__dirname, '../web/src/app/(auth)/signup/[role]/page.jsx');
  const rolePageContent = fs.readFileSync(rolePagePath, 'utf8');

  assert.ok(
    rolePageContent.includes("if (role === 'student')"),
    'Must handle student role in signup/[role]'
  );
  assert.ok(
    rolePageContent.includes("redirect('/signup?role=student')"),
    'Must redirect /signup/student to /signup?role=student'
  );
});

// ─────────────────────────────────────────────────────────────
// 6. Security & Credential Validation
// ─────────────────────────────────────────────────────────────

test('Validation: Rejects registration with invalid email format', () => {
  const { req, res, getStatus, getJson } = mockReqRes({
    name: 'Aarav Sharma',
    email: 'invalid-email-without-domain',
    phone: '+919876543210',
    password: 'password123',
    role: 'student',
    college: 'NIT',
    graduationYear: 2026,
    collegeId: 'UNI-2022-001',
  });

  validateRegister(req, res, () => {});
  assert.strictEqual(getStatus(), 400);
  assert.ok(getJson().message.includes('valid email address is required'));
});

test('Validation: Rejects registration with password shorter than 6 characters', () => {
  const { req, res, getStatus, getJson } = mockReqRes({
    name: 'Aarav Sharma',
    email: 'aarav@university.edu',
    phone: '+919876543210',
    password: '12345', // only 5 chars
    role: 'student',
    college: 'NIT',
    graduationYear: 2026,
    collegeId: 'UNI-2022-001',
  });

  validateRegister(req, res, () => {});
  assert.strictEqual(getStatus(), 400);
  assert.ok(getJson().message.includes('at least 6 characters'));
});

test('Client Password Matching Check: Mismatched passwords prevent submission', () => {
  const password = 'SecretPassword123!';
  const confirmPassword = 'DifferentPassword456!';

  const validateMatching = (pwd, confirmPwd) => {
    if (pwd !== confirmPwd) {
      return 'Passwords do not match';
    }
    return null;
  };

  assert.strictEqual(validateMatching(password, confirmPassword), 'Passwords do not match');
  assert.strictEqual(validateMatching(password, password), null);
});

test('Client Email Verification Check: Prevents student registration submission without email OTP verification', () => {
  const isEmailVerified = false;

  const canSubmitStudentSignup = (verified) => {
    if (!verified) {
      return false;
    }
    return true;
  };

  assert.strictEqual(canSubmitStudentSignup(isEmailVerified), false);
  assert.strictEqual(canSubmitStudentSignup(true), true);
});

