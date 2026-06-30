import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useSocket } from '../context/SocketContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { chatService } from '../services/chatService.js';
import { SOCKET_EVENTS, MESSAGE_TYPES } from '../config/constants.js';

/**
 * Private one-to-one conversation state for a given peer user id.
 */
export const usePrivateChat = (peerId) => {
  const { socket } = useSocket();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [peer, setPeer] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [peerTyping, setPeerTyping] = useState(false);
  const typingTimer = useRef(null);

  // Load history when peer changes.
  useEffect(() => {
    if (!peerId) {
      setMessages([]);
      setPeer(null);
      setConversationId(null);
      return undefined;
    }
    let active = true;
    setLoading(true);
    chatService
      .getPrivateHistory(peerId)
      .then((data) => {
        if (!active) return;
        setMessages(data.messages);
        setPeer(data.user);
        setConversationId(data.conversationId);
        socket?.emit('private:join', { conversationId: data.conversationId });
      })
      .catch((e) => toast.error(e.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [peerId, socket]);

  // Realtime listeners scoped to this conversation.
  useEffect(() => {
    if (!socket) return undefined;

    const onNew = (msg) => {
      if (msg.conversationId !== conversationId) return;
      setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
    };

    const onDeleted = ({ messageId, conversationId: cid }) => {
      if (cid !== conversationId) return;
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, deleted: true, message: 'This message was deleted', imageUrl: '' } : m))
      );
    };

    const onTyping = ({ conversationId: cid, isTyping, userId }) => {
      if (cid !== conversationId || userId === user?.id) return;
      setPeerTyping(isTyping);
      clearTimeout(typingTimer.current);
      if (isTyping) typingTimer.current = setTimeout(() => setPeerTyping(false), 4000);
    };

    const onImageExpired = ({ messageId, conversationId: cid, text }) => {
      if (cid !== conversationId) return;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId
            ? { ...m, messageType: MESSAGE_TYPES.TEXT, imageUrl: '', message: text, isExpired: true }
            : m
        )
      );
    };

    socket.on(SOCKET_EVENTS.PRIVATE_MESSAGE_NEW, onNew);
    socket.on(SOCKET_EVENTS.MESSAGE_DELETED, onDeleted);
    socket.on(SOCKET_EVENTS.TYPING_UPDATE, onTyping);
    socket.on(SOCKET_EVENTS.IMAGE_EXPIRED, onImageExpired);

    return () => {
      socket.off(SOCKET_EVENTS.PRIVATE_MESSAGE_NEW, onNew);
      socket.off(SOCKET_EVENTS.MESSAGE_DELETED, onDeleted);
      socket.off(SOCKET_EVENTS.TYPING_UPDATE, onTyping);
      socket.off(SOCKET_EVENTS.IMAGE_EXPIRED, onImageExpired);
    };
  }, [socket, conversationId, user?.id]);

  const sendMessage = useCallback(
    (payload) =>
      new Promise((resolve, reject) => {
        if (!socket) return reject(new Error('Not connected'));
        socket.emit(
          SOCKET_EVENTS.PRIVATE_MESSAGE,
          { ...payload, receiverId: peerId },
          (res) => {
            if (res?.success) resolve(res.message);
            else reject(new Error(res?.error || 'Failed to send'));
          }
        );
      }),
    [socket, peerId]
  );

  const deleteMessage = useCallback(
    async (messageId) => {
      await chatService.deletePrivateMessage(messageId);
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, deleted: true, message: 'This message was deleted', imageUrl: '' } : m))
      );
      socket?.emit(SOCKET_EVENTS.MESSAGE_DELETED, { messageId, conversationId });
    },
    [socket, conversationId]
  );

  const emitTyping = useCallback(
    (isTyping) =>
      socket?.emit(SOCKET_EVENTS.TYPING, { scope: 'private', conversationId, isTyping }),
    [socket, conversationId]
  );

  return { messages, peer, conversationId, loading, peerTyping, sendMessage, deleteMessage, emitTyping };
};
