import axios from 'axios';
const BASE_URL = 'http://localhost:5000/api';

async function runNodeVerification() {
  console.log('================================================================');
  console.log('        NODE API, POSTGRESQL & SECURITY AUDIT                   ');
  console.log('================================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition, name, details = '') {
    total++;
    if (condition) {
      passed++;
      console.log(`[PASS] ${name} ${details ? '-> ' + details : ''}`);
    } else {
      console.error(`[FAIL] ${name} ${details ? '-> ' + details : ''}`);
    }
  }

  // 1. Authentication Pathways
  console.log('--- 1. Auth & Pathway Tests ---');
  let userToken = '';
  let adminToken = '';
  let userBToken = '';

  try {
    // Normal user login
    const uRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'm.vance@pacificbulk.com',
      password: 'PacificPass2026!',
      loginType: 'user'
    });
    userToken = uRes.data.token;
    assert(uRes.status === 200 && uRes.data.user.role === 'Charterer', 'User Login (Charterer)', `Role: ${uRes.data.user.role}`);
  } catch (e) {
    assert(false, 'User Login (Charterer)', e.message);
  }

  try {
    // Admin login
    const aRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@geoguard.io',
      password: 'AdminPass2026!',
      loginType: 'admin'
    });
    adminToken = aRes.data.token;
    assert(aRes.status === 200 && aRes.data.user.role === 'Admin', 'Admin Login (Admin)', `Role: ${aRes.data.user.role}`);
  } catch (e) {
    assert(false, 'Admin Login (Admin)', e.message);
  }

  try {
    // User B login
    const ubRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'user.b@betafreight.com',
      password: 'BetaPass2026!',
      loginType: 'user'
    });
    userBToken = ubRes.data.token;
    assert(ubRes.status === 200, 'User B Login (Beta Freight)', `Org: ${ubRes.data.user.organizationName}`);
  } catch (e) {
    assert(false, 'User B Login', e.message);
  }

  // 2. Security & RBAC Enforcement
  console.log('\n--- 2. Security & RBAC Enforcement Tests ---');

  // Normal user accessing admin API -> 403
  try {
    await axios.get(`${BASE_URL}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    assert(false, 'RBAC: Normal user blocked from /api/admin/dashboard', 'Allowed unexpectedly');
  } catch (e) {
    assert(e.response?.status === 403, 'RBAC: Normal user blocked from /api/admin/dashboard', `Rejected with HTTP ${e.response?.status}`);
  }

  // Unauthenticated request to protected endpoint -> 401
  try {
    await axios.get(`${BASE_URL}/auth/me`);
    assert(false, 'Security: Unauthenticated request rejected', 'Allowed unexpectedly');
  } catch (e) {
    assert(e.response?.status === 401, 'Security: Unauthenticated request rejected', `Rejected with HTTP ${e.response?.status}`);
  }

  // Invalid JWT token -> 401
  try {
    await axios.get(`${BASE_URL}/auth/me`, {
      headers: { Authorization: 'Bearer invalid_garbage_token_123' }
    });
    assert(false, 'Security: Invalid token rejected', 'Allowed unexpectedly');
  } catch (e) {
    assert(e.response?.status === 401, 'Security: Invalid token rejected', `Rejected with HTTP ${e.response?.status}`);
  }

  // Normal user attempting admin login pathway -> 403
  try {
    await axios.post(`${BASE_URL}/auth/login`, {
      email: 'm.vance@pacificbulk.com',
      password: 'PacificPass2026!',
      loginType: 'admin'
    });
    assert(false, 'Security: Normal user rejected from Admin Login tab', 'Allowed unexpectedly');
  } catch (e) {
    assert(e.response?.status === 403, 'Security: Normal user rejected from Admin Login tab', `Rejected with HTTP ${e.response?.status}`);
  }

  // 3. PostgreSQL Persistence & Tenant Isolation
  console.log('\n--- 3. PostgreSQL Persistence & Tenant Isolation ---');
  let createdAnalysisId = '';

  try {
    const analysisPayload = {
      cargo: {
        cargoType: 'Thermal Coal',
        quantityMT: 75000,
        shipmentsCount: 1,
        laycanStart: '2026-10-01',
        laycanEnd: '2026-10-10'
      },
      route: {
        originPortName: 'Taboneo Anchorage',
        originCountry: 'Indonesia',
        originPortId: 'TABONEO',
        destinationPortName: 'Paradip Port',
        destinationCountry: 'India',
        destinationPortId: 'PARADIP'
      },
      contract: {
        planningDurationMonths: 12,
        preference: 'Hybrid',
        riskTolerance: 'Moderate'
      }
    };

    const cRes = await axios.post(`${BASE_URL}/analyses`, analysisPayload, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    createdAnalysisId = cRes.data.id;
    assert(cRes.status === 201 && !!createdAnalysisId, 'Persistence: Analysis created in PostgreSQL', `ID: ${createdAnalysisId}`);

    // User A can view the analysis
    const listA = await axios.get(`${BASE_URL}/analyses`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    const foundInA = listA.data.some(a => a.id === createdAnalysisId);
    assert(foundInA, 'Tenant Isolation: User A sees their own analysis', `Total User A analyses: ${listA.data.length}`);

    // User B (different organization) CANNOT see User A's analysis
    const listB = await axios.get(`${BASE_URL}/analyses`, {
      headers: { Authorization: `Bearer ${userBToken}` }
    });
    const foundInB = listB.data.some(a => a.id === createdAnalysisId);
    assert(!foundInB, 'Tenant Isolation: User B CANNOT see User A private analysis', `User B visible analyses: ${listB.data.length} (Private analysis isolated)`);

    // Admin can see all analyses system-wide
    const adminAnalyses = await axios.get(`${BASE_URL}/admin/analyses`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const foundInAdmin = adminAnalyses.data.some(a => a.id === createdAnalysisId);
    assert(foundInAdmin, 'Admin Authorization: System Admin can view all analyses system-wide', `Total system analyses: ${adminAnalyses.data.length}`);

  } catch (e) {
    assert(false, 'PostgreSQL Persistence & Tenant Isolation', e.response?.data?.message || e.message);
  }

  // 4. Admin Telemetry & Data Health
  console.log('\n--- 4. Admin Console Telemetry ---');
  try {
    const dataHealth = await axios.get(`${BASE_URL}/admin/data-health`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(dataHealth.status === 200 && dataHealth.data.length >= 5, 'Admin: Data health telemetry retrieved', `Feed count: ${dataHealth.data.length}`);

    const modelPerf = await axios.get(`${BASE_URL}/admin/model-performance`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(modelPerf.data.modelVersion === 'geoguard-v2026.09.09', 'Admin: Real model version geoguard-v2026.09.09 retrieved', `MAE: ${modelPerf.data.forecastMAE}, Samples: ${modelPerf.data.trainingSamplesCount}`);
  } catch (e) {
    assert(false, 'Admin Telemetry', e.message);
  }

  console.log(`\nResults: ${passed}/${total} checks passed (${Math.round((passed / total) * 100)}%)`);
}

runNodeVerification();
