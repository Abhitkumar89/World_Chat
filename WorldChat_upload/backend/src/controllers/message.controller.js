import { Message } from '../models/Message.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { MESSAGE_TYPES, ROLES, EXPIRED_IMAGE_TEXT } from '../utils/constants.js';

const serialize = (doc) => ({
  id: doc._id.toString(),
  senderId: doc.senderId,
  senderName: doc.senderName,
  senderAvatar: doc.senderAvatar,
  senderRole: doc.senderRole,
  receiverId: doc.receiverId,
  message: doc.isExpired ? EXPIRED_IMAGE_TEXT : doc.message,
  messageType: doc.messageType,
  imageUrl: doc.imageUrl,
  expiresAt: doc.expiresAt,
  isExpired: doc.isExpired,
  createdAt: doc.createdAt,
});

/**
 * GET /api/messages
 * Global chat history (paginated, newest-first then reversed for display).
 * Guests are intentionally blocked from history per product spec.
 */
export const getMessages = asyncHandler(async (req, res) => {
  if (req.auth?.role === ROLES.GUEST) {
    throw ApiError.forbidden('Guests cannot view chat history. Sign in to access history.');
  }

  const { limit, before } = req.query;
  const filter = { receiverId: null };
  if (before) filter.createdAt = { $lt: new Date(before) };

  const docs = await Message.find(filter).sort({ createdAt: -1 }).limit(limit);
  const messages = docs.reverse().map(serialize);

  res.json({ success: true, messages });
});

/**
 * POST /api/messages
 * Create a global message via REST (sockets are the primary path, this is a fallback).
 */
export const createMessage = asyncHandler(async (req, res) => {
  const { message, messageType, imageUrl, imagePublicId } = req.body;

  if (messageType === MESSAGE_TYPES.IMAGE && req.auth.role === ROLES.GUEST) {
    throw ApiError.forbidden('Guests cannot send images');
  }
  if (messageType === MESSAGE_TYPES.TEXT && !message?.trim()) {
    throw ApiError.badRequest('Message cannot be empty');
  }

  const doc = await Message.create({
    senderId: req.auth.id,
    senderName: req.auth.name,
    senderRole: req.auth.role,
    receiverId: null,
    message: message || '',
    messageType,
    imageUrl: imageUrl || '',
    imagePublicId: imagePublicId || '',
  });

  res.status(201).json({ success: true, message: serialize(doc) });
});
