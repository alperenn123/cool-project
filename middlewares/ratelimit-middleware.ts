import { Request, Response, NextFunction } from 'express';

let requests = 0;
let resetTime: number;

export function rateLimitMiddleware(
  _: Request,
  res: Response,
  next: NextFunction,
) {
  const now = Date.now();
  if (!resetTime || resetTime < now) {
    resetTime = now + 60 * 1000;
    requests = 0;
  }

  requests++;

  if (requests > 60) {
    return res.status(429).json({
      message: 'Too many requests. Please try again later.',
      retryAfter: resetTime - now,
    });
  }

  next();
}
