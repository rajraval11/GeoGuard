import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || 'postgresql://geoguard_admin:geoguard_secure_password_2026@localhost:5432/geoguard_prod?schema=public',
  jwtSecret: process.env.JWT_SECRET || 'geoguard_production_jwt_secret_maritime_decision_support_2026_xyz',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  flaskMlUrl: process.env.FLASK_ML_URL || 'http://localhost:5001',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
};
