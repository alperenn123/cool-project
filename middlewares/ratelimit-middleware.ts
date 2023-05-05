import { Request, Response, NextFunction } from 'express';

const API_LIMIT = 60;

export function rateLimitMiddleware() {
  let requests = 0;
  let resetTime: number;

  return function (req: Request, res: Response, next: NextFunction) {
    const now = Date.now();
    if (!resetTime || resetTime < now) {
      resetTime = now + 60 * 1000;
      requests = 0;
    }

    requests++;

    if (requests > API_LIMIT) {
      return res.status(429).json({
        message: 'Too many requests. Please try again later.',
        retryAfter: resetTime - now,
      });
    }

    next();
  };
}
