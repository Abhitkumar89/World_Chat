import mongoose from 'mongoose';
import { MESSAGE_TYPES } from '../utils/constants.js';

/**
 * One-to-one message between two registered users.
 * `conversationId` is a deterministic sorted pair key for efficient history queries.
 */
const privateMessageSchema = new mongoose.Schema(
  {
    conversationId: { type: String, required: true, index: true },
    senderId: { type: String, required: true, index: true },
    senderName: { type: String, required: true },
    senderAvatar: { type: String, default: '' },
    receiverId: { type: String, required: true, index: true },
    message: { type: String, default: '' },
    messageType: {
      type: String,
      enum: Object.values(MESSAGE_TYPES),
      default: MESSAGE_TYPES.TEXT,
    },
    imageUrl: { type: String, default: '' },
    imagePublicId: { type: String, default: '' },
    expiresAt: { type: Date, default: null },
    isExpired: { type: Boolean, default: false },
    deleted: { type: Boolean, default: false },
    readAt: { type: Date, default: null },
  },
  { timestamps: true }
);

privateMessageSchema.index({ conversationId: 1, createdAt: -1 });

/** Deterministic conversation id from two user ids. */
export const buildConversationId = (a, b) => [a, b].sort().join('__');

export const PrivateMessage = mongoose.model('PrivateMessage', privateMessageSchema);
