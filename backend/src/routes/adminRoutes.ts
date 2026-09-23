import { Router } from 'express';
import { adminController } from '../controllers/adminController.js';
import { settingsController } from '../controllers/settingsController.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

// Server-side ADMIN privilege enforcement for all admin routes:
// Non-admin or unauthenticated callers will receive 401 or 403 Forbidden.
router.use(requireAuth);
router.use(requireAdmin);

router.get('/dashboard', adminController.getDashboard);
router.get('/data-health', adminController.getDataHealth);
router.get('/model-performance', adminController.getModelPerformance);
router.get('/usage', adminController.getUsage);
router.get('/users', adminController.getUsers);
router.get('/organizations', adminController.getOrganizations);
router.get('/analyses', adminController.getAnalyses);
router.patch('/users/:id', adminController.updateUser);

router.get('/settings', settingsController.getSettings);
router.put('/settings', settingsController.updateSettings);

export default router;
