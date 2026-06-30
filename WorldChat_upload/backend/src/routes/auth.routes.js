import { Router } from 'express';
import { googleAuth, createGuest } from '../controllers/auth.controller.js';
import { validate } from '../middleware/validate.js';
import { googleAuthSchema, guestSchema } from '../validators/schemas.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/auth/google', authLimiter, validate(googleAuthSchema), googleAuth);
router.post('/guest', authLimiter, validate(guestSchema), createGuest);

export default router;
