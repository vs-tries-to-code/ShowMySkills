import { formatFileUrl } from '../services/uploadService.js';
import User from '../models/User.js';

export const uploadController = {
  // Upload user avatar & optionally attach to profileIcon
  handleAvatarUpload: async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No avatar image uploaded' });
      }

      const fileUrl = formatFileUrl(req, req.file, 'avatars');

      // If user is logged in, auto-update profileIcon
      if (req.user?.id) {
        await User.findByIdAndUpdate(req.user.id, { $set: { profileIcon: fileUrl } });
      }

      res.status(201).json({
        success: true,
        message: 'Avatar uploaded successfully',
        data: {
          url: fileUrl,
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

      const fileUrl = formatFileUrl(req, req.file, 'resumes');

      if (req.user?.id) {
        await User.findByIdAndUpdate(req.user.id, { $set: { resumeUrl: fileUrl } });
      }

      res.status(201).json({
        success: true,
        message: 'Resume uploaded successfully',
        data: {
          url: fileUrl,
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

      const fileUrl = formatFileUrl(req, req.file, 'certificates');

      res.status(201).json({
        success: true,
        message: 'Certificate uploaded successfully',
        data: {
          url: fileUrl,
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

      const fileUrl = formatFileUrl(req, req.file, 'company-logos');

      if (req.user?.id) {
        await User.findByIdAndUpdate(req.user.id, {
          $set: { 'companyProfile.logo': fileUrl, profileIcon: fileUrl },
        });
      }

      res.status(201).json({
        success: true,
        message: 'Company logo uploaded successfully',
        data: {
          url: fileUrl,
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

      const fileUrl = formatFileUrl(req, req.file, 'chat-attachments');

      res.status(201).json({
        success: true,
        message: 'Chat attachment uploaded successfully',
        data: {
          url: fileUrl,
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

      const fileUrl = formatFileUrl(req, req.file, 'internship-posters');

      res.status(201).json({
        success: true,
        message: 'Internship poster uploaded successfully',
        data: {
          url: fileUrl,
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
