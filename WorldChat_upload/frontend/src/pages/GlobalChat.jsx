import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import ChatHeader from '../components/chat/ChatHeader.jsx';
import MessageList from '../components/chat/MessageList.jsx';
import MessageInput from '../components/chat/MessageInput.jsx';
import TypingIndicator from '../components/chat/TypingIndicator.jsx';
import OnlineUsers from '../components/sidebar/OnlineUsers.jsx';
import { useGlobalChat } from '../hooks/useGlobalChat.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useSocket } from '../context/SocketContext.jsx';
import { useLayout } from '../components/layout/layoutContext.js';

const GlobalChat = () => {
  const { user, isUser } = useAuth();
  const { onlineUsers } = useSocket();
  const { openSidebar } = useLayout();
  const navigate = useNavigate();
  const { messages, loadingHistory, typingUsers, sendMessage, emitTyping } = useGlobalChat();
  const [showUsers, setShowUsers] = useState(false);

  return (
    <div className="flex h-full min-h-0">
      <div className="flex min-w-0 flex-1 flex-col">
        <ChatHeader
          title="Global Chat"
          subtitle={`${onlineUsers.length} online`}
          onMenu={openSidebar}
          onToggleUsers={() => setShowUsers((s) => !s)}
        />

        <MessageList
          messages={messages}
          loading={loadingHistory}
          currentUserId={user?.id}
          emptyState={
            <div className="space-y-1">
              <p className="text-lg font-semibold">Welcome to the Global Chat 🌍</p>
              <p className="text-sm">
                {isUser
                  ? 'Be the first to start the conversation.'
                  : 'Send a message to say hello to everyone online.'}
              </p>
            </div>
          }
        />

        <TypingIndicator users={typingUsers} />
        <MessageInput onSend={sendMessage} onTyping={emitTyping} canUploadImage={isUser} />
      </div>

      {/* Online users panel: persistent on large screens, toggle on smaller */}
      <div className="hidden w-72 border-l border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900 lg:block">
        <OnlineUsers users={onlineUsers} onSelectUser={(u) => navigate(`/chat/${u.id}`)} />
      </div>

      <AnimatePresence>
        {showUsers && (
          <>
            <motion.div
              className="fixed inset-0 z-30 bg-black/40 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowUsers(false)}
            />
            <motion.div
              className="fixed inset-y-0 right-0 z-40 w-72 max-w-[85vw] border-l border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900 lg:hidden"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <OnlineUsers
                users={onlineUsers}
                onSelectUser={(u) => {
                  setShowUsers(false);
                  navigate(`/chat/${u.id}`);
                }}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GlobalChat;
