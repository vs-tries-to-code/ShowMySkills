import fs from 'node:fs';
import { formatFileUrl } from '../services/uploadService.js';
import storageService from '../services/storageService.js';
import User from '../models/User.js';
import Internship from '../models/Internship.js';

/**
 * Silently delete an old file from centralized storage.
 * Never throws — just warns on failure.
 */
async function deleteOldFileFromStorage(fileId, userId) {
  if (!fileId || !storageService.isConfigured()) return;
  try {
    await storageService.deleteFile(fileId, userId);
  } catch (err) {
    console.warn(`[StorageService] Failed to delete old file ${fileId}:`, err.message);
  }
}

/**
 * Helper to upload a locally-saved multer file to XyphX Centralized Storage
 * with automatic fallback to local URL if offline or unconfigured.
 */
async function processUploadToCentralizedStorage(req, subfolder) {
  let fileUrl = formatFileUrl(req, req.file, subfolder);
  let fileId = null;

  if (storageService.isConfigured() && req.file?.path) {
    try {
      const buffer = await fs.promises.readFile(req.file.path);
      const userId = req.user?.id || 'usr_anonymous';
      const result = await storageService.uploadFile({
        userId,
        buffer,
        fileName: req.file.originalname || req.file.filename,
        mimeType: req.file.mimetype,
      });
      if (result?.url) {
        fileUrl = result.url;
        fileId = result.fileId;
      }
    } catch (storageErr) {
      console.warn(`[StorageService] Centralized upload fallback to local for ${subfolder}:`, storageErr.message);
    }
  }

  return { fileUrl, fileId };
}

export const uploadController = {
  // Upload user avatar & optionally attach to profileIcon
  handleAvatarUpload: async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No avatar image uploaded' });
      }

      // Delete old avatar from centralized storage before replacing
      if (req.user?.id) {
        const existing = await User.findById(req.user.id).select('profileIconFileId').lean();
        await deleteOldFileFromStorage(existing?.profileIconFileId, req.user.id);
      }

      const { fileUrl, fileId } = await processUploadToCentralizedStorage(req, 'avatars');

      // If user is logged in, auto-update profileIcon
      if (req.user?.id) {
        const updateFields = { profileIcon: fileUrl };
        if (fileId) updateFields.profileIconFileId = fileId;
        await User.findByIdAndUpdate(req.user.id, { $set: updateFields });
      }

      res.status(201).json({
        success: true,
        message: 'Avatar uploaded successfully',
        data: {
          url: fileUrl,
          fileId,
          filename: req.file.filename,
          size: req.file.size,
          mimetype: req.file.mimetype,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // Upload candidate resume & optionally attach to resumeUrl
  handleResumeUpload: async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No resume document uploaded' });
      }

      // Delete old resume from centralized storage before replacing
      if (req.user?.id) {
        const existing = await User.findById(req.user.id).select('resumeFileId').lean();
        await deleteOldFileFromStorage(existing?.resumeFileId, req.user.id);
      }

      const { fileUrl, fileId } = await processUploadToCentralizedStorage(req, 'resumes');

      if (req.user?.id) {
        const updateFields = { resumeUrl: fileUrl };
        if (fileId) updateFields.resumeFileId = fileId;
        await User.findByIdAndUpdate(req.user.id, { $set: updateFields });
      }

      res.status(201).json({
        success: true,
        message: 'Resume uploaded successfully',
        data: {
          url: fileUrl,
          fileId,
          filename: req.file.filename,
          size: req.file.size,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // Upload certification proof document
  handleCertificateUpload: async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No certificate document uploaded' });
      }

      const { fileUrl, fileId } = await processUploadToCentralizedStorage(req, 'certificates');

      res.status(201).json({
        success: true,
        message: 'Certificate uploaded successfully',
        data: {
          url: fileUrl,
          fileId,
          filename: req.file.filename,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // Upload company brand logo
  handleLogoUpload: async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No logo image uploaded' });
      }

      // Delete old logo from centralized storage before replacing
      if (req.user?.id) {
        const existing = await User.findById(req.user.id).select('companyProfile.logoFileId profileIconFileId').lean();
        const oldFileId = existing?.companyProfile?.logoFileId || existing?.profileIconFileId;
        await deleteOldFileFromStorage(oldFileId, req.user.id);
      }

      const { fileUrl, fileId } = await processUploadToCentralizedStorage(req, 'company-logos');

      if (req.user?.id) {
        const updateFields = {
          'companyProfile.logo': fileUrl,
          profileIcon: fileUrl,
        };
        if (fileId) {
          updateFields['companyProfile.logoFileId'] = fileId;
          updateFields.profileIconFileId = fileId;
        }
        await User.findByIdAndUpdate(req.user.id, { $set: updateFields });
      }

      res.status(201).json({
        success: true,
        message: 'Company logo uploaded successfully',
        data: {
          url: fileUrl,
          fileId,
          filename: req.file.filename,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // Upload chat attachment
  handleAttachmentUpload: async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No attachment uploaded' });
      }

      const { fileUrl, fileId } = await processUploadToCentralizedStorage(req, 'chat-attachments');

      res.status(201).json({
        success: true,
        message: 'Chat attachment uploaded successfully',
        data: {
          url: fileUrl,
          fileId,
          filename: req.file.filename,
          size: req.file.size,
          mimetype: req.file.mimetype,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // Upload internship poster image
  handleInternshipPosterUpload: async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No poster image uploaded' });
      }

      const { fileUrl, fileId } = await processUploadToCentralizedStorage(req, 'internship-posters');

      res.status(201).json({
        success: true,
        message: 'Internship poster uploaded successfully',
        data: {
          url: fileUrl,
          fileId,
          filename: req.file.filename,
          size: req.file.size,
          mimetype: req.file.mimetype,
        },
      });
    } catch (error) {
      next(error);
    }
  },
};

export default uploadController;
