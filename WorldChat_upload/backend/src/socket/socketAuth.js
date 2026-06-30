import { verifyToken } from '../utils/jwt.js';

/**
 * Socket.IO auth middleware. Expects the JWT in handshake.auth.token.
 * Attaches socket.user = { id, role, name }.
 */
export const socketAuth = (socket, next) => {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) return next(new Error('Authentication token missing'));

    const decoded = verifyToken(token);
    socket.user = { id: decoded.id, role: decoded.role, name: decoded.name };
    next();
  } catch {
    next(new Error('Invalid or expired token'));
  }
};
