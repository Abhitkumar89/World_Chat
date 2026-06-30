/**
 * In-memory presence registry. Maps userId -> { sockets:Set, user }.
 * For multi-instance deployments back this with the socket.io Redis adapter.
 */
class Presence {
  constructor() {
    this.users = new Map(); // userId -> { sockets:Set<string>, user }
  }

  add(userId, socketId, user) {
    const existing = this.users.get(userId);
    if (existing) {
      existing.sockets.add(socketId);
      return false; // not newly online
    }
    this.users.set(userId, { sockets: new Set([socketId]), user });
    return true; // newly online
  }

  remove(userId, socketId) {
    const existing = this.users.get(userId);
    if (!existing) return false;
    existing.sockets.delete(socketId);
    if (existing.sockets.size === 0) {
      this.users.delete(userId);
      return true; // went offline
    }
    return false;
  }

  isOnline(userId) {
    return this.users.has(userId);
  }

  list() {
    return Array.from(this.users.values()).map((entry) => entry.user);
  }

  socketsFor(userId) {
    return Array.from(this.users.get(userId)?.sockets ?? []);
  }
}

export const presence = new Presence();
