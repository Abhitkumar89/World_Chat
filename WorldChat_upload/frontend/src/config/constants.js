export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const TOKEN_KEY = 'worldchat_token';
export const THEME_KEY = 'worldchat_theme';

export const ROLES = { GUEST: 'guest', USER: 'user' };

export const MESSAGE_TYPES = { TEXT: 'text', IMAGE: 'image', SYSTEM: 'system' };

export const CALL_TYPES = { VOICE: 'voice', VIDEO: 'video' };

/** Mirror of the backend socket event names. */
export const SOCKET_EVENTS = {
  ONLINE_USERS: 'online_users',
  USER_JOINED: 'user_joined',
  USER_LEFT: 'user_left',
  GLOBAL_MESSAGE: 'global_message',
  GLOBAL_MESSAGE_NEW: 'global_message_new',
  PRIVATE_MESSAGE: 'private_message',
  PRIVATE_MESSAGE_NEW: 'private_message_new',
  MESSAGE_DELETED: 'message_deleted',
  TYPING: 'typing',
  TYPING_UPDATE: 'typing_update',
  IMAGE_EXPIRED: 'image_expired',
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
};

/** Public STUN servers for WebRTC. Add TURN for reliable NAT traversal in production. */
export const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];
