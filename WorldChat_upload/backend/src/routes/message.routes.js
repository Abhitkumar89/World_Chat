import { Router } from 'express';
import { getMessages, createMessage } from '../controllers/message.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createMessageSchema, getMessagesQuerySchema } from '../validators/schemas.js';
import { writeLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.get('/messages', authenticate, validate(getMessagesQuerySchema, 'query'), getMessages);
router.post(
  '/messages',
  authenticate,
  writeLimiter,
  validate(createMessageSchema),
  createMessage
);

export default router;
