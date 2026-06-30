import { PrivateMessage, buildConversationId } from '../models/PrivateMessage.js';
import { User } from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { EXPIRED_IMAGE_TEXT } from '../utils/constants.js';

const serialize = (doc) => ({
  id: doc._id.toString(),
  conversationId: doc.conversationId,
  senderId: doc.senderId,
  senderName: doc.senderName,
  senderAvatar: doc.senderAvatar,
  receiverId: doc.receiverId,
  message: doc.deleted
    ? 'This message was deleted'
    : doc.isExpired
      ? EXPIRED_IMAGE_TEXT
      : doc.message,
  messageType: doc.messageType,
  imageUrl: doc.deleted ? '' : doc.imageUrl,
  expiresAt: doc.expiresAt,
  isExpired: doc.isExpired,
  deleted: doc.deleted,
  readAt: doc.readAt,
  createdAt: doc.createdAt,
});

/**
 * GET /api/private/conversations
 * List the registered user's recent one-to-one conversations with last message preview.
 */
export const getConversations = asyncHandler(async (req, res) => {
  const me = req.auth.id;

  const recent = await PrivateMessage.aggregate([
    { $match: { $or: [{ senderId: me }, { receiverId: me }] } },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: '$conversationId',
        lastMessage: { $first: '$$ROOT' },
      },
    },
    { $sort: { 'lastMessage.createdAt': -1 } },
    { $limit: 50 },
  ]);

  const conversations = await Promise.all(
    recent.map(async ({ _id, lastMessage }) => {
      const otherId = lastMessage.senderId === me ? lastMessage.receiverId : lastMessage.senderId;
      const other = await User.findById(otherId).lean();
      return {
        conversationId: _id,
        user: other
          ? { id: otherId, name: other.name, avatar: other.avatar }
          : { id: otherId, name: 'Unknown user', avatar: '' },
        lastMessage: serialize(lastMessage),
      };
    })
  );

  res.json({ success: true, conversations });
});

/**
 * GET /api/private/:userId
 * Full message history between the current user and :userId.
 */
export const getPrivateHistory = asyncHandler(async (req, res) => {
  const me = req.auth.id;
  const { userId } = req.params;

  const other = await User.findById(userId).lean();
  if (!other) throw ApiError.notFound('User not found');

  const conversationId = buildConversationId(me, userId);
  const docs = await PrivateMessage.find({ conversationId }).sort({ createdAt: 1 }).limit(200);

  // Mark unread inbound messages as read.
  await PrivateMessage.updateMany(
    { conversationId, receiverId: me, readAt: null },
    { $set: { readAt: new Date() } }
  );

  res.json({
    success: true,
    conversationId,
    user: { id: userId, name: other.name, avatar: other.avatar, status: other.status },
    messages: docs.map(serialize),
  });
});

/**
 * DELETE /api/private/message/:messageId
 * Soft-delete a message the requester sent.
 */
export const deletePrivateMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const doc = await PrivateMessage.findById(messageId);
  if (!doc) throw ApiError.notFound('Message not found');
  if (doc.senderId !== req.auth.id) {
    throw ApiError.forbidden('You can only delete your own messages');
  }

  doc.deleted = true;
  doc.message = '';
  doc.imageUrl = '';
  await doc.save();

  res.json({ success: true, messageId, conversationId: doc.conversationId });
});

export const serializePrivate = serialize;
