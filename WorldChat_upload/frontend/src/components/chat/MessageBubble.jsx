import { motion } from 'framer-motion';
import Avatar from '../common/Avatar.jsx';
import { Icon } from '../common/Icon.jsx';
import { formatTime } from '../../utils/format.js';
import { MESSAGE_TYPES } from '../../config/constants.js';

/**
 * A single chat message. Handles own/other alignment, system messages,
 * images (and the expired placeholder), and an optional delete action.
 */
const MessageBubble = ({ message, isOwn, showAvatar = true, onDelete, onImageClick }) => {
  if (message.messageType === MESSAGE_TYPES.SYSTEM) {
    return (
      <div className="my-2 flex justify-center">
        <span className="rounded-full bg-slate-200/70 px-3 py-1 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-400">
          {message.message}
        </span>
      </div>
    );
  }

  const isImage = message.messageType === MESSAGE_TYPES.IMAGE && message.imageUrl && !message.isExpired;
  const deleted = message.deleted;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className={`group flex items-end gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}
    >
      {showAvatar ? (
        <Avatar name={message.senderName} src={message.senderAvatar} size="sm" />
      ) : (
        <span className="w-9 shrink-0" />
      )}

      <div className={`flex max-w-[75%] flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
        {!isOwn && showAvatar && (
          <span className="mb-0.5 px-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
            {message.senderName}
          </span>
        )}

        <div
          className={`relative rounded-2xl px-3.5 py-2 text-sm shadow-sm ${
            isOwn
              ? 'rounded-br-md bg-brand-600 text-white'
              : 'rounded-bl-md bg-white text-slate-800 dark:bg-slate-800 dark:text-slate-100'
          }`}
        >
          {isImage ? (
            <button onClick={() => onImageClick?.(message.imageUrl)} className="block">
              <img
                src={message.imageUrl}
                alt="shared"
                className="max-h-64 rounded-lg object-cover"
                loading="lazy"
              />
            </button>
          ) : (
            <p className={`whitespace-pre-wrap break-words ${deleted || message.isExpired ? 'italic opacity-70' : ''}`}>
              {message.message}
            </p>
          )}

          <span
            className={`mt-1 block text-right text-[10px] ${
              isOwn ? 'text-white/70' : 'text-slate-400'
            }`}
          >
            {formatTime(message.createdAt)}
          </span>

          {isOwn && onDelete && !deleted && (
            <button
              onClick={() => onDelete(message.id)}
              className="absolute -left-9 top-1/2 hidden -translate-y-1/2 rounded-full bg-slate-200 p-1.5 text-slate-600 group-hover:block hover:bg-red-500 hover:text-white dark:bg-slate-700"
              aria-label="Delete message"
            >
              <Icon name="trash" className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default MessageBubble;
