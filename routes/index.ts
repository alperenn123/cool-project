import express, { Router } from 'express';
import compabilityController from '../controllers/compability';
import bestMatchController from '../controllers/bestmatches';
import {
  calculateCompatibilityValidator,
  getBestMatchesValidator,
} from '../utils/validator';

import { rateLimitMiddleware } from '../middlewares/ratelimit-middleware';

const router: Router = express.Router();

router.get(
  '/calculate-compability',
  calculateCompatibilityValidator,
  rateLimitMiddleware(),
  compabilityController.calculateCompability,
);

router.get(
  '/best-matches',
  getBestMatchesValidator,
  rateLimitMiddleware(),
  bestMatchController.getBestMatches,
);

export default router;
