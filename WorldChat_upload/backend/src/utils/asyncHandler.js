/**
 * Wraps async route handlers so thrown errors propagate to Express error middleware
 * without repetitive try/catch blocks.
 */
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
