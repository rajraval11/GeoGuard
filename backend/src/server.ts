import app from './app.js';
import { config } from './config/index.js';
import { checkDatabaseConnection, prisma } from './config/db.js';
import { mlClient } from './services/mlClient.js';

const server = app.listen(config.port, async () => {
  console.log(`========================================================`);
  console.log(`  GeoGuard API Gateway running on http://localhost:${config.port}`);
  console.log(`  Environment: ${config.nodeEnv}`);
  console.log(`  Target ML Microservice: ${config.flaskMlUrl}`);
  console.log(`========================================================`);

  // Verify PostgreSQL connectivity
  const dbConnected = await checkDatabaseConnection();
  if (dbConnected) {
    console.log(`[Database] PostgreSQL connection: CONNECTED (Database ready)`);
  } else {
    console.warn(`[Database] PostgreSQL connection: UNAVAILABLE at ${config.databaseUrl}`);
    console.warn(`[Database] Real database persistence requires a running PostgreSQL instance.`);
  }

  // Verify Flask ML connectivity
  const mlHealth = await mlClient.getHealth();
  if (mlHealth.status?.toLowerCase() === 'healthy' || mlHealth.status === 'nominal') {
    console.log(`[ML Service] Flask Microservice: ONLINE (Ensembles ready)`);
  } else {
    console.warn(`[ML Service] Flask Microservice: UNAVAILABLE at ${config.flaskMlUrl}`);
    console.warn(`[ML Service] To start Python service: python ml-service/app.py`);
  }
});

// Graceful termination
async function shutdown() {
  console.log('\nGracefully shutting down GeoGuard API Gateway...');
  server.close(async () => {
    try {
      await prisma.$disconnect();
      console.log('Database client disconnected.');
    } catch (err) {
      // ignore
    }
    process.exit(0);
  });
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
