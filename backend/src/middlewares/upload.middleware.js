import multer from 'multer';
import { ApiError } from '../utils/apiError.js';

// Use memory storage so files are held in RAM buffer for direct streaming to Cloudinary
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Accept images and videos
  if (
    file.mimetype.startsWith('image/') ||
    file.mimetype.startsWith('video/')
  ) {
    cb(null, true);
  } else {
    cb(new ApiError(400, 'Unsupported file format. Only images and videos are allowed.'), false);
  }
};

export const uploadMedia = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100 MB max for videos/photos
  }
});
