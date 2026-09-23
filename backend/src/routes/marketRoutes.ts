import { Router } from 'express';
import { marketController } from '../controllers/marketController.js';

const router = Router();

router.get('/snapshot', marketController.getBalticSnapshot);
router.get('/alerts', marketController.getMarketAlerts);

export default router;
