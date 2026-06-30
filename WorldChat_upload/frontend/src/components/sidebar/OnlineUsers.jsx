import Avatar from '../common/Avatar.jsx';
import { Icon } from '../common/Icon.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { ROLES } from '../../config/constants.js';

/**
 * Online users panel. Registered users can click another registered user to
 * open a private chat (handled by onSelectUser).
 */
const OnlineUsers = ({ users, onSelectUser }) => {
  const { user, isUser } = useAuth();
  const others = users.filter((u) => u.id !== user?.id);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 px-4 py-3 text-sm font-semibold text-slate-500 dark:text-slate-400">
        <Icon name="users" className="h-4 w-4" />
        Online — {users.length}
      </div>
      <div className="flex-1 space-y-1 overflow-y-auto px-2 pb-3">
        {others.length === 0 && (
          <p className="px-3 py-4 text-sm text-slate-400">No one else is online right now.</p>
        )}
        {others.map((u) => {
          const canDM = isUser && u.role === ROLES.USER;
          return (
            <button
              key={u.id}
              onClick={() => canDM && onSelectUser?.(u)}
              disabled={!canDM}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition ${
                canDM
                  ? 'hover:bg-slate-200/60 dark:hover:bg-slate-800'
                  : 'cursor-default'
              }`}
              title={canDM ? 'Open private chat' : u.role === ROLES.GUEST ? 'Guest user' : ''}
            >
              <Avatar name={u.name} src={u.avatar} size="sm" online />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{u.name}</p>
                <p className="truncate text-xs text-slate-400">
                  {u.role === ROLES.GUEST ? 'Guest' : 'Member'}
                </p>
              </div>
              {canDM && <Icon name="send" className="h-4 w-4 text-slate-400" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default OnlineUsers;
