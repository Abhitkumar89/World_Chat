import { Message } from '../models/Message.js';
import { PrivateMessage } from '../models/PrivateMessage.js';
import { deleteAsset, isCloudinaryConfigured } from '../config/cloudinary.js';
import { logger } from '../utils/logger.js';
import { EXPIRED_IMAGE_TEXT, MESSAGE_TYPES, SOCKET_EVENTS } from '../utils/constants.js';
import { buildConversationId } from '../models/PrivateMessage.js';

/**
 * Find every image message whose expiresAt has passed, delete the asset from
 * Cloudinary, and rewrite the document so the UI shows "This image has expired."
 * Returns the ids that changed so callers can broadcast over sockets.
 */
export const expireImages = async (io) => {
  const now = new Date();
  const query = {
    messageType: MESSAGE_TYPES.IMAGE,
    isExpired: false,
    expiresAt: { $ne: null, $lte: now },
  };

  const [globalDocs, privateDocs] = await Promise.all([
    Message.find(query).limit(200),
    PrivateMessage.find(query).limit(200),
  ]);

  const all = [...globalDocs, ...privateDocs];
  if (all.length === 0) return 0;

  await Promise.all(
    all.map(async (doc) => {
      if (isCloudinaryConfigured && doc.imagePublicId) {
        try {
          await deleteAsset(doc.imagePublicId);
        } catch (err) {
          logger.warn(`Failed deleting Cloudinary asset ${doc.imagePublicId}`, err.message);
        }
      }
      doc.isExpired = true;
      doc.imageUrl = '';
      doc.imagePublicId = '';
      doc.messageType = MESSAGE_TYPES.TEXT;
      doc.message = EXPIRED_IMAGE_TEXT;
      await doc.save();
    })
  );

  if (io) {
    globalDocs.forEach((doc) =>
      io.to('global').emit(SOCKET_EVENTS.IMAGE_EXPIRED, {
        messageId: doc._id.toString(),
        scope: 'global',
        text: EXPIRED_IMAGE_TEXT,
      })
    );
    privateDocs.forEach((doc) => {
      const room = buildConversationId(doc.senderId, doc.receiverId);
      io.to(`pm:${room}`).emit(SOCKET_EVENTS.IMAGE_EXPIRED, {
        messageId: doc._id.toString(),
        scope: 'private',
        conversationId: room,
        text: EXPIRED_IMAGE_TEXT,
      });
    });
  }

  logger.info(`Expired ${all.length} image message(s)`);
  return all.length;
};
