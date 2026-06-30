import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { socketService } from '../services/socketService.js';
import { useAuth } from './AuthContext.jsx';
import { SOCKET_EVENTS } from '../config/constants.js';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const [connected, setConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      socketService.disconnect();
      socketRef.current = null;
      setConnected(false);
      setOnlineUsers([]);
      return undefined;
    }

    const socket = socketService.connect(token);
    socketRef.current = socket;

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    const onOnlineUsers = (users) => setOnlineUsers(users);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on(SOCKET_EVENTS.ONLINE_USERS, onOnlineUsers);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off(SOCKET_EVENTS.ONLINE_USERS, onOnlineUsers);
    };
  }, [token, isAuthenticated]);

  const value = {
    socket: socketRef.current,
    socketService,
    connected,
    onlineUsers,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used within SocketProvider');
  return ctx;
};
