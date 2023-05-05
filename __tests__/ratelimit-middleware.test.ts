import { Request, Response, NextFunction } from 'express';
import { rateLimitMiddleware } from '../middlewares/ratelimit-middleware';

describe('rateLimitMiddleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock<NextFunction>;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  it('should call next if requests are within limit', () => {
    rateLimitMiddleware(req as Request, res as Response, next);
    expect(next).toBeCalled();
  });

  it('should return 429 error if requests exceed limit', () => {
    Array.from({ length: 61 }).forEach(() => {
      rateLimitMiddleware(req as Request, res as Response, next);
    });

    expect(res.status).toBeCalledWith(429);
    expect(res.json).toBeCalledWith({
      message: 'Too many requests. Please try again later.',
      retryAfter: expect.any(Number),
    });
  });
});
