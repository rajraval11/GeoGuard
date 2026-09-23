import { Router } from 'express';
import authRoutes from './authRoutes.js';
import analysisRoutes from './analysisRoutes.js';
import calculationRoutes from './calculationRoutes.js';
import marketRoutes from './marketRoutes.js';
import routesRoutes from './routesRoutes.js';
import adminRoutes from './adminRoutes.js';
import { checkDatabaseConnection } from '../config/db.js';
import { mlClient } from '../services/mlClient.js';

const apiRouter = Router();

// System Health endpoint
apiRouter.get('/health', async (req, res) => {
  const isDbConnected = await checkDatabaseConnection();
  const mlHealth = await mlClient.getHealth();
  const isMlOnline = mlHealth.status?.toLowerCase() === 'healthy' || mlHealth.status === 'nominal';

  const isHealthy = isDbConnected && isMlOnline;

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'HEALTHY' : 'DEGRADED',
    service: 'GeoGuard Decision Support API Gateway',
    timestamp: new Date().toISOString(),
    dependencies: {
      database: {
        status: isDbConnected ? 'CONNECTED' : 'UNAVAILABLE',
        engine: 'PostgreSQL 16'
      },
      mlMicroservice: {
        status: isMlOnline ? 'ONLINE' : 'UNAVAILABLE',
        endpoint: mlHealth.service || 'GeoGuard ML Microservice'
      }
    }
  });
});

// Core business routes
apiRouter.use('/auth', authRoutes);
apiRouter.use('/analyses', analysisRoutes);
apiRouter.use('/market', marketRoutes);
apiRouter.use('/admin', adminRoutes);

// Direct calculation and resource routes
apiRouter.use('/', calculationRoutes);
apiRouter.use('/', routesRoutes);

export default apiRouter;
