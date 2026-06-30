import { io } from 'socket.io-client';
import { SOCKET_URL } from '../config/constants.js';

/**
 * Singleton wrapper around the Socket.IO client so the whole app shares one
 * authenticated connection.
 */
class SocketService {
  constructor() {
    this.socket = null;
  }

  connect(token) {
    if (this.socket?.connected) return this.socket;
    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
  }

  get instance() {
    return this.socket;
  }

  emit(event, payload, ack) {
    this.socket?.emit(event, payload, ack);
  }

  on(event, handler) {
    this.socket?.on(event, handler);
  }

  off(event, handler) {
    this.socket?.off(event, handler);
  }
}

export const socketService = new SocketService();
