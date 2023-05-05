import express, { Router } from 'express';
import compabilityController from '../controllers/compability';
import bestMatchController from '../controllers/bestmatches';
import {
  calculateCompatibilityValidator,
  getBestMatchesValidator,
} from '../utils/validator';

const router: Router = express.Router();

router.get(
  '/calculate-compability',
  calculateCompatibilityValidator,
  compabilityController.calculateCompability,
);

router.get(
  '/best-matches',
  getBestMatchesValidator,
  bestMatchController.getBestMatches,
);

export default router;
