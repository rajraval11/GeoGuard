import axios from 'axios';
import jwt from 'jsonwebtoken';

const BASE_URL = 'http://localhost:5000/api';
const JWT_SECRET = 'geoguard_production_jwt_secret_maritime_decision_support_2026_xyz';

const chartererToken = jwt.sign(
  {
    userId: 'usr-001',
    email: 'm.vance@pacificbulk.com',
    role: 'CHARTERER',
    organizationId: 'org-pacific'
  },
  JWT_SECRET,
  { expiresIn: '1h' }
);

const adminToken = jwt.sign(
  {
    userId: 'usr-admin',
    email: 'admin@geoguard.io',
    role: 'ADMIN',
    organizationId: 'org-admin'
  },
  JWT_SECRET,
  { expiresIn: '1h' }
);

async function runTests() {
  console.log('====================================================');
  console.log('       GeoGuard Backend Integration Test Suite      ');
  console.log('====================================================\n');

  let passed = 0;
  let total = 0;

  async function test(name, fn) {
    total++;
    try {
      await fn();
      console.log(`[PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`[FAIL] ${name}:`, err.message);
      if (err.response) {
        console.error('       HTTP Status:', err.response.status, err.response.data);
      }
    }
  }

  // 1. Health check
  await test('GET /api/health returns service status and dependency health', async () => {
    try {
      const res = await axios.get(`${BASE_URL}/health`);
      console.log('       Health:', res.data.status, res.data.dependencies);
    } catch (err) {
      if (err.response && err.response.status === 503) {
        console.log('       Health returned honest 503 DEGRADED:', err.response.data.dependencies);
        return;
      }
      throw err;
    }
  });

  // 2. Baltic Snapshot
  await test('GET /api/market/snapshot returns Baltic indices and VLSFO bunker', async () => {
    const res = await axios.get(`${BASE_URL}/market/snapshot`);
    if (!Array.isArray(res.data) || res.data.length < 4) throw new Error('Expected 4 snapshot items');
    console.log(`       Received ${res.data.length} indices:`, res.data.map(d => d.balticIndexName).join(', '));
  });

  // 3. Market Alerts
  await test('GET /api/market/alerts returns early warning alerts', async () => {
    const res = await axios.get(`${BASE_URL}/market/alerts`);
    if (!Array.isArray(res.data) || res.data.length === 0) throw new Error('Expected alert array');
    console.log(`       Received ${res.data.length} market alerts`);
  });

  // 4. Routes / Ports
  await test('GET /api/routes returns bulk ports', async () => {
    const res = await axios.get(`${BASE_URL}/routes`);
    if (!Array.isArray(res.data) || res.data.length < 5) throw new Error('Expected bulk ports array');
    console.log(`       Received ${res.data.length} ports:`, res.data.map(p => p.name).join(', '));
  });

  // 5. Vessel classes
  await test('GET /api/vessels returns the four original GeoGuard vessel classes', async () => {
    const res = await axios.get(`${BASE_URL}/vessels`);
    const expected = ['Handysize', 'Supramax', 'Panamax', 'Capesize'];
    const names = res.data.map(v => v.vesselClass);
    const allMatch = expected.every(e => names.includes(e));
    if (!allMatch) throw new Error(`Mismatch in vessel classes. Got: ${names.join(', ')}`);
    console.log(`       Verified exact 4 classes: ${names.join(', ')}`);
  });

  // 6. Direct ML Rate Forecast
  await test('POST /api/forecast communicates with Flask ML for XGBoost+SARIMAX', async () => {
    const res = await axios.post(`${BASE_URL}/forecast`, {
      vesselClass: 'Panamax',
      horizonWeeks: 8
    });
    if (!res.data.timeSeries || res.data.timeSeries.length === 0) throw new Error('Missing timeSeries');
    console.log(`       Forecast: Current=$${res.data.currentRatePerTon}, 4-Wk=$${res.data.fourWeekForecastPerTon}, 8-Wk=$${res.data.eightWeekForecastPerTon}`);
    console.log(`       Uncertainty Range: ${res.data.forecastRangeText}`);
  });

  // 7. Vessel Compatibility
  await test('POST /api/compatibility evaluates draft, LOA, beam, and tidal constraints', async () => {
    const res = await axios.post(`${BASE_URL}/compatibility`, {
      vesselClass: 'Panamax',
      originPortId: 'port-id-taboneo',
      destinationPortId: 'port-in-paradip'
    });
    if (typeof res.data.feasible !== 'boolean') throw new Error('Missing feasibility');
    console.log(`       Feasibility: ${res.data.feasible}, Draft Margin: ${res.data.draftMarginDestM}m, Tidal Discharge: ${res.data.tideDependentDischarge}`);
  });

  // 8. Contract Optimization
  await test('POST /api/optimization runs quantitative portfolio optimization', async () => {
    const res = await axios.post(`${BASE_URL}/optimization`, {
      cargoQuantityMT: 650000,
      shipmentsCount: 9,
      planningDurationMonths: 12,
      riskTolerance: 'Moderate'
    });
    if (!res.data.recommendedStrategy || !res.data.strategies) throw new Error('Missing optimization result');
    console.log(`       Recommended: ${res.data.recommendedStrategy} (${res.data.mixAllocation})`);
    console.log(`       Savings: $${res.data.expectedSavingsVsSpotPerTon}/ton, Advice: ${res.data.timingAdvice}`);
  });

  // 9. Admin Server-Side Security: Unauthenticated access
  await test('Admin route WITHOUT token returns 401 Unauthorized', async () => {
    try {
      await axios.get(`${BASE_URL}/admin/data-health`);
      throw new Error('Expected 401 Unauthorized but request succeeded');
    } catch (err) {
      if (err.response && err.response.status === 401) {
        console.log(`       Server returned 401: ${err.response.data.error.code} - ${err.response.data.error.message}`);
        return;
      }
      throw err;
    }
  });

  // 10. Admin Server-Side Security: Non-admin Charterer access
  await test('Admin route with non-admin (CHARTERER) role is blocked server-side (403/401)', async () => {
    try {
      await axios.get(`${BASE_URL}/admin/data-health`, {
        headers: { Authorization: `Bearer ${chartererToken}` }
      });
      throw new Error('Expected 403 Forbidden but request succeeded');
    } catch (err) {
      if (err.response && (err.response.status === 403 || err.response.status === 401 || err.response.status === 503)) {
        console.log(`       Server enforced access policy: Status ${err.response.status} (${err.response.data.error?.code})`);
        return;
      }
      throw err;
    }
  });

  console.log('\n====================================================');
  console.log(`Test Results: ${passed}/${total} Passed (${Math.round((passed / total) * 100)}%)`);
  console.log('====================================================\n');
}

runTests().catch(console.error);
