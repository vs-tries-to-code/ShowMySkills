import { Router } from 'express';
import multer from 'multer';
import { authController } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { authRateLimiter, otpRateLimiter } from '../middleware/security.js';
import { validateLogin, validateRegister } from '../validators/authValidator.js';

const upload = multer({
  dest: 'uploads/college-ids/',
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG, PNG, and PDF files are allowed'));
    }
  },
});

const router = Router();

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Authenticate user & retrieve JWT token
 *     description: Authenticate with email and password to receive a JWT access token and user profile payload.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: 'alex.morgan@university.edu'
 *               password:
 *                 type: string
 *                 format: password
 *                 example: 'SecurePass123!'
 *               role:
 *                 type: string
 *                 enum: [student, company, college, admin]
 *                 example: 'student'
 *     responses:
 *       200:
 *         description: Login successful with JWT token returned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         description: Missing or invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Incorrect password or unverified account
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       429:
 *         description: Rate limit exceeded (too many login attempts)
 */
router.post('/login', authRateLimiter, validateLogin, authController.login);

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: Register a new account (Student, Company, College, Admin)
 *     description: Register a new platform account. For students, college, graduation year, and college ID are required, and an optional ID card document may be uploaded.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - phone
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: 'Alex Morgan'
 *               email:
 *                 type: string
 *                 format: email
 *                 example: 'alex.morgan@university.edu'
 *               phone:
 *                 type: string
 *                 example: '+919876543210'
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 example: 'SecurePass123!'
 *               role:
 *                 type: string
 *                 enum: [student, company, college, admin]
 *                 default: 'student'
 *                 example: 'student'
 *               college:
 *                 type: string
 *                 description: Required for student accounts
 *                 example: 'National Institute of Technology'
 *               graduationYear:
 *                 type: integer
 *                 description: Required for student accounts
 *                 example: 2026
 *               collegeId:
 *                 type: string
 *                 description: Required for student accounts
 *                 example: 'UNI-2022-CS-042'
 *               collegeIdFile:
 *                 type: string
 *                 format: binary
 *                 description: Optional ID document proof (JPG, PNG, PDF up to 5MB)
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - phone
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: 'Alex Morgan'
 *               email:
 *                 type: string
 *                 format: email
 *                 example: 'alex.morgan@university.edu'
 *               phone:
 *                 type: string
 *                 example: '+919876543210'
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 example: 'SecurePass123!'
 *               role:
 *                 type: string
 *                 enum: [student, company, college, admin]
 *                 default: 'student'
 *                 example: 'student'
 *               college:
 *                 type: string
 *                 example: 'National Institute of Technology'
 *               graduationYear:
 *                 type: integer
 *                 example: 2026
 *               collegeId:
 *                 type: string
 *                 example: 'UNI-2022-CS-042'
 *     responses:
 *       201:
 *         description: Account created successfully; OTP dispatched to email
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error (e.g. missing required student fields, duplicate email)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/send-otp', otpRateLimiter, authController.sendOtp);
router.post('/verify-otp', otpRateLimiter, authController.verifyOtp);

router.post(
  '/register',
  authRateLimiter,
  upload.single('collegeIdFile'),
  validateRegister,
  authController.register
);

/**
 * @openapi
 * /api/auth/verify-email:
 *   post:
 *     summary: Verify email address via 6-digit OTP
 *     description: Submit the 6-digit OTP sent to the user's registered email address to verify their identity.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: 'alex.morgan@university.edu'
 *               otp:
 *                 type: string
 *                 example: '582914'
 *     responses:
 *       200:
 *         description: Email verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 'Email verified successfully'
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid or expired OTP code
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/verify-email', otpRateLimiter, authController.verifyEmail);

/**
 * @openapi
 * /api/auth/forgot-password:
 *   post:
 *     summary: Send password recovery OTP to email
 *     description: Request a one-time 6-digit recovery code sent to the registered email address.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: 'alex.morgan@university.edu'
 *     responses:
 *       200:
 *         description: Recovery OTP sent to registered email
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 'Password reset OTP sent to email'
 *       404:
 *         description: No account found with that email address
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/forgot-password', authRateLimiter, authController.forgotPassword);

/**
 * @openapi
 * /api/auth/verify-reset-otp:
 *   post:
 *     summary: Validate password reset OTP code
 *     description: Verify that the OTP code entered matches the active recovery session.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: 'alex.morgan@university.edu'
 *               otp:
 *                 type: string
 *                 example: '194820'
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 'OTP verified successfully'
 *       400:
 *         description: Invalid or expired OTP code
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/verify-reset-otp', otpRateLimiter, authController.verifyResetOtp);

/**
 * @openapi
 * /api/auth/reset-password:
 *   post:
 *     summary: Complete password reset with verified OTP
 *     description: Set a new secure password using the verified email OTP.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *               - newPassword
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: 'alex.morgan@university.edu'
 *               otp:
 *                 type: string
 *                 example: '194820'
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 example: 'BrandNewSecretPass456!'
 *     responses:
 *       200:
 *         description: Password updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 'Password has been reset successfully'
 *       400:
 *         description: Verification mismatch or password criteria unmet
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/reset-password', authRateLimiter, authController.resetPassword);

/**
 * @openapi
 * /api/auth/me:
 *   get:
 *     summary: Get currently authenticated user profile
 *     description: Returns the full user document for the bearer token bearer.
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Authentication
 *     responses:
 *       200:
 *         description: Current user profile retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized - Missing or invalid Bearer token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/me', authMiddleware, authController.getMe);

/**
 * @openapi
 * /api/auth/me:
 *   put:
 *     summary: Update currently authenticated user profile
 *     description: Update authenticated profile fields, aliases, settings, or credentials.
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       401:
 *         description: Unauthorized
 */
router.put('/me', authMiddleware, authController.updateMe);

/**
 * @openapi
 * /api/auth/refresh:
 *   post:
 *     summary: Exchange refresh token for a fresh access token
 *     description: Provides automated token rotation and seamless authentication lifecycle without re-logging in.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Tokens refreshed successfully
 *       401:
 *         description: Invalid or expired refresh token
 */
router.post('/refresh', authRateLimiter, authController.refresh);

/**
 * @openapi
 * /api/auth/logout:
 *   post:
 *     summary: Logout and revoke refresh token
 *     description: Removes active refresh token session from user record.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.post('/logout', authController.logout);

export default router;
