import { verifyToken } from '../utils/jwt.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ROLES } from '../utils/constants.js';

const extractToken = (req) => {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) return header.slice(7);
  return null;
};

/**
 * Require any authenticated principal (guest or registered user).
 * Populates req.auth = { id, role, name }.
 */
export const authenticate = asyncHandler(async (req, _res, next) => {
  const token = extractToken(req);
  if (!token) throw ApiError.unauthorized('Authentication token missing');

  try {
    const decoded = verifyToken(token);
    req.auth = { id: decoded.id, role: decoded.role, name: decoded.name };
    next();
  } catch {
    throw ApiError.unauthorized('Invalid or expired token');
  }
});

/** Require a fully registered user (blocks guests). */
export const requireUser = asyncHandler(async (req, _res, next) => {
  if (!req.auth || req.auth.role !== ROLES.USER) {
    throw ApiError.forbidden('This action requires a registered account');
  }
  next();
});

/** Optional auth: attaches req.auth if a valid token is present, never throws. */
export const optionalAuth = asyncHandler(async (req, _res, next) => {
  const token = extractToken(req);
  if (token) {
    try {
      const decoded = verifyToken(token);
      req.auth = { id: decoded.id, role: decoded.role, name: decoded.name };
    } catch {
      /* ignore invalid token in optional context */
    }
  }
  next();
});
