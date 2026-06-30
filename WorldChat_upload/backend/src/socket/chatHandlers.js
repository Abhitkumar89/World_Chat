import { Message } from '../models/Message.js';
import { PrivateMessage, buildConversationId } from '../models/PrivateMessage.js';
import { serializePrivate } from '../controllers/private.controller.js';
import { SOCKET_EVENTS, MESSAGE_TYPES, ROLES } from '../utils/constants.js';
import { logger } from '../utils/logger.js';

const GLOBAL_ROOM = 'global';

const serializeGlobal = (doc) => ({
  id: doc._id.toString(),
  senderId: doc.senderId,
  senderName: doc.senderName,
  senderAvatar: doc.senderAvatar,
  senderRole: doc.senderRole,
  receiverId: null,
  message: doc.message,
  messageType: doc.messageType,
  imageUrl: doc.imageUrl,
  expiresAt: doc.expiresAt,
  isExpired: doc.isExpired,
  createdAt: doc.createdAt,
});

/**
 * Register global + private chat and typing handlers for a connected socket.
 */
export const registerChatHandlers = (io, socket) => {
  const { id: userId, role, name } = socket.user;

  socket.join(GLOBAL_ROOM);

  // ---- Global chat ----
  socket.on(SOCKET_EVENTS.GLOBAL_MESSAGE, async (payload, ack) => {
    try {
      const { message = '', messageType = MESSAGE_TYPES.TEXT, imageUrl, imagePublicId, expiresAt } =
        payload || {};

      if (messageType === MESSAGE_TYPES.IMAGE && role === ROLES.GUEST) {
        return ack?.({ success: false, error: 'Guests cannot send images' });
      }
      if (messageType === MESSAGE_TYPES.TEXT && !message.trim()) {
        return ack?.({ success: false, error: 'Message cannot be empty' });
      }

      const doc = await Message.create({
        senderId: userId,
        senderName: name,
        senderAvatar: socket.profile?.avatar || '',
        senderRole: role,
        receiverId: null,
        message: message.slice(0, 2000),
        messageType,
        imageUrl: imageUrl || '',
        imagePublicId: imagePublicId || '',
        expiresAt: messageType === MESSAGE_TYPES.IMAGE && expiresAt ? new Date(expiresAt) : null,
      });

      const serialized = serializeGlobal(doc);
      io.to(GLOBAL_ROOM).emit(SOCKET_EVENTS.GLOBAL_MESSAGE_NEW, serialized);
      ack?.({ success: true, message: serialized });
    } catch (err) {
      logger.error('global_message failed', err);
      ack?.({ success: false, error: 'Failed to send message' });
    }
  });

  // ---- Private chat (registered users only) ----
  socket.on(SOCKET_EVENTS.PRIVATE_MESSAGE, async (payload, ack) => {
    try {
      if (role !== ROLES.USER) {
        return ack?.({ success: false, error: 'Only registered users can send private messages' });
      }
      const {
        receiverId,
        message = '',
        messageType = MESSAGE_TYPES.TEXT,
        imageUrl,
        imagePublicId,
        expiresAt,
      } = payload || {};

      if (!receiverId) return ack?.({ success: false, error: 'receiverId is required' });
      if (messageType === MESSAGE_TYPES.TEXT && !message.trim()) {
        return ack?.({ success: false, error: 'Message cannot be empty' });
      }

      const conversationId = buildConversationId(userId, receiverId);
      const doc = await PrivateMessage.create({
        conversationId,
        senderId: userId,
        senderName: name,
        senderAvatar: socket.profile?.avatar || '',
        receiverId,
        message: message.slice(0, 2000),
        messageType,
        imageUrl: imageUrl || '',
        imagePublicId: imagePublicId || '',
        expiresAt: messageType === MESSAGE_TYPES.IMAGE && expiresAt ? new Date(expiresAt) : null,
      });

      const serialized = serializePrivate(doc);
      const room = `pm:${conversationId}`;
      socket.join(room);
      io.to(room).emit(SOCKET_EVENTS.PRIVATE_MESSAGE_NEW, serialized);
      // Also notify the receiver's personal room so they get a toast even if not in the room.
      io.to(`user:${receiverId}`).emit(SOCKET_EVENTS.PRIVATE_MESSAGE_NEW, serialized);

      ack?.({ success: true, message: serialized });
    } catch (err) {
      logger.error('private_message failed', err);
      ack?.({ success: false, error: 'Failed to send message' });
    }
  });

  // Join a private conversation room (so both parties receive realtime updates).
  socket.on('private:join', ({ conversationId } = {}) => {
    if (conversationId) socket.join(`pm:${conversationId}`);
  });

  socket.on(SOCKET_EVENTS.MESSAGE_DELETED, ({ messageId, conversationId } = {}) => {
    if (conversationId) {
      io.to(`pm:${conversationId}`).emit(SOCKET_EVENTS.MESSAGE_DELETED, { messageId, conversationId });
    }
  });

  // ---- Typing indicator ----
  socket.on(SOCKET_EVENTS.TYPING, ({ scope = 'global', conversationId, isTyping } = {}) => {
    const data = { userId, name, isTyping: Boolean(isTyping) };
    if (scope === 'private' && conversationId) {
      socket.to(`pm:${conversationId}`).emit(SOCKET_EVENTS.TYPING_UPDATE, { ...data, conversationId });
    } else {
      socket.to(GLOBAL_ROOM).emit(SOCKET_EVENTS.TYPING_UPDATE, { ...data, scope: 'global' });
    }
  });
};
