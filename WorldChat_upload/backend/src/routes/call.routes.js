import { Router } from 'express';
import { createCall, getCallHistory } from '../controllers/call.controller.js';
import { authenticate, requireUser } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createCallSchema } from '../validators/schemas.js';

const router = Router();

router.post('/call', authenticate, requireUser, validate(createCallSchema), createCall);
router.get('/call/history', authenticate, requireUser, getCallHistory);

export default router;
