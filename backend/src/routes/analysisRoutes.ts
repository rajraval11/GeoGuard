import { Router } from 'express';
import { analysisController } from '../controllers/analysisController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.post('/', analysisController.createAnalysis);
router.get('/', analysisController.listAnalyses);
router.get('/:id', analysisController.getAnalysisById);
router.delete('/:id', analysisController.deleteAnalysis);

export default router;
