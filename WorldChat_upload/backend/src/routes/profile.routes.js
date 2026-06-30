import { Router } from 'express';
import { getProfile, updateProfile } from '../controllers/profile.controller.js';
import { authenticate, requireUser } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { updateProfileSchema } from '../validators/schemas.js';

const router = Router();

router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, requireUser, validate(updateProfileSchema), updateProfile);

export default router;
