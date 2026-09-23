import { Router } from 'express';
import { routesController } from '../controllers/routesController.js';

const router = Router();

router.get('/routes', routesController.getPorts);
router.get('/vessels', routesController.getVessels);
router.get('/locations', routesController.getLocations);
router.get('/origins', routesController.getOrigins);
router.get('/destinations', routesController.getDestinations);
router.get('/distance', routesController.getDistance);

export default router;
