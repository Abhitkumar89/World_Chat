import { Router } from 'express';
import authRoutes from './auth.routes.js';
import profileRoutes from './profile.routes.js';
import messageRoutes from './message.routes.js';
import privateRoutes from './private.routes.js';
import uploadRoutes from './upload.routes.js';
import callRoutes from './call.routes.js';

const router = Router();

router.get('/health', (_req, res) =>
  res.json({ success: true, status: 'ok', timestamp: new Date().toISOString() })
);

router.use(authRoutes);
router.use(profileRoutes);
router.use(messageRoutes);
router.use(privateRoutes);
router.use(uploadRoutes);
router.use(callRoutes);

export default router;
