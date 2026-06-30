import { useParams } from 'react-router-dom';
import ChatHeader from '../components/chat/ChatHeader.jsx';
import MessageList from '../components/chat/MessageList.jsx';
import MessageInput from '../components/chat/MessageInput.jsx';
import TypingIndicator from '../components/chat/TypingIndicator.jsx';
import { usePrivateChat } from '../hooks/usePrivateChat.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useLayout } from '../components/layout/layoutContext.js';

const PrivateChat = () => {
  const { userId } = useParams();
  const { user } = useAuth();
  const { openSidebar } = useLayout();
  const { messages, peer, loading, peerTyping, sendMessage, deleteMessage, emitTyping } =
    usePrivateChat(userId);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <ChatHeader
        title={peer?.name || 'Conversation'}
        subtitle={peer?.status}
        peer={peer}
        onMenu={openSidebar}
      />

      <MessageList
        messages={messages}
        loading={loading}
        currentUserId={user?.id}
        onDelete={deleteMessage}
        emptyState={
          peer ? `This is the start of your conversation with ${peer.name}.` : 'Loading…'
        }
      />

      <TypingIndicator label={peerTyping ? `${peer?.name} is typing` : ''} />
      <MessageInput onSend={sendMessage} onTyping={emitTyping} canUploadImage disabled={!peer} />
    </div>
  );
};

export default PrivateChat;
