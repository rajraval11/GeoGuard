import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const BASE_URL = 'http://localhost:5000/api';
const FLASK_URL = 'http://localhost:5001';

const results = {};

function record(section, testName, pass, details) {
  if (!results[section]) results[section] = [];
  results[section].push({ testName, pass, details });
  const statusStr = pass ? '[PASS]' : '[FAIL]';
  console.log(`${statusStr} ${section.toUpperCase()} - ${testName}`);
  if (details) console.log(`       -> ${details}`);
}

async function runVerification() {
  console.log('================================================================');
  console.log('   GEOGUARD FINAL DATABASE & PRODUCTION PERSISTENCE VERIFICATION');
  console.log('================================================================\n');

  // ---------------------------------------------------------------------------
  // SECTION 2 & 3: POSTGRESQL & PRISMA
  // ---------------------------------------------------------------------------
  console.log('--- 1. POSTGRESQL ENGINE & PRISMA CONNECTION ---');
  try {
    const rawCheck = await prisma.$queryRaw`SELECT current_database(), version();`;
    const dbName = rawCheck[0]?.current_database;
    const dbVersion = rawCheck[0]?.version;
    const isPg = dbName === 'geoguard_prod' && dbVersion.includes('PostgreSQL');
    record('database', 'Real PostgreSQL Connection (Port 5432)', isPg, `Database: ${dbName}, Engine: ${dbVersion.slice(0, 35)}...`);

    const tableCounts = await Promise.all([
      prisma.user.count(),
      prisma.organization.count(),
      prisma.vesselClass.count(),
      prisma.port.count(),
      prisma.dataHealth.count()
    ]);
    const hasData = tableCounts.every(c => c > 0);
    record('database', 'Relational Tables & Seed Verification', hasData, `Users: ${tableCounts[0]}, Orgs: ${tableCounts[1]}, Vessels: ${tableCounts[2]}, Ports: ${tableCounts[3]}, Feeds: ${tableCounts[4]}`);
  } catch (err) {
    record('database', 'PostgreSQL Connection', false, err.message);
  }

  // ---------------------------------------------------------------------------
  // SECTION 4: REAL DATABASE AUTHENTICATION
  // ---------------------------------------------------------------------------
  console.log('\n--- 2. REAL DATABASE AUTHENTICATION ---');
  let userToken = '';
  let adminToken = '';
  let chartererUser = null;

  try {
    // Verify user exists in PostgreSQL first
    chartererUser = await prisma.user.findUnique({
      where: { email: 'm.vance@pacificbulk.com' },
      include: { organization: true }
    });
    record('auth', 'Query PostgreSQL User Record Directly', !!chartererUser, `Found ID: ${chartererUser?.id}, Org: ${chartererUser?.organization?.name}`);

    // Test Login via API (queries PostgreSQL)
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'm.vance@pacificbulk.com',
      password: 'PacificPass2026!',
      loginType: 'user'
    });
    userToken = loginRes.data.token;
    const isRoleCorrect = loginRes.data.user?.role === 'Charterer';
    record('auth', 'POST /api/auth/login reads user from PostgreSQL & validates bcrypt', !!userToken && isRoleCorrect, `Token issued for: ${loginRes.data.user?.name} (${loginRes.data.user?.role})`);

    // Verify GET /api/auth/me
    const meRes = await axios.get(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    record('auth', 'GET /api/auth/me resolves current user from PostgreSQL', meRes.data.id === chartererUser.id, `Resolved: ${meRes.data.name} @ ${meRes.data.organizationName}`);

    // Admin login
    const adminLoginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@geoguard.io',
      password: 'AdminPass2026!',
      loginType: 'admin'
    });
    adminToken = adminLoginRes.data.token;
    record('auth', 'Admin Login via PostgreSQL credentials', !!adminToken && adminLoginRes.data.user?.role === 'Admin', `Admin: ${adminLoginRes.data.user?.name}`);

    // Wrong Role rejection
    try {
      await axios.post(`${BASE_URL}/auth/login`, {
        email: 'm.vance@pacificbulk.com',
        password: 'PacificPass2026!',
        loginType: 'admin'
      });
      record('auth', 'Wrong Role Rejection on Admin Login', false, 'Expected 403 Forbidden');
    } catch (err) {
      const is403 = err.response && err.response.status === 403;
      record('auth', 'Wrong Role Rejection on Admin Login', is403, `HTTP ${err.response?.status}: ${err.response?.data?.error?.message}`);
    }
  } catch (err) {
    record('auth', 'Database Authentication Flow', false, err.message);
  }

  // ---------------------------------------------------------------------------
  // SECTION 5 & 10: REAL ANALYSIS PERSISTENCE & ML PIPELINE
  // ---------------------------------------------------------------------------
  console.log('\n--- 3. REAL ANALYSIS PERSISTENCE & ML PIPELINE ---');
  let createdAnalysisId = '';

  try {
    const analysisPayload = {
      cargo: {
        cargoType: 'Thermal Coal (NAR 4700)',
        quantityMT: 650000,
        shipmentsCount: 8,
        laycanStart: '2026-10-01',
        laycanEnd: '2027-09-30'
      },
      route: {
        originPortId: 'TABONEO',
        destinationPortId: 'PARADIP'
      },
      contract: {
        planningDurationMonths: 12,
        preference: 'Hybrid',
        riskTolerance: 'Moderate'
      }
    };

    const res = await axios.post(`${BASE_URL}/analyses`, analysisPayload, {
      headers: { Authorization: `Bearer ${userToken}` }
    });

    createdAnalysisId = res.data.id;
    record('analysis', '1. POST /api/analyses executes 12-step pipeline via Flask ML', !!createdAnalysisId, `Analysis ID: ${createdAnalysisId}`);

    // Verify insertion in PostgreSQL
    const dbAnalysis = await prisma.analysis.findUnique({
      where: { id: createdAnalysisId },
      include: { user: true, organization: true }
    });
    record('analysis', '2. Analysis record actually persisted in PostgreSQL table "Analysis"', !!dbAnalysis, `ID: ${dbAnalysis?.id}, Cost: $${dbAnalysis?.totalDeliveredCost}/t, Org: ${dbAnalysis?.organization?.name}`);

    // Verify Shipments inserted in PostgreSQL
    const dbShipments = await prisma.shipment.findMany({
      where: { analysisId: createdAnalysisId }
    });
    record('analysis', '3. Multi-shipment parcels persisted in PostgreSQL table "Shipment"', dbShipments.length === 8, `Persisted ${dbShipments.length} parcels in database.`);

    // Verify ModelRun telemetry in PostgreSQL
    const dbModelRuns = await prisma.modelRun.findMany({
      where: { analysisId: createdAnalysisId }
    });
    record('analysis', '4. Model telemetry audit record persisted in PostgreSQL table "ModelRun"', dbModelRuns.length > 0, `Model: ${dbModelRuns[0]?.modelName}, MAE: ${dbModelRuns[0]?.mae}, RMSE: ${dbModelRuns[0]?.rmse}`);

    // Verify retrieval via GET /api/analyses
    const listRes = await axios.get(`${BASE_URL}/analyses`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    const foundInList = listRes.data.some(a => a.id === createdAnalysisId);
    record('analysis', '5. GET /api/analyses retrieves analysis from PostgreSQL', foundInList, `List count: ${listRes.data.length}, Found target analysis: ${foundInList}`);

    // Verify retrieval via GET /api/analyses/:id
    const singleRes = await axios.get(`${BASE_URL}/analyses/${createdAnalysisId}`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    record('analysis', '6. GET /api/analyses/:id retrieves exact analysis from PostgreSQL', singleRes.data.id === createdAnalysisId, `Strategy: ${singleRes.data.recommendation?.strategyName}, Delivered Cost: $${singleRes.data.recommendation?.expectedDeliveredCostPerTon}/t`);
  } catch (err) {
    record('analysis', 'Analysis Persistence Flow', false, err.response?.data?.error?.message || err.message);
  }

  // ---------------------------------------------------------------------------
  // SECTION 7: TENANT ISOLATION WITH REAL DATABASE
  // ---------------------------------------------------------------------------
  console.log('\n--- 4. TENANT ISOLATION IN POSTGRESQL ---');
  try {
    // Create Org A and Org B in database
    const orgA = await prisma.organization.upsert({
      where: { id: 'org-tenant-a' },
      update: {},
      create: { id: 'org-tenant-a', name: 'Alpha Maritime Trading', tier: 'COMMERCIAL' }
    });
    const orgB = await prisma.organization.upsert({
      where: { id: 'org-tenant-b' },
      update: {},
      create: { id: 'org-tenant-b', name: 'Beta Freight Logistics', tier: 'COMMERCIAL' }
    });

    const hashA = await bcrypt.hash('AlphaPass2026!', 10);
    const hashB = await bcrypt.hash('BetaPass2026!', 10);

    const userA = await prisma.user.upsert({
      where: { email: 'user.a@alphamaritime.com' },
      update: { organizationId: orgA.id },
      create: {
        id: 'usr-tenant-a',
        name: 'Alice Alpha',
        email: 'user.a@alphamaritime.com',
        passwordHash: hashA,
        role: 'CHARTERER',
        organizationId: orgA.id
      }
    });

    const userB = await prisma.user.upsert({
      where: { email: 'user.b@betafreight.com' },
      update: { organizationId: orgB.id },
      create: {
        id: 'usr-tenant-b',
        name: 'Bob Beta',
        email: 'user.b@betafreight.com',
        passwordHash: hashB,
        role: 'CHARTERER',
        organizationId: orgB.id
      }
    });

    // Login User A and User B
    const loginA = await axios.post(`${BASE_URL}/auth/login`, { email: 'user.a@alphamaritime.com', password: 'AlphaPass2026!' });
    const tokenA = loginA.data.token;
    const loginB = await axios.post(`${BASE_URL}/auth/login`, { email: 'user.b@betafreight.com', password: 'BetaPass2026!' });
    const tokenB = loginB.data.token;

    // Create analysis for Org A
    const resA = await axios.post(`${BASE_URL}/analyses`, {
      cargo: { cargoType: 'Grains', quantityMT: 50000, shipmentsCount: 1 },
      route: { originPortId: 'NEWCASTLE', destinationPortId: 'QINGDAO' },
      contract: { planningDurationMonths: 3, preference: 'Spot', riskTolerance: 'Moderate' }
    }, { headers: { Authorization: `Bearer ${tokenA}` } });
    const analysisAId = resA.data.id;

    // Create analysis for Org B
    const resB = await axios.post(`${BASE_URL}/analyses`, {
      cargo: { cargoType: 'Iron Ore', quantityMT: 180000, shipmentsCount: 1 },
      route: { originPortId: 'TUBARAO', destinationPortId: 'QINGDAO' },
      contract: { planningDurationMonths: 6, preference: 'Medium-Term', riskTolerance: 'Conservative' }
    }, { headers: { Authorization: `Bearer ${tokenB}` } });
    const analysisBId = resB.data.id;

    // Test: User A retrieves list -> sees Analysis A, does NOT see Analysis B
    const listA = await axios.get(`${BASE_URL}/analyses`, { headers: { Authorization: `Bearer ${tokenA}` } });
    const aSeesOwn = listA.data.some(x => x.id === analysisAId);
    const aSeesB = listA.data.some(x => x.id === analysisBId);
    record('tenant', 'User A sees only Organization A analyses', aSeesOwn && !aSeesB, `User A sees own: ${aSeesOwn}, sees Org B: ${aSeesB}`);

    // Test: User A attempts direct access to Analysis B by ID -> must fail (404 Not Found)
    try {
      await axios.get(`${BASE_URL}/analyses/${analysisBId}`, { headers: { Authorization: `Bearer ${tokenA}` } });
      record('tenant', 'Cross-tenant ID isolation enforcement', false, 'User A was able to access Org B analysis ID');
    } catch (err) {
      const isBlocked = err.response && (err.response.status === 404 || err.response.status === 403);
      record('tenant', 'Cross-tenant ID isolation enforcement (User A denied Org B ID)', isBlocked, `HTTP ${err.response?.status}: Access denied / Not found across tenant`);
    }

    // Test: Admin accesses system-wide analyses
    const adminAnalysesRes = await axios.get(`${BASE_URL}/admin/analyses`, { headers: { Authorization: `Bearer ${adminToken}` } });
    const adminSeesBoth = adminAnalysesRes.data.some(x => x.id === analysisAId) && adminAnalysesRes.data.some(x => x.id === analysisBId);
    record('tenant', 'Admin has system-wide access to all tenant records', adminSeesBoth, `Total analyses in database visible to Admin: ${adminAnalysesRes.data.length}`);
  } catch (err) {
    record('tenant', 'Tenant Isolation Test Flow', false, err.message);
  }

  // ---------------------------------------------------------------------------
  // SECTION 8 & 9: ADMIN DATABASE ENDPOINTS & AUTHORIZATION
  // ---------------------------------------------------------------------------
  console.log('\n--- 5. ADMIN DATABASE ENDPOINTS & AUTHORIZATION ---');
  try {
    // Normal user token calls admin endpoints -> must be rejected 403
    const adminEndpoints = ['/admin/dashboard', '/admin/users', '/admin/organizations', '/admin/analyses', '/admin/data-health', '/admin/model-performance'];
    for (const ep of adminEndpoints) {
      try {
        await axios.get(`${BASE_URL}${ep}`, { headers: { Authorization: `Bearer ${userToken}` } });
        record('admin', `Non-Admin rejected on ${ep}`, false, 'Expected 403 Forbidden');
      } catch (err) {
        record('admin', `Non-Admin rejected on ${ep}`, err.response?.status === 403, `HTTP ${err.response?.status}`);
      }
    }

    // Admin token calls admin endpoints -> must succeed 200 with real database data
    const uRes = await axios.get(`${BASE_URL}/admin/users`, { headers: { Authorization: `Bearer ${adminToken}` } });
    record('admin', 'GET /api/admin/users returns real PostgreSQL users', Array.isArray(uRes.data) && uRes.data.length >= 3, `Count: ${uRes.data.length} users from database`);

    const oRes = await axios.get(`${BASE_URL}/admin/organizations`, { headers: { Authorization: `Bearer ${adminToken}` } });
    record('admin', 'GET /api/admin/organizations returns real PostgreSQL organizations', Array.isArray(oRes.data) && oRes.data.length >= 4, `Count: ${oRes.data.length} organizations from database`);

    const dhRes = await axios.get(`${BASE_URL}/admin/data-health`, { headers: { Authorization: `Bearer ${adminToken}` } });
    record('admin', 'GET /api/admin/data-health returns PostgreSQL DataHealth records', Array.isArray(dhRes.data) && dhRes.data.length >= 4, `Feeds: ${dhRes.data.length} records`);

    const dashRes = await axios.get(`${BASE_URL}/admin/dashboard`, { headers: { Authorization: `Bearer ${adminToken}` } });
    record('admin', 'GET /api/admin/dashboard returns real system usage metrics', typeof dashRes.data.activeUsersCount === 'number', `Active Users: ${dashRes.data.activeUsersCount}, Monthly Analyses: ${dashRes.data.analysesThisMonth}`);
  } catch (err) {
    record('admin', 'Admin Database Endpoints Flow', false, err.message);
  }

  // ---------------------------------------------------------------------------
  // SUMMARY
  // ---------------------------------------------------------------------------
  console.log('\n================================================================');
  console.log('            DATABASE VERIFICATION RESULTS SUMMARY               ');
  console.log('================================================================');
  let grandTotal = 0;
  let grandPass = 0;
  for (const [sec, items] of Object.entries(results)) {
    const passCount = items.filter(i => i.pass).length;
    grandTotal += items.length;
    grandPass += passCount;
    console.log(`${sec.toUpperCase().padEnd(16)}: ${passCount}/${items.length} Passed`);
  }
  console.log('----------------------------------------------------------------');
  console.log(`TOTAL SCORE      : ${grandPass}/${grandTotal} Tests Passed (${Math.round((grandPass / grandTotal) * 100)}%)`);
  console.log('================================================================\n');

  await prisma.$disconnect();
}

runVerification().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
