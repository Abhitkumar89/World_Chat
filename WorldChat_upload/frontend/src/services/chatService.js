import { api } from './api.js';

export const chatService = {
  // Global
  getGlobalMessages: (params = {}) => api.get('/messages', { params }).then((r) => r.data),
  sendGlobalMessage: (payload) => api.post('/messages', payload).then((r) => r.data),

  // Private
  getConversations: () => api.get('/private/conversations').then((r) => r.data),
  getPrivateHistory: (userId) => api.get(`/private/${userId}`).then((r) => r.data),
  deletePrivateMessage: (messageId) =>
    api.delete(`/private/message/${messageId}`).then((r) => r.data),

  // Uploads
  uploadImage: (file, onProgress) => {
    const form = new FormData();
    form.append('image', file);
    return api
      .post('/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          if (onProgress && e.total) onProgress(Math.round((e.loaded * 100) / e.total));
        },
      })
      .then((r) => r.data);
  },

  // Calls
  getCallHistory: () => api.get('/call/history').then((r) => r.data),
  logCall: (payload) => api.post('/call', payload).then((r) => r.data),
};
