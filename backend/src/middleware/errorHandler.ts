import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Zod request schema validation error
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request payload parameters.',
        details: err.errors
      }
    });
    return;
  }

  // Database Connection / Prisma Initialization failure -> Honest UNAVAILABLE state
  const isDbUnavailable =
    err.code === 'P1001' ||
    err.name === 'PrismaClientInitializationError' ||
    (err.message && err.message.includes("Can't reach database server"));

  if (isDbUnavailable) {
    res.status(503).json({
      success: false,
      error: {
        code: 'DATABASE_UNAVAILABLE',
        message: 'PostgreSQL database service is unavailable. Please verify PostgreSQL is running at DATABASE_URL and migrations are applied.'
      }
    });
    return;
  }

  // Flask ML Service unreachable -> Honest UNAVAILABLE state
  if (err.code === 'ECONNREFUSED' && err.config?.url?.includes('5001')) {
    res.status(503).json({
      success: false,
      error: {
        code: 'ML_SERVICE_UNAVAILABLE',
        message: 'Flask ML Microservice is unreachable at port 5001. Please run python ml-service/app.py.'
      }
    });
    return;
  }

  // Handle custom application errors with status code
  const status = err.status || err.statusCode || 500;
  const code = err.code || (status === 500 ? 'INTERNAL_SERVER_ERROR' : 'REQUEST_FAILED');
  const message = err.message || 'An unexpected error occurred processing your request.';

  res.status(status).json({
    success: false,
    error: {
      code,
      message
    }
  });
}
