import axios from 'axios';
import { API_URL, TOKEN_KEY } from '../config/constants.js';

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
});

// Attach the JWT to every request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Normalize error messages and handle expired sessions.
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const message =
      error.response?.data?.message || error.message || 'Something went wrong. Please try again.';
    const status = error.response?.status;

    if (status === 401) {
      // Token invalid/expired - clear it so the app routes back to login.
      localStorage.removeItem(TOKEN_KEY);
    }

    return Promise.reject({ message, status, details: error.response?.data?.details });
  }
);
