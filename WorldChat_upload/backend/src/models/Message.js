import mongoose from 'mongoose';
import { MESSAGE_TYPES } from '../utils/constants.js';

/**
 * Global chat message. Matches the requested schema:
 * senderId, senderName, receiverId, message, messageType, imageUrl, expiresAt, createdAt.
 * receiverId is null for the global room.
 */
const messageSchema = new mongoose.Schema(
  {
    senderId: { type: String, required: true, index: true },
    senderName: { type: String, required: true },
    senderAvatar: { type: String, default: '' },
    senderRole: { type: String, enum: ['guest', 'user'], default: 'guest' },
    receiverId: { type: String, default: null },
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
  },
  { timestamps: true }
);

messageSchema.index({ createdAt: -1 });

export const Message = mongoose.model('Message', messageSchema);
