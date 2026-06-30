import rateLimit from 'express-rate-limit';

const json = (message) => ({ success: false, message });

/** Broad limiter applied to the whole API. */
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 600,
  standardHeaders: true,
  legacyHeaders: false,
  message: json('Too many requests, please slow down.'),
});

/** Stricter limiter for auth endpoints to mitigate abuse. */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: json('Too many authentication attempts, try again later.'),
});

/** Limit message creation and uploads. */
export const writeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: json('You are sending content too quickly.'),
});

export const uploadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: json('Upload limit reached, please wait a moment.'),
});
