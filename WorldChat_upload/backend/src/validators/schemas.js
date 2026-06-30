import { z } from 'zod';
import { MESSAGE_TYPES, CALL_TYPES } from '../utils/constants.js';

export const googleAuthSchema = z.object({
  idToken: z.string().min(10, 'Firebase ID token is required'),
});

export const guestSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Username must be at least 2 characters')
    .max(40, 'Username must be at most 40 characters'),
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(60).optional(),
  bio: z.string().trim().max(200).optional(),
  status: z.string().trim().max(120).optional(),
  avatar: z.string().url().optional(),
});

export const createMessageSchema = z.object({
  message: z.string().trim().max(2000).optional().default(''),
  messageType: z
    .enum([MESSAGE_TYPES.TEXT, MESSAGE_TYPES.IMAGE])
    .optional()
    .default(MESSAGE_TYPES.TEXT),
  imageUrl: z.string().url().optional(),
  imagePublicId: z.string().optional(),
});

export const getMessagesQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
  before: z.string().datetime().optional(),
});

export const privateParamsSchema = z.object({
  userId: z.string().min(1, 'userId is required'),
});

export const createCallSchema = z.object({
  receiverId: z.string().min(1, 'receiverId is required'),
  callType: z.enum([CALL_TYPES.VOICE, CALL_TYPES.VIDEO]),
});
