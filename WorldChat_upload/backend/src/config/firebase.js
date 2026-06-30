import admin from 'firebase-admin';
import { env, isFirebaseConfigured } from './env.js';
import { logger } from '../utils/logger.js';

let firebaseApp = null;

if (isFirebaseConfigured) {
  firebaseApp = admin.initializeApp({
    credential: admin.credential.cert({
      projectId: env.firebase.projectId,
      clientEmail: env.firebase.clientEmail,
      privateKey: env.firebase.privateKey,
    }),
  });
  logger.info('Firebase Admin initialized');
} else {
  logger.warn('Firebase not configured - Google authentication will be disabled');
}

/**
 * Verify a Firebase ID token issued by the Google sign-in flow on the client.
 * @param {string} idToken
 * @returns {Promise<import('firebase-admin/auth').DecodedIdToken>}
 */
export const verifyFirebaseToken = async (idToken) => {
  if (!firebaseApp) {
    throw new Error('Firebase is not configured on the server');
  }
  return admin.auth().verifyIdToken(idToken);
};

export { isFirebaseConfigured };
