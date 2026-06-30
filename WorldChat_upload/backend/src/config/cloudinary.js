import { v2 as cloudinary } from 'cloudinary';
import { env, isCloudinaryConfigured } from './env.js';
import { logger } from '../utils/logger.js';

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: env.cloudinary.cloudName,
    api_key: env.cloudinary.apiKey,
    api_secret: env.cloudinary.apiSecret,
    secure: true,
  });
  logger.info('Cloudinary configured');
} else {
  logger.warn('Cloudinary not configured - image uploads will be disabled');
}

/**
 * Upload an in-memory buffer to Cloudinary.
 * @param {Buffer} buffer
 * @param {string} filename
 * @returns {Promise<{ url: string, publicId: string }>}
 */
export const uploadBuffer = (buffer, filename = 'image') =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: env.cloudinary.folder,
        resource_type: 'image',
        public_id: `${Date.now()}-${filename}`.replace(/[^a-zA-Z0-9-_]/g, '_'),
      },
      (error, result) => {
        if (error) return reject(error);
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    stream.end(buffer);
  });

/**
 * Permanently delete an asset from Cloudinary.
 * @param {string} publicId
 */
export const deleteAsset = async (publicId) => {
  if (!publicId) return;
  await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
};

export { cloudinary, isCloudinaryConfigured };
