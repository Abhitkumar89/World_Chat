import Avatar from '../common/Avatar.jsx';
import { Icon } from '../common/Icon.jsx';
import { useSocket } from '../../context/SocketContext.jsx';
import { useCall } from '../../context/CallContext.jsx';
import { CALL_TYPES } from '../../config/constants.js';

/**
 * Header for the chat window. In private mode it shows the peer plus voice/video
 * call buttons; in global mode it shows the room title and an online-panel toggle.
 */
const ChatHeader = ({ title, subtitle, peer, onMenu, onToggleUsers }) => {
  const { onlineUsers } = useSocket();
  const { startCall, isActive } = useCall();
  const isPeerOnline = peer && onlineUsers.some((u) => u.id === peer.id);

  return (
    <header className="flex items-center gap-3 border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
      {onMenu && (
        <button onClick={onMenu} className="btn-ghost h-10 w-10 !px-0 md:hidden" aria-label="Menu">
          <Icon name="menu" className="h-5 w-5" />
        </button>
      )}

      {peer ? (
        <Avatar name={peer.name} src={peer.avatar} size="md" online={isPeerOnline} />
      ) : (
        <div className="grid h-11 w-11 place-items-center rounded-full bg-brand-600 text-white">
          <Icon name="globe" className="h-5 w-5" />
        </div>
      )}

      <div className="min-w-0 flex-1">
        <h2 className="truncate text-base font-bold">{title}</h2>
        <p className="truncate text-xs text-slate-400">
          {subtitle || (peer ? (isPeerOnline ? 'Online' : 'Offline') : '')}
        </p>
      </div>

      {peer && (
        <div className="flex items-center gap-1">
          <button
            onClick={() => startCall(peer, CALL_TYPES.VOICE)}
            disabled={isActive || !isPeerOnline}
            className="btn-ghost h-10 w-10 !px-0"
            aria-label="Voice call"
            title={isPeerOnline ? 'Voice call' : 'User offline'}
          >
            <Icon name="phone" className="h-5 w-5" />
          </button>
          <button
            onClick={() => startCall(peer, CALL_TYPES.VIDEO)}
            disabled={isActive || !isPeerOnline}
            className="btn-ghost h-10 w-10 !px-0"
            aria-label="Video call"
            title={isPeerOnline ? 'Video call' : 'User offline'}
          >
            <Icon name="video" className="h-5 w-5" />
          </button>
        </div>
      )}

      {onToggleUsers && (
        <button
          onClick={onToggleUsers}
          className="btn-ghost h-10 w-10 !px-0"
          aria-label="Toggle online users"
        >
          <Icon name="users" className="h-5 w-5" />
        </button>
      )}
    </header>
  );
};

export default ChatHeader;
