import { Request, Response, NextFunction } from 'express';
import { validationResult, query } from 'express-validator';

export const calculateCompatibilityValidator = [
  query('org').notEmpty().withMessage('Org is required'),
  query('user').notEmpty().withMessage('User is required'),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    return next();
  },
];

export const getBestMatchesValidator = [
  query('lang').notEmpty().withMessage('Language is required'),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    return next();
  },
];
