import { useEffect, useRef, useState } from 'react';
import MessageBubble from './MessageBubble.jsx';
import { MessageSkeleton } from '../common/Skeletons.jsx';
import Modal from '../common/Modal.jsx';
import { formatDayLabel } from '../../utils/format.js';
import { MESSAGE_TYPES } from '../../config/constants.js';

const DaySeparator = ({ label }) => (
  <div className="my-3 flex items-center justify-center">
    <span className="rounded-full bg-slate-200/70 px-3 py-1 text-[11px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
      {label}
    </span>
  </div>
);

/**
 * Scrollable message list with auto-scroll-to-latest, day separators and an
 * image lightbox. Auto-scroll pauses if the user has scrolled up to read history.
 */
const MessageList = ({ messages, loading, currentUserId, onDelete, emptyState }) => {
  const bottomRef = useRef(null);
  const containerRef = useRef(null);
  const [lightbox, setLightbox] = useState(null);
  const [autoScroll, setAutoScroll] = useState(true);

  useEffect(() => {
    if (autoScroll) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, autoScroll]);

  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    setAutoScroll(nearBottom);
  };

  if (loading) return <MessageSkeleton />;

  if (!messages.length) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-8 text-center text-slate-400">
        {emptyState || 'No messages yet. Say hello!'}
      </div>
    );
  }

  let lastDay = null;

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 space-y-1.5 overflow-y-auto px-4 py-4"
    >
      {messages.map((msg, idx) => {
        const day = formatDayLabel(msg.createdAt);
        const showDay = day !== lastDay;
        lastDay = day;

        const prev = messages[idx - 1];
        const isOwn = msg.senderId === currentUserId;
        const showAvatar =
          msg.messageType === MESSAGE_TYPES.SYSTEM ||
          !prev ||
          prev.senderId !== msg.senderId ||
          prev.messageType === MESSAGE_TYPES.SYSTEM;

        return (
          <div key={msg.id}>
            {showDay && msg.messageType !== MESSAGE_TYPES.SYSTEM && <DaySeparator label={day} />}
            <MessageBubble
              message={msg}
              isOwn={isOwn}
              showAvatar={showAvatar}
              onDelete={onDelete}
              onImageClick={(url) => setLightbox(url)}
            />
          </div>
        );
      })}
      <div ref={bottomRef} />

      <Modal open={Boolean(lightbox)} onClose={() => setLightbox(null)} maxWidth="max-w-3xl">
        {lightbox && <img src={lightbox} alt="preview" className="max-h-[75vh] w-full rounded-xl object-contain" />}
      </Modal>
    </div>
  );
};

export default MessageList;
