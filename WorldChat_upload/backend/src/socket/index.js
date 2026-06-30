import { Server } from 'socket.io';
import { socketAuth } from './socketAuth.js';
import { presence } from './presence.js';
import { registerChatHandlers } from './chatHandlers.js';
import { registerCallHandlers } from './callHandlers.js';
import { User } from '../models/User.js';
import { Guest } from '../models/Guest.js';
import { SOCKET_EVENTS, ROLES } from '../utils/constants.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

const loadProfile = async (user) => {
  try {
    if (user.role === ROLES.USER) {
      const u = await User.findById(user.id).lean();
      return u ? { avatar: u.avatar, name: u.name } : {};
    }
    const g = await Guest.findById(user.id).lean();
    return g ? { avatar: g.avatar, name: g.name } : {};
  } catch {
    return {};
  }
};

/**
 * Initialize Socket.IO, wire auth, presence, chat and call signaling.
 * @param {import('http').Server} httpServer
 * @returns {import('socket.io').Server}
 */
export const initSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: { origin: env.clientUrl, methods: ['GET', 'POST'], credentials: true },
  });

  io.use(socketAuth);

  io.on('connection', async (socket) => {
    const { id, role, name } = socket.user;
    socket.profile = await loadProfile(socket.user);

    // Personal room for direct targeting (private messages, call signaling).
    socket.join(`user:${id}`);

    const publicUser = {
      id,
      name,
      role,
      avatar: socket.profile?.avatar || '',
    };
    const newlyOnline = presence.add(id, socket.id, publicUser);

    // Send current roster to the new socket; announce join to everyone else.
    socket.emit(SOCKET_EVENTS.ONLINE_USERS, presence.list());
    if (newlyOnline) {
      socket.broadcast.emit(SOCKET_EVENTS.USER_JOINED, publicUser);
      io.emit(SOCKET_EVENTS.ONLINE_USERS, presence.list());
    }

    registerChatHandlers(io, socket);
    registerCallHandlers(io, socket);

    socket.on('disconnect', () => {
      const wentOffline = presence.remove(id, socket.id);

      // If we were in an active call, let the peer know.
      if (socket.data.activeCallId) {
        socket.broadcast.emit(SOCKET_EVENTS.CALL_ENDED, {
          callId: socket.data.activeCallId,
          from: { id },
          reason: 'disconnect',
        });
      }

      if (wentOffline) {
        io.emit(SOCKET_EVENTS.USER_LEFT, publicUser);
        io.emit(SOCKET_EVENTS.ONLINE_USERS, presence.list());
        // Touch lastSeen for registered users.
        if (role === ROLES.USER) {
          User.findByIdAndUpdate(id, { lastSeen: new Date() }).catch(() => {});
        }
      }
    });
  });

  logger.info('Socket.IO initialized');
  return io;
};
