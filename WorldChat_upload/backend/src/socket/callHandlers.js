import { Call } from '../models/Call.js';
import { presence } from './presence.js';
import { SOCKET_EVENTS, ROLES, CALL_STATUS } from '../utils/constants.js';
import { logger } from '../utils/logger.js';

/**
 * WebRTC signaling over Socket.IO. The server only relays SDP offers/answers and
 * ICE candidates - the actual media flows peer-to-peer. Registered users only.
 *
 * `user:<id>` rooms are used to target a specific user across all their sockets.
 */
export const registerCallHandlers = (io, socket) => {
  const { id: userId, role, name } = socket.user;
  const userRoom = (id) => `user:${id}`;

  const guard = (ack) => {
    if (role !== ROLES.USER) {
      ack?.({ success: false, error: 'Only registered users can make calls' });
      return false;
    }
    return true;
  };

  // Caller starts a call.
  socket.on(SOCKET_EVENTS.CALL_INITIATE, async ({ receiverId, callType } = {}, ack) => {
    if (!guard(ack)) return;
    try {
      if (!presence.isOnline(receiverId)) {
        return io.to(socket.id).emit(SOCKET_EVENTS.CALL_UNAVAILABLE, {
          receiverId,
          reason: 'User is offline',
        });
      }

      const call = await Call.create({
        callerId: userId,
        callerName: name,
        receiverId,
        callType,
        status: CALL_STATUS.RINGING,
      });

      const callId = call._id.toString();
      socket.data.activeCallId = callId;

      io.to(userRoom(receiverId)).emit(SOCKET_EVENTS.CALL_INCOMING, {
        callId,
        callType,
        from: { id: userId, name, avatar: socket.profile?.avatar || '' },
      });

      ack?.({ success: true, callId });
    } catch (err) {
      logger.error('call:initiate failed', err);
      ack?.({ success: false, error: 'Failed to start call' });
    }
  });

  // Receiver accepts.
  socket.on(SOCKET_EVENTS.CALL_ACCEPT, async ({ callId, callerId } = {}) => {
    if (role !== ROLES.USER) return;
    socket.data.activeCallId = callId;
    await Call.findByIdAndUpdate(callId, {
      status: CALL_STATUS.ACCEPTED,
      startedAt: new Date(),
    }).catch(() => {});
    io.to(userRoom(callerId)).emit(SOCKET_EVENTS.CALL_ACCEPTED, {
      callId,
      from: { id: userId, name },
    });
  });

  // Receiver rejects.
  socket.on(SOCKET_EVENTS.CALL_REJECT, async ({ callId, callerId } = {}) => {
    await Call.findByIdAndUpdate(callId, { status: CALL_STATUS.REJECTED, endedAt: new Date() }).catch(
      () => {}
    );
    io.to(userRoom(callerId)).emit(SOCKET_EVENTS.CALL_REJECTED, { callId, from: { id: userId } });
  });

  // Either party ends the call.
  socket.on(SOCKET_EVENTS.CALL_END, async ({ callId, peerId, durationSec = 0 } = {}) => {
    if (callId) {
      const call = await Call.findById(callId).catch(() => null);
      if (call && call.status !== CALL_STATUS.ENDED) {
        call.status = call.status === CALL_STATUS.RINGING ? CALL_STATUS.MISSED : CALL_STATUS.ENDED;
        call.endedAt = new Date();
        call.durationSec = durationSec;
        await call.save().catch(() => {});
      }
    }
    socket.data.activeCallId = null;
    if (peerId) io.to(userRoom(peerId)).emit(SOCKET_EVENTS.CALL_ENDED, { callId, from: { id: userId } });
  });

  // ---- Pure relays for the WebRTC handshake ----
  socket.on(SOCKET_EVENTS.WEBRTC_OFFER, ({ to, sdp, callId } = {}) => {
    if (to) io.to(userRoom(to)).emit(SOCKET_EVENTS.WEBRTC_OFFER, { from: userId, sdp, callId });
  });

  socket.on(SOCKET_EVENTS.WEBRTC_ANSWER, ({ to, sdp, callId } = {}) => {
    if (to) io.to(userRoom(to)).emit(SOCKET_EVENTS.WEBRTC_ANSWER, { from: userId, sdp, callId });
  });

  socket.on(SOCKET_EVENTS.WEBRTC_ICE, ({ to, candidate, callId } = {}) => {
    if (to) io.to(userRoom(to)).emit(SOCKET_EVENTS.WEBRTC_ICE, { from: userId, candidate, callId });
  });
};
