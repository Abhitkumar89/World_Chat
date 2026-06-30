import { uploadBuffer, isCloudinaryConfigured } from '../config/cloudinary.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { env } from '../config/env.js';

/**
 * POST /api/upload
 * Registered users only (enforced by route). Uploads a temporary image to Cloudinary
 * and returns the URL plus the expiresAt timestamp the caller should persist.
 */
export const uploadTempImage = asyncHandler(async (req, res) => {
  if (!isCloudinaryConfigured) {
    throw ApiError.badRequest('Image uploads are not configured on the server');
  }
  if (!req.file) {
    throw ApiError.badRequest('No image file provided (field name must be "image")');
  }

  const { url, publicId } = await uploadBuffer(req.file.buffer, req.file.originalname);
  const expiresAt = new Date(Date.now() + env.imageExpiryMinutes * 60 * 1000);

  res.status(201).json({
    success: true,
    imageUrl: url,
    imagePublicId: publicId,
    expiresAt,
    expiresInMinutes: env.imageExpiryMinutes,
  });
});
