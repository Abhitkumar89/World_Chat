import { NavLink } from 'react-router-dom';
import Avatar from '../common/Avatar.jsx';
import { ListSkeleton } from '../common/Skeletons.jsx';
import { useSocket } from '../../context/SocketContext.jsx';
import { MESSAGE_TYPES } from '../../config/constants.js';

const preview = (m) => {
  if (!m) return '';
  if (m.deleted) return 'Message deleted';
  if (m.messageType === MESSAGE_TYPES.IMAGE && !m.isExpired) return '📷 Photo';
  return m.message;
};

/** List of the user's recent one-to-one conversations. */
const ConversationList = ({ conversations, loading }) => {
  const { onlineUsers } = useSocket();
  const onlineIds = new Set(onlineUsers.map((u) => u.id));

  if (loading) return <ListSkeleton />;

  if (!conversations.length) {
    return (
      <p className="px-4 py-6 text-sm text-slate-400">
        No conversations yet. Start one from the online users panel.
      </p>
    );
  }

  return (
    <div className="space-y-1 px-2 py-2">
      {conversations.map((c) => (
        <NavLink
          key={c.conversationId}
          to={`/chat/${c.user.id}`}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-3 py-2.5 transition ${
              isActive
                ? 'bg-brand-600/10 text-brand-700 dark:text-brand-300'
                : 'hover:bg-slate-200/60 dark:hover:bg-slate-800'
            }`
          }
        >
          <Avatar name={c.user.name} src={c.user.avatar} size="md" online={onlineIds.has(c.user.id)} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{c.user.name}</p>
            <p className="truncate text-xs text-slate-400">{preview(c.lastMessage)}</p>
          </div>
        </NavLink>
      ))}
    </div>
  );
};

export default ConversationList;
