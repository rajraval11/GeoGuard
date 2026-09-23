import { Router } from 'express';
import { calculationController } from '../controllers/calculationController.js';

const router = Router();

router.post('/forecast', calculationController.getForecast);
router.post('/compatibility', calculationController.checkCompatibility);
router.post('/optimization', calculationController.optimizeContractMix);

export default router;
