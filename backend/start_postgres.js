import EmbeddedPostgres from 'embedded-postgres';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, 'pg_data');

async function main() {
  console.log('[PostgreSQL] Starting dedicated PostgreSQL 16 engine...');
  console.log(`[PostgreSQL] Data Directory: ${dataDir}`);

  const pg = new EmbeddedPostgres({
    databaseDir: dataDir,
    port: 5432,
    user: 'geoguard_admin',
    password: 'geoguard_secure_password_2026',
    persistent: true
  });

  const isInitialised = fs.existsSync(path.join(dataDir, 'PG_VERSION'));
  if (!isInitialised) {
    console.log('[PostgreSQL] Initializing new database cluster...');
    await pg.initialise();
    console.log('[PostgreSQL] Cluster initialized successfully.');
  }

  console.log('[PostgreSQL] Launching postgres daemon on port 5432...');
  await pg.start();
  console.log('[PostgreSQL] Server listening on port 5432.');

  try {
    await pg.createDatabase('geoguard_prod');
    console.log('[PostgreSQL] Database "geoguard_prod" verified / created.');
  } catch (err) {
    console.log('[PostgreSQL] Database "geoguard_prod" ready.');
  }

  console.log('[PostgreSQL] PostgreSQL is ready to accept connections.');
}

main().catch((err) => {
  console.error('[PostgreSQL] Fatal error starting PostgreSQL:', err);
  process.exit(1);
});
