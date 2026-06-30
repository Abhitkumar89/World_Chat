import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useSocket } from '../context/SocketContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { chatService } from '../services/chatService.js';
import { SOCKET_EVENTS, MESSAGE_TYPES } from '../config/constants.js';

/**
 * Manages global chat state: history (registered users), live messages, typing,
 * join/leave notices and image-expiry updates.
 */
export const useGlobalChat = () => {
  const { socket } = useSocket();
  const { user, isUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(isUser);
  const [typingUsers, setTypingUsers] = useState([]);
  const typingTimers = useRef({});

  // Load history (registered users only; guests start with an empty room).
  useEffect(() => {
    let active = true;
    if (!isUser) {
      setLoadingHistory(false);
      return undefined;
    }
    setLoadingHistory(true);
    chatService
      .getGlobalMessages({ limit: 50 })
      .then(({ messages: history }) => active && setMessages(history))
      .catch((e) => toast.error(e.message))
      .finally(() => active && setLoadingHistory(false));
    return () => {
      active = false;
    };
  }, [isUser]);

  // Realtime listeners.
  useEffect(() => {
    if (!socket) return undefined;

    const onNew = (msg) => setMessages((prev) => [...prev, msg]);

    const onJoin = (u) => {
      if (u.id === user?.id) return;
      setMessages((prev) => [
        ...prev,
        {
          id: `sys-join-${u.id}-${Date.now()}`,
          messageType: MESSAGE_TYPES.SYSTEM,
          message: `${u.name} joined the chat`,
          createdAt: new Date().toISOString(),
        },
      ]);
    };

    const onLeft = (u) => {
      setMessages((prev) => [
        ...prev,
        {
          id: `sys-left-${u.id}-${Date.now()}`,
          messageType: MESSAGE_TYPES.SYSTEM,
          message: `${u.name} left the chat`,
          createdAt: new Date().toISOString(),
        },
      ]);
    };

    const onTyping = ({ userId, name, isTyping, scope }) => {
      if (scope !== 'global' || userId === user?.id) return;
      setTypingUsers((prev) => {
        if (isTyping) return prev.some((t) => t.userId === userId) ? prev : [...prev, { userId, name }];
        return prev.filter((t) => t.userId !== userId);
      });
      // Auto-clear stale typing state.
      clearTimeout(typingTimers.current[userId]);
      if (isTyping) {
        typingTimers.current[userId] = setTimeout(() => {
          setTypingUsers((prev) => prev.filter((t) => t.userId !== userId));
        }, 4000);
      }
    };

    const onImageExpired = ({ messageId, scope, text }) => {
      if (scope !== 'global') return;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId
            ? { ...m, messageType: MESSAGE_TYPES.TEXT, imageUrl: '', message: text, isExpired: true }
            : m
        )
      );
    };

    socket.on(SOCKET_EVENTS.GLOBAL_MESSAGE_NEW, onNew);
    socket.on(SOCKET_EVENTS.USER_JOINED, onJoin);
    socket.on(SOCKET_EVENTS.USER_LEFT, onLeft);
    socket.on(SOCKET_EVENTS.TYPING_UPDATE, onTyping);
    socket.on(SOCKET_EVENTS.IMAGE_EXPIRED, onImageExpired);

    return () => {
      socket.off(SOCKET_EVENTS.GLOBAL_MESSAGE_NEW, onNew);
      socket.off(SOCKET_EVENTS.USER_JOINED, onJoin);
      socket.off(SOCKET_EVENTS.USER_LEFT, onLeft);
      socket.off(SOCKET_EVENTS.TYPING_UPDATE, onTyping);
      socket.off(SOCKET_EVENTS.IMAGE_EXPIRED, onImageExpired);
    };
  }, [socket, user?.id]);

  const sendMessage = useCallback(
    (payload) =>
      new Promise((resolve, reject) => {
        if (!socket) return reject(new Error('Not connected'));
        socket.emit(SOCKET_EVENTS.GLOBAL_MESSAGE, payload, (res) => {
          if (res?.success) resolve(res.message);
          else reject(new Error(res?.error || 'Failed to send'));
        });
      }),
    [socket]
  );

  const emitTyping = useCallback(
    (isTyping) => socket?.emit(SOCKET_EVENTS.TYPING, { scope: 'global', isTyping }),
    [socket]
  );

  return { messages, loadingHistory, typingUsers, sendMessage, emitTyping };
};
