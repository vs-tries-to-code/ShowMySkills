import { Router } from 'express';
import { mediaController } from '../controllers/mediaController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { uploadMemory } from '../services/uploadService.js';
import { submissionRateLimiter } from '../middleware/security.js';

const router = Router();

// Apply authentication and submission rate limiters
router.use(authMiddleware);
router.use(submissionRateLimiter);

/**
 * @openapi
 * /api/media/upload:
 *   post:
 *     summary: Upload media/files to XyphX Centralized Object Storage
 *     description: Proxies incoming file stream to storage.xyphx.com with product credentials and returns CDN cached URL.
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Centralized Storage
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
 *                 description: Media file to upload (images, documents, videos)
 *               projectId:
 *                 type: string
 *                 description: Optional project ULID or ID
 *               type:
 *                 type: string
 *                 description: Optional file type tag (avatar, resume, project-media)
 *     responses:
 *       201:
 *         description: Media uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: 'File uploaded to centralized storage successfully' }
 *                 data:
 *                   type: object
 *                   properties:
 *                     fileId: { type: string, example: '01M7CXVRXYMHK7TKYZ3Z8K6NBN' }
 *                     url: { type: string, example: 'https://storage.xyphx.com/showmyskills/usr_123/01M7CX.../avatar.png' }
 *                     originalName: { type: string, example: 'avatar.png' }
 *                     mimeType: { type: string, example: 'image/png' }
 *                     sizeBytes: { type: integer, example: 20480 }
 *       400:
 *         description: No file attached or invalid request
 */
router.post('/upload', uploadMemory.single('file'), mediaController.handleMediaUpload);

/**
 * @openapi
 * /api/media/quota:
 *   get:
 *     summary: Retrieve user storage usage and quota
 *     description: Returns storage quota, used bytes, available bytes, and percentage.
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Centralized Storage
 *     responses:
 *       200:
 *         description: Storage quota breakdown
 */
router.get('/quota', mediaController.handleGetQuota);

/**
 * @openapi
 * /api/media/{fileId}:
 *   delete:
 *     summary: Delete file from centralized storage
 *     description: Removes object from showmyskills MinIO bucket via server-to-server microservice API.
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Centralized Storage
 *     parameters:
 *       - in: path
 *         name: fileId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: File deleted successfully
 */
router.delete('/:fileId', mediaController.handleMediaDelete);

export default router;

