import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

/**
 * Sign a token for a registered user.
 * @param {{ id: string }} payload
 */
export const signUserToken = (payload) =>
  jwt.sign({ ...payload, role: 'user' }, env.jwt.secret, {
    expiresIn: env.jwt.expiresIn,
  });

/**
 * Sign a short-lived token for an anonymous guest session.
 * @param {{ id: string, name: string }} payload
 */
export const signGuestToken = (payload) =>
  jwt.sign({ ...payload, role: 'guest' }, env.jwt.secret, {
    expiresIn: env.jwt.guestExpiresIn,
  });

export const verifyToken = (token) => jwt.verify(token, env.jwt.secret);
