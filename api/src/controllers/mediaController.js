import storageService from '../services/storageService.js';
import User from '../models/User.js';

export const mediaController = {
  /**
   * Upload file directly to XyphX Centralized Storage
   * Endpoint: POST /api/media/upload
   * Payload: multipart/form-data with 'file', optional 'projectId', optional 'userId'
   */
  handleMediaUpload: async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file attached. Please attach a file using the form field "file".',
        });
      }

      const userId = req.user?.id || req.body?.userId || 'usr_anonymous';
      const projectId = req.body?.projectId || req.query?.projectId || undefined;

      const uploadResult = await storageService.uploadFile({
        userId,
        buffer: req.file.buffer,
        fileName: req.file.originalname,
        mimeType: req.file.mimetype,
        projectId,
      });

      // If user uploaded an avatar or profile media, update User profileIcon optionally
      if (req.user?.id && req.body?.type === 'avatar') {
        await User.findByIdAndUpdate(req.user.id, {
          $set: {
            profileIcon: uploadResult.url,
            profileIconFileId: uploadResult.fileId,
          },
        });
      } else if (req.user?.id && req.body?.type === 'resume') {
        await User.findByIdAndUpdate(req.user.id, {
          $set: {
            resumeUrl: uploadResult.url,
            resumeFileId: uploadResult.fileId,
          },
        });
      }

      return res.status(201).json({
        success: true,
        message: 'File uploaded to centralized storage successfully',
        data: {
          fileId: uploadResult.fileId,
          url: uploadResult.url,
          originalName: uploadResult.originalName,
          mimeType: uploadResult.mimeType,
          sizeBytes: uploadResult.sizeBytes,
          storage: uploadResult.storage,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete file from XyphX Centralized Storage
   * Also clears the matching fileId reference in the User document.
   * Endpoint: DELETE /api/media/:fileId
   */
  handleMediaDelete: async (req, res, next) => {
    try {
      const { fileId } = req.params;
      const userId = req.user?.id || req.body?.userId;

      if (!fileId) {
        return res.status(400).json({
          success: false,
          message: 'fileId is required in path parameter.',
        });
      }

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'userId is required to delete file from centralized storage.',
        });
      }

      const deleteResult = await storageService.deleteFile(fileId, userId);

      // --- DB Reference Cleanup ---
      // Clear any matching fileId stored on the authenticated user's document
      if (req.user?.id) {
        try {
          const user = await User.findById(req.user.id).select(
            'profileIconFileId resumeFileId companyProfile.logoFileId certifications achievements projects'
          ).lean();

          if (user) {
            const $unset = {};
            const $pull = {};

            if (user.profileIconFileId === fileId) {
              $unset.profileIconFileId = '';
              $unset.profileIcon = '';
            }
            if (user.resumeFileId === fileId) {
              $unset.resumeFileId = '';
              $unset.resumeUrl = '';
            }
            if (user.companyProfile?.logoFileId === fileId) {
              $unset['companyProfile.logoFileId'] = '';
              $unset['companyProfile.logo'] = '';
              $unset.profileIcon = '';
            }

            const ops = {};
            if (Object.keys($unset).length) ops.$unset = $unset;

            if (Object.keys(ops).length) {
              await User.findByIdAndUpdate(req.user.id, ops);
            }

            // Pull matching fileId from arrays (certifications, achievements, projects)
            await User.findByIdAndUpdate(req.user.id, {
              $pull: {
                certifications: { certificateFileId: fileId },
                achievements: { proofFileId: fileId },
                projects: { fileId },
              },
            });
          }
        } catch (cleanupErr) {
          console.warn('[MediaController] DB cleanup after delete failed:', cleanupErr.message);
        }
      }

      return res.status(200).json({
        success: true,
        message: 'File deleted from centralized storage successfully',
        data: deleteResult,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get user storage quota and usage breakdown
   * Endpoint: GET /api/media/quota
   */
  handleGetQuota: async (req, res, next) => {
    try {
      const userId = req.user?.id || req.query?.userId;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'userId is required to fetch storage quota.',
        });
      }

      const quota = await storageService.getUserQuota(userId);

      return res.status(200).json({
        success: true,
        data: quota,
      });
    } catch (error) {
      next(error);
    }
  },
};

export default mediaController;

