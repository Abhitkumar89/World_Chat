import { Router } from 'express';
import {
  getConversations,
  getPrivateHistory,
  deletePrivateMessage,
} from '../controllers/private.controller.js';
import { authenticate, requireUser } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { privateParamsSchema } from '../validators/schemas.js';

const router = Router();

// All private messaging is for registered users only.
router.use('/private', authenticate, requireUser);

router.get('/private/conversations', getConversations);
router.delete('/private/message/:messageId', deletePrivateMessage);
router.get('/private/:userId', validate(privateParamsSchema, 'params'), getPrivateHistory);

export default router;
