export const ROLES = Object.freeze({
  GUEST: 'guest',
  USER: 'user',
});

export const MESSAGE_TYPES = Object.freeze({
  TEXT: 'text',
  IMAGE: 'image',
  SYSTEM: 'system',
});

export const CALL_TYPES = Object.freeze({
  VOICE: 'voice',
  VIDEO: 'video',
});

export const CALL_STATUS = Object.freeze({
  RINGING: 'ringing',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  MISSED: 'missed',
  ENDED: 'ended',
});

export const EXPIRED_IMAGE_TEXT = 'This image has expired.';

/** Socket.IO event names shared with the client. */
export const SOCKET_EVENTS = Object.freeze({
  // connection / presence
  ONLINE_USERS: 'online_users',
  USER_JOINED: 'user_joined',
  USER_LEFT: 'user_left',
  // global chat
  GLOBAL_MESSAGE: 'global_message',
  GLOBAL_MESSAGE_NEW: 'global_message_new',
  // private chat
  PRIVATE_MESSAGE: 'private_message',
  PRIVATE_MESSAGE_NEW: 'private_message_new',
  MESSAGE_DELETED: 'message_deleted',
  // typing
  TYPING: 'typing',
  TYPING_UPDATE: 'typing_update',
  // image expiry broadcast
  IMAGE_EXPIRED: 'image_expired',
  // WebRTC signaling
  CALL_INITIATE: 'call:initiate',
  CALL_INCOMING: 'call:incoming',
  CALL_ACCEPT: 'call:accept',
  CALL_ACCEPTED: 'call:accepted',
  CALL_REJECT: 'call:reject',
  CALL_REJECTED: 'call:rejected',
  CALL_END: 'call:end',
  CALL_ENDED: 'call:ended',
  CALL_UNAVAILABLE: 'call:unavailable',
  WEBRTC_OFFER: 'webrtc:offer',
  WEBRTC_ANSWER: 'webrtc:answer',
  WEBRTC_ICE: 'webrtc:ice-candidate',
  // errors
  ERROR: 'socket_error',
});
