import express, { Request, Response } from 'express';
import cors from 'cors';
import { config } from './config/index.js';
import apiRouter from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// Security and CORS
app.use(
  cors({
    origin: [
      'https://geo-guard-tw0.vercel.app',
      config.corsOrigin,
      'http://localhost:5173',
      'http://127.0.0.1:5173'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request Logger (Development / Diagnostics)
app.use((req: Request, res: Response, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;

    if (process.env.NODE_ENV !== 'test') {
      console.log(
        `[API] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`
      );
    }
  });

  next();
});

// Mount master API router under /api
app.use('/api', apiRouter);

// Root health & sitemap probe
app.get('/', (req: Request, res: Response) => {
  res.json({
    service: 'GeoGuard Production API Gateway',
    version: '1.0.0',
    documentation: '/api/health'
  });
});

// 404 Route Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `The requested endpoint '${req.method} ${req.originalUrl}' does not exist on this server.`
    }
  });
});

// Central Error Handler
app.use(errorHandler);

export default app;