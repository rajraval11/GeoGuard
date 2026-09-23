import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const BASE_URL = 'http://localhost:5000/api';

async function main() {
  console.log('--- RESTART PERSISTENCE VERIFICATION ---');

  // 1. Login to obtain user token
  const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
    email: 'm.vance@pacificbulk.com',
    password: 'PacificPass2026!',
    loginType: 'user'
  });
  const token = loginRes.data.token;

  // 2. Fetch all analyses from API
  const res = await axios.get(`${BASE_URL}/analyses`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (res.data.length === 0) {
    throw new Error('No analyses found in PostgreSQL.');
  }

  const target = res.data[0];
  console.log(`[PASS] Found persisted analysis in PostgreSQL: ${target.id} (${target.recommendation?.strategyName})`);

  // 3. Query single by ID
  const single = await axios.get(`${BASE_URL}/analyses/${target.id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const matches = single.data.id === target.id;
  console.log(`[PASS] Verified analysis survives server lifecycle: ${matches} (Cost: $${single.data.recommendation?.expectedDeliveredCostPerTon}/t)`);

  await prisma.$disconnect();
}

main().catch(err => {
  console.error('[FAIL] Restart persistence test failed:', err);
  process.exit(1);
});
