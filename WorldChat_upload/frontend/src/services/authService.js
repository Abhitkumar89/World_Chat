import { api } from './api.js';

export const authService = {
  /** Exchange a Firebase ID token for an app JWT + user. */
  loginWithGoogle: (idToken) => api.post('/auth/google', { idToken }).then((r) => r.data),

  /** Create a guest session. */
  createGuest: (name) => api.post('/guest', { name }).then((r) => r.data),

  getProfile: () => api.get('/profile').then((r) => r.data),

  updateProfile: (payload) => api.put('/profile', payload).then((r) => r.data),
};
