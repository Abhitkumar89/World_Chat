import { Router } from 'express';
import { uploadTempImage } from '../controllers/upload.controller.js';
import { authenticate, requireUser } from '../middleware/auth.js';
import { uploadImage } from '../middleware/upload.js';
import { uploadLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/upload', authenticate, requireUser, uploadLimiter, uploadImage, uploadTempImage);

export default router;
