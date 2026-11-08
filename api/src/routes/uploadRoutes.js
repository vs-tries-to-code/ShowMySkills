import { Router } from 'express';
import { uploadController } from '../controllers/uploadController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
  uploadAvatar,
  uploadResume,
  uploadCertificate,
  uploadCompanyLogo,
  uploadChatAttachment,
  uploadInternshipPoster,
} from '../services/uploadService.js';
import { submissionRateLimiter } from '../middleware/security.js';

const router = Router();

router.use(authMiddleware);
router.use(submissionRateLimiter);

/**
 * @openapi
 * /api/upload/avatar:
 *   post:
 *     summary: Upload profile photo avatar (JPEG, PNG, WebP)
 *     description: Uploads a user avatar image and automatically updates the profileIcon field for the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - File Uploads
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Image file (JPEG, PNG, WebP up to 5MB)
 *     responses:
 *       201:
 *         description: Avatar uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: 'Avatar uploaded successfully' }
 *                 data:
 *                   type: object
 *                   properties:
 *                     url: { type: string, example: 'http://localhost:5000/uploads/avatars/avatar-123.jpg' }
 *                     filename: { type: string, example: 'avatar-123.jpg' }
 *                     size: { type: integer, example: 450000 }
 *       400:
 *         description: No file attached or invalid file extension
 */
router.post('/avatar', uploadAvatar.single('file'), uploadController.handleAvatarUpload);

/**
 * @openapi
 * /api/upload/resume:
 *   post:
 *     summary: Upload student resume (PDF, DOC, DOCX up to 10MB)
 *     description: Uploads a resume document and automatically binds the file URL to the candidate profile.
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - File Uploads
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Resume document (PDF, DOC, DOCX up to 10MB)
 *     responses:
 *       201:
 *         description: Resume uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: 'Resume uploaded successfully' }
 *                 data:
 *                   type: object
 *                   properties:
 *                     url: { type: string, example: 'http://localhost:5000/uploads/resumes/resume-456.pdf' }
 *                     filename: { type: string, example: 'resume-456.pdf' }
 *       400:
 *         description: No file attached or invalid file format
 */
router.post('/resume', uploadResume.single('file'), uploadController.handleResumeUpload);

/**
 * @openapi
 * /api/upload/certificate:
 *   post:
 *     summary: Upload skill or course certificate proof (PDF, Images)
 *     description: Uploads certification proof files for student profile verification.
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - File Uploads
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Certificate document (PDF, JPG, PNG)
 *     responses:
 *       201:
 *         description: Certificate uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: 'Certificate uploaded successfully' }
 *                 data:
 *                   type: object
 *                   properties:
 *                     url: { type: string, example: 'http://localhost:5000/uploads/certificates/cert-789.pdf' }
 */
router.post('/certificate', uploadCertificate.single('file'), uploadController.handleCertificateUpload);

/**
 * @openapi
 * /api/upload/logo:
 *   post:
 *     summary: Upload company logo
 *     description: Uploads brand logo image and updates company profile record.
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - File Uploads
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Company logo image (PNG, JPG, SVG, WebP)
 *     responses:
 *       201:
 *         description: Logo uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: 'Company logo uploaded successfully' }
 *                 data:
 *                   type: object
 *                   properties:
 *                     url: { type: string, example: 'http://localhost:5000/uploads/company-logos/logo-101.png' }
 */
router.post('/logo', uploadCompanyLogo.single('file'), uploadController.handleLogoUpload);

/**
 * @openapi
 * /api/upload/attachment:
 *   post:
 *     summary: Upload direct message chat attachment
 *     description: Uploads document or image attachment for peer/recruiter messaging.
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - File Uploads
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Chat attachment file
 *     responses:
 *       201:
 *         description: Attachment uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: 'Chat attachment uploaded successfully' }
 *                 data:
 *                   type: object
 *                   properties:
 *                     url: { type: string, example: 'http://localhost:5000/uploads/chat-attachments/att-102.pdf' }
 */
router.post('/attachment', uploadChatAttachment.single('file'), uploadController.handleAttachmentUpload);
router.post('/internship-poster', uploadInternshipPoster.single('file'), uploadController.handleInternshipPosterUpload);

export default router;
