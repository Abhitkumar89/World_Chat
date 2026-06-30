import { NavLink, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Avatar from '../common/Avatar.jsx';
import { Icon } from '../common/Icon.jsx';
import ThemeToggle from '../common/ThemeToggle.jsx';
import ConversationList from './ConversationList.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useSocket } from '../../context/SocketContext.jsx';
import { chatService } from '../../services/chatService.js';

const navItemClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
    isActive
      ? 'bg-brand-600 text-white'
      : 'text-slate-600 hover:bg-slate-200/60 dark:text-slate-300 dark:hover:bg-slate-800'
  }`;

/** Left navigation sidebar: brand, primary nav, conversations, profile + actions. */
const Sidebar = ({ onClose }) => {
  const { user, isUser, isGuest, logout } = useAuth();
  const { connected } = useSocket();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [loadingConvos, setLoadingConvos] = useState(isUser);

  useEffect(() => {
    if (!isUser) return;
    chatService
      .getConversations()
      .then(({ conversations: c }) => setConversations(c))
      .catch(() => {})
      .finally(() => setLoadingConvos(false));
  }, [isUser]);

  const handleLogout = async () => {
    await logout();
    toast.success('Signed out');
    navigate('/');
  };

  return (
    <aside className="flex h-full w-full flex-col bg-slate-50 dark:bg-slate-900 md:w-80 md:border-r md:border-slate-200 md:dark:border-slate-800">
      {/* Brand */}
      <div className="flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-white">
            <Icon name="globe" className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold leading-none">WorldChat</h1>
            <span
              className={`text-[11px] ${connected ? 'text-emerald-500' : 'text-slate-400'}`}
            >
              {connected ? 'Connected' : 'Connecting…'}
            </span>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="btn-ghost h-9 w-9 !px-0 md:hidden">
            <Icon name="x" className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Primary nav */}
      <nav className="space-y-1 px-3">
        <NavLink to="/chat" end className={navItemClass} onClick={onClose}>
          <Icon name="globe" className="h-5 w-5" />
          Global Chat
        </NavLink>
        {isUser && (
          <NavLink to="/profile" className={navItemClass} onClick={onClose}>
            <Icon name="settings" className="h-5 w-5" />
            Profile
          </NavLink>
        )}
      </nav>

      {/* Conversations (registered only) */}
      {isUser && (
        <div className="mt-3 flex min-h-0 flex-1 flex-col">
          <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Direct Messages
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            <ConversationList conversations={conversations} loading={loadingConvos} />
          </div>
        </div>
      )}

      {isGuest && (
        <div className="mx-3 mt-4 flex-1 rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
          You are chatting as a guest. Sign in with Google to unlock private
          messages, image sharing, voice & video calls, and chat history.
        </div>
      )}

      {/* Profile + actions */}
      <div className="mt-auto border-t border-slate-200 p-3 dark:border-slate-800">
        <div className="flex items-center gap-3 rounded-xl px-2 py-2">
          <Avatar name={user?.name} src={user?.avatar} size="md" online />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{user?.name}</p>
            <p className="truncate text-xs text-slate-400">{isGuest ? 'Guest' : user?.email}</p>
          </div>
          <ThemeToggle />
          <button onClick={handleLogout} className="btn-ghost h-10 w-10 !px-0" aria-label="Sign out">
            <Icon name="logout" className="h-5 w-5" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
