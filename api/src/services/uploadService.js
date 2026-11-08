import fs from 'node:fs';
import path from 'node:path';
import multer from 'multer';

// Ensure base upload directories exist
const uploadFolders = [
  'uploads/resumes',
  'uploads/avatars',
  'uploads/certificates',
  'uploads/company-logos',
  'uploads/chat-attachments',
  'uploads/college-ids',
  'uploads/admin-photos',
  'uploads/internship-posters',
];

for (const folder of uploadFolders) {
  const fullPath = path.join(process.cwd(), folder);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
}

// Storage engine factory with safe sanitized filenames
const createStorage = (subfolder) =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      const dest = path.join(process.cwd(), 'uploads', subfolder);
      cb(null, dest);
    },
    filename: (req, file, cb) => {
      const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const ext = path.extname(sanitizedName);
      const base = path.basename(sanitizedName, ext).slice(0, 30);
      cb(null, `${base}-${uniqueSuffix}${ext}`);
    },
  });

// Allowed file filters
const imageFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file format. Only JPEG, PNG, WebP, and SVG images are allowed.'));
  }
};

const documentFilter = (req, file, cb) => {
  const allowed = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid document format. Only PDF, DOC, and DOCX files are allowed.'));
  }
};

const mixedProofFilter = (req, file, cb) => {
  const allowed = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
  ];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file format. Only PDF, JPEG, and PNG proofs are allowed.'));
  }
};

// Multer upload instances
export const uploadAvatar = multer({
  storage: createStorage('avatars'),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: imageFilter,
});

export const uploadResume = multer({
  storage: createStorage('resumes'),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: documentFilter,
});

export const uploadCertificate = multer({
  storage: createStorage('certificates'),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: mixedProofFilter,
});

export const uploadCompanyLogo = multer({
  storage: createStorage('company-logos'),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: imageFilter,
});

export const uploadChatAttachment = multer({
  storage: createStorage('chat-attachments'),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: mixedProofFilter,
});

export const uploadInternshipPoster = multer({
  storage: createStorage('internship-posters'),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: imageFilter,
});

export const formatFileUrl = (req, file, subfolder) => {
  const baseUrl = process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 5000}/api`;
  const rootUrl = baseUrl.replace(/\/api\/?$/, '');
  return `${rootUrl}/uploads/${subfolder}/${file.filename}`;
};
