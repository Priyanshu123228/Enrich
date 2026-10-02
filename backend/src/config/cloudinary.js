import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

const UPLOADS_DIR = path.resolve(__dirname, '../../uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

/**
 * Upload buffer to Cloudinary with automatic resilient local disk fallback
 * @param {Buffer} buffer - File buffer from Multer memoryStorage
 * @param {Object} options - { folder, resource_type: 'image' | 'video' | 'auto', originalname, mimetype }
 */
export const uploadToCloudinary = async (buffer, options = {}) => {
  const isCloudinaryConfigured =
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET;

  if (isCloudinaryConfigured) {
    try {
      const result = await new Promise((resolve, reject) => {
        const defaultOptions = {
          folder: options.folder || 'luxeparlour/gallery',
          resource_type: options.resource_type || 'auto',
          quality: 'auto:good',
          fetch_format: 'auto'
        };

        const uploadStream = cloudinary.uploader.upload_stream(
          { ...defaultOptions, ...options },
          (error, res) => {
            if (error) return reject(error);
            resolve(res);
          }
        );

        uploadStream.end(buffer);
      });

      return result;
    } catch (err) {
      console.warn('⚠️ Cloudinary upload encountered an issue. Falling back to local storage:', err.message);
    }
  }

  // Resilient Local Storage Fallback
  const ext = options.mimetype
    ? options.mimetype.split('/')[1]?.replace('jpeg', 'jpg') || 'jpg'
    : 'jpg';
  const filename = `file_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
  const filePath = path.join(UPLOADS_DIR, filename);

  fs.writeFileSync(filePath, buffer);

  const serverPort = process.env.PORT || 5000;
  const baseUrl = process.env.SERVER_URL || `http://localhost:${serverPort}`;
  const fileUrl = `${baseUrl}/uploads/${filename}`;

  return {
    secure_url: fileUrl,
    url: fileUrl,
    public_id: `local_${filename}`,
    format: ext,
    resource_type: options.resource_type || 'image'
  };
};

/**
 * Delete asset from Cloudinary or local storage
 * @param {string} publicId
 * @param {string} resource_type
 */
export const deleteFromCloudinary = async (publicId, resource_type = 'image') => {
  if (!publicId) return null;

  if (publicId.startsWith('local_')) {
    const filename = publicId.replace('local_', '');
    const filePath = path.join(UPLOADS_DIR, filename);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.warn('Local file cleanup error:', err.message);
      }
    }
    return true;
  }

  try {
    return await cloudinary.uploader.destroy(publicId, { resource_type });
  } catch (err) {
    console.error(`Failed to delete asset ${publicId} from Cloudinary:`, err);
    return null;
  }
};

export default cloudinary;

