import rateLimit from 'express-rate-limit';

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: { success: false, error: 'Too many requests, please try again later' },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  skip: (req) => {
    // Don't rate limit health checks
    return req.path === '/api/health';
  },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Allow a few retries without locking people out too quickly
  message: { success: false, error: 'Too many login attempts, please try again later' },
  skipSuccessfulRequests: true, // Don't count successful requests
});

export const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, error: 'Too many registration attempts, please try again later' },
});

export const transactionLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // Max 10 transactions per minute
  message: { success: false, error: 'Too many transactions, slow down' },
});
