import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';
const FLASK_URL = 'http://localhost:5001';

async function runAudit() {
  console.log('================================================================');
  console.log('     GEOGUARD COMPREHENSIVE BACKEND & INTEGRATION AUDIT SUITE    ');
  console.log('================================================================\n');

  const results = {
    auth: [],
    adminSecurity: [],
    contracts: [],
    pipeline: [],
    forecast: [],
    compatibility: [],
    voyageCost: [],
    optimization: [],
    monteCarlo: [],
    anomaly: [],
    shap: [],
    multiShipment: [],
    tenant: []
  };

  function record(section, name, pass, details) {
    const status = pass ? 'PASS' : 'FAIL';
    results[section].push({ name, pass, details });
    console.log(`[${status}] ${section.toUpperCase()} - ${name}`);
    if (details) console.log(`       -> ${details}`);
  }

  let userToken = '';
  let adminToken = '';
  let chartererUser = null;
  let adminUser = null;

  // -------------------------------------------------------------------------
  // SECTION 4: AUTHENTICATION TESTS
  // -------------------------------------------------------------------------
  console.log('\n--- 1. AUTHENTICATION TESTS ---');

  // Test 4A: Normal User Login
  try {
    const res = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'm.vance@pacificbulk.com',
      password: 'PacificPass2026!',
      loginType: 'user'
    });
    userToken = res.data.token;
    chartererUser = res.data.user;
    const isValid = userToken && chartererUser && chartererUser.role === 'Charterer';
    record('auth', 'Normal User Login (POST /api/auth/login)', isValid, `Role: ${chartererUser?.role}, Org: ${chartererUser?.organizationName}`);
  } catch (err) {
    record('auth', 'Normal User Login (POST /api/auth/login)', false, err.response?.data?.error?.message || err.message);
  }

  // Test 4B: Admin Login
  try {
    const res = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@geoguard.io',
      password: 'AdminPass2026!',
      loginType: 'admin'
    });
    adminToken = res.data.token;
    adminUser = res.data.user;
    const isValid = adminToken && adminUser && adminUser.role === 'Admin';
    record('auth', 'Admin Login (POST /api/auth/login, loginType=admin)', isValid, `Role: ${adminUser?.role}, Org: ${adminUser?.organizationName}`);
  } catch (err) {
    record('auth', 'Admin Login (POST /api/auth/login, loginType=admin)', false, err.response?.data?.error?.message || err.message);
  }

  // Test 4C: Wrong Role (Charterer attempting Admin Login)
  try {
    await axios.post(`${BASE_URL}/auth/login`, {
      email: 'm.vance@pacificbulk.com',
      password: 'PacificPass2026!',
      loginType: 'admin'
    });
    record('auth', 'Wrong Role Rejection (Charterer in Admin Login)', false, 'Expected 403 but request succeeded');
  } catch (err) {
    const isForbidden = err.response && (err.response.status === 403 || err.response.status === 401);
    record('auth', 'Wrong Role Rejection (Charterer in Admin Login)', isForbidden, `HTTP ${err.response?.status}: ${err.response?.data?.error?.message}`);
  }

  // Test 4D: Wrong Password
  try {
    await axios.post(`${BASE_URL}/auth/login`, {
      email: 'm.vance@pacificbulk.com',
      password: 'WrongPassword123!',
      loginType: 'user'
    });
    record('auth', 'Wrong Password Rejection', false, 'Expected 401 but request succeeded');
  } catch (err) {
    const isUnauthorized = err.response && err.response.status === 401;
    record('auth', 'Wrong Password Rejection', isUnauthorized, `HTTP ${err.response?.status}: ${err.response?.data?.error?.message}`);
  }

  // Test 4E: Unauthenticated Access to Protected Endpoint
  try {
    await axios.get(`${BASE_URL}/analyses`);
    record('auth', 'Unauthenticated Access Rejection (GET /api/analyses)', false, 'Expected 401 but request succeeded');
  } catch (err) {
    const isUnauthorized = err.response && err.response.status === 401;
    record('auth', 'Unauthenticated Access Rejection (GET /api/analyses)', isUnauthorized, `HTTP ${err.response?.status}: ${err.response?.data?.error?.message}`);
  }

  // Test Auth Me
  try {
    const res = await axios.get(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    const isValid = res.data && res.data.id === chartererUser.id;
    record('auth', 'Current User Session (GET /api/auth/me)', isValid, `Validated user: ${res.data.name}`);
  } catch (err) {
    record('auth', 'Current User Session (GET /api/auth/me)', false, err.message);
  }

  // -------------------------------------------------------------------------
  // SECTION 5: ADMIN SECURITY & SERVER-SIDE AUTHORIZATION
  // -------------------------------------------------------------------------
  console.log('\n--- 2. ADMIN SECURITY & SERVER-SIDE AUTHORIZATION ---');

  const adminEndpoints = ['/admin/data-health', '/admin/model-performance', '/admin/usage', '/admin/users', '/admin/settings'];

  // Test 5A: Non-Admin Charterer attempting Admin Endpoints
  for (const ep of adminEndpoints) {
    try {
      await axios.get(`${BASE_URL}${ep}`, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      record('adminSecurity', `Charterer Access Denied on ${ep}`, false, 'Expected 403 Forbidden but request succeeded');
    } catch (err) {
      const isForbidden = err.response && err.response.status === 403;
      record('adminSecurity', `Charterer Access Denied on ${ep}`, isForbidden, `HTTP ${err.response?.status}: ${err.response?.data?.error?.code}`);
    }
  }

  // Test 5B: Real Admin Access to Admin Endpoints
  for (const ep of adminEndpoints) {
    try {
      const res = await axios.get(`${BASE_URL}${ep}`, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      const isValid = res.status === 200;
      record('adminSecurity', `Admin Authorized Access on ${ep}`, isValid, `HTTP 200 OK`);
    } catch (err) {
      record('adminSecurity', `Admin Authorized Access on ${ep}`, false, `HTTP ${err.response?.status}: ${err.message}`);
    }
  }

  // -------------------------------------------------------------------------
  // SECTION 8 & 10: FORECAST & ML COMMUNICATION (NODE -> FLASK)
  // -------------------------------------------------------------------------
  console.log('\n--- 3. FORECAST & NODE -> FLASK ML COMMUNICATION ---');

  try {
    const res = await axios.post(`${BASE_URL}/forecast`, {
      vesselClass: 'Panamax',
      horizonWeeks: 8
    });
    const data = res.data;
    const hasFields = data.currentRatePerTon && data.fourWeekForecastPerTon && data.eightWeekForecastPerTon && Array.isArray(data.timeSeries);
    const hasUncertainty = data.forecastRangeText && data.uncertaintyRange;
    record('forecast', 'POST /api/forecast (XGBoost + SARIMAX Quantile Ensemble)', hasFields && hasUncertainty, `Current: $${data.currentRatePerTon}, 4-Wk: $${data.fourWeekForecastPerTon}, 8-Wk: $${data.eightWeekForecastPerTon}, Range: ${data.forecastRangeText}`);
  } catch (err) {
    record('forecast', 'POST /api/forecast', false, err.message);
  }

  // -------------------------------------------------------------------------
  // SECTION 11: COMPATIBILITY (DETERMINISTIC TWO-SIDED LIMITS)
  // -------------------------------------------------------------------------
  console.log('\n--- 4. TWO-SIDED VESSEL-PORT COMPATIBILITY ---');

  try {
    // Panamax to Paradip
    const res1 = await axios.post(`${BASE_URL}/compatibility`, {
      vesselClass: 'Panamax',
      originPortId: 'port-id-taboneo',
      destinationPortId: 'port-in-paradip'
    });
    const isPnxFeasible = res1.data.feasible === true;
    record('compatibility', 'Panamax @ Taboneo -> Paradip Compatibility', isPnxFeasible, `Draft Margin: ${res1.data.draftMarginDestM}m, Lightering: ${res1.data.requiresLightering}`);

    // Capesize to Paradip (Draft 18.2m > Paradip 14.5m limit -> requires lightering)
    const res2 = await axios.post(`${BASE_URL}/compatibility`, {
      vesselClass: 'Capesize',
      originPortId: 'port-id-taboneo',
      destinationPortId: 'port-in-paradip'
    });
    const isCapeLightering = res2.data.requiresLightering === true;
    record('compatibility', 'Capesize @ Taboneo -> Paradip Lightering Detection', isCapeLightering, `Draft Margin: ${res2.data.draftMarginDestM}m, Lightering: ${res2.data.requiresLightering}`);
  } catch (err) {
    record('compatibility', 'POST /api/compatibility', false, err.message);
  }

  // -------------------------------------------------------------------------
  // SECTION 12: VOYAGE COST CALCULATION
  // -------------------------------------------------------------------------
  console.log('\n--- 5. VOYAGE COST CALCULATION ---');

  // Manual calculation check:
  // Route distance = 2850 NM
  // Speed = 12.5 knots -> 2850 / (12.5 * 24) = 9.5 steaming days
  // Daily fuel = 28.5 MT -> Total fuel = 9.5 * 28.5 = 270.75 MT
  // Bunker price = $620/MT -> Total bunker = 270.75 * 620 = $167,865
  // Cargo = 75,000 MT -> Bunker cost/ton = $167,865 / 75000 = $2.24/ton
  // Waiting = 36h / 24 * $16000 = $24,000 / 75000 = $0.32/ton
  // Base freight = $14.20/ton
  // Port dues = $1.25, Demurrage = $0.45, Repositioning = $0.45
  // Expected total delivered = 14.20 + 2.24 + 1.25 + 0.32 + 0.45 + 0.45 = $18.91/ton
  try {
    const { voyageCostService } = await import('./dist/services/voyageCostService.js');
    const cost = voyageCostService.calculateBreakdown({
      freightRatePerTon: 14.20,
      distanceNM: 2850,
      cargoQuantityMT: 75000,
      vesselClass: 'Panamax',
      dailyFuelMT: 28.5,
      bunkerPricePerMT: 620.0,
      waitingHours: 36.0,
      needsLightering: false
    });
    const isAccurate = Math.abs(cost.totalDeliveredCostPerTon - 18.91) < 0.1;
    record('voyageCost', 'Delivered Cost Verification against Economic Formula', isAccurate, `Computed: $${cost.totalDeliveredCostPerTon}/ton (Freight: $${cost.freightPerTon}, Bunker: $${cost.bunkerCostPerTon}, Port: $${cost.portChargesPerTon}, Waiting: $${cost.waitingCostPerTon})`);
  } catch (err) {
    record('voyageCost', 'Voyage Cost Formula Check', false, err.message);
  }

  // -------------------------------------------------------------------------
  // SECTION 13: CONTRACT MIX OPTIMIZATION
  // -------------------------------------------------------------------------
  console.log('\n--- 6. CONTRACT MIX PORTFOLIO OPTIMIZATION ---');

  try {
    // Moderate risk
    const optMod = await axios.post(`${BASE_URL}/optimization`, {
      cargoQuantityMT: 650000,
      shipmentsCount: 9,
      planningDurationMonths: 12,
      riskTolerance: 'Moderate'
    });
    // Conservative risk
    const optCons = await axios.post(`${BASE_URL}/optimization`, {
      cargoQuantityMT: 650000,
      shipmentsCount: 9,
      planningDurationMonths: 12,
      riskTolerance: 'Conservative'
    });

    const isDynamic = optMod.data.mixAllocation !== optCons.data.mixAllocation;
    record('optimization', 'Dynamic Allocation based on Risk Tolerance (Moderate vs Conservative)', isDynamic, `Moderate: ${optMod.data.mixAllocation} | Conservative: ${optCons.data.mixAllocation}`);
    record('optimization', 'Four Standard Contract Strategies Present (Spot, ST, MT, Hybrid)', optMod.data.strategies?.length === 4, `Strategies returned: ${optMod.data.strategies?.map(s => s.strategy).join(', ')}`);
  } catch (err) {
    record('optimization', 'POST /api/optimization', false, err.message);
  }

  // -------------------------------------------------------------------------
  // SECTION 14: MONTE CARLO RISK SIMULATION (FLASK /simulate)
  // -------------------------------------------------------------------------
  console.log('\n--- 7. MONTE CARLO SIMULATION (1,000+ RUNS) ---');

  try {
    const sim1 = await axios.post(`${FLASK_URL}/simulate`, { baseCost: 20.0, scenarioCount: 1000 });
    const sim2 = await axios.post(`${FLASK_URL}/simulate`, { baseCost: 30.0, scenarioCount: 1000 });

    const hasScenarios = sim1.data.scenarioCount >= 1000;
    const hasVarCvar = sim1.data.valueAtRisk95 && sim1.data.conditionalValueAtRisk95;
    const changesWithInput = sim1.data.expectedCostPerTon !== sim2.data.expectedCostPerTon;

    record('monteCarlo', 'Monte Carlo 1,000+ Iterations & Risk Metrics', hasScenarios && hasVarCvar, `Scenarios: ${sim1.data.scenarioCount}, Expected: $${sim1.data.expectedCostPerTon}, VaR95: $${sim1.data.valueAtRisk95}, CVaR95: $${sim1.data.conditionalValueAtRisk95}`);
    record('monteCarlo', 'Outputs Vary with Input Assumptions (Non-hardcoded)', changesWithInput, `Base $20 -> Expected $${sim1.data.expectedCostPerTon} vs Base $30 -> Expected $${sim2.data.expectedCostPerTon}`);
  } catch (err) {
    record('monteCarlo', 'Flask /simulate', false, err.message);
  }

  // -------------------------------------------------------------------------
  // SECTION 15: ANOMALY DETECTION (FLASK /anomaly)
  // -------------------------------------------------------------------------
  console.log('\n--- 8. ISOLATION FOREST ANOMALY SCAN ---');

  try {
    // 1. Normal telemetry
    const aNorm = await axios.post(`${FLASK_URL}/anomaly`, {
      rates: [14.0, 14.1, 14.2],
      bunkerPrices: [615.0, 618.0, 620.0],
      congestionHours: 24.0
    });
    // 2. Severe outlier spike (Rate +100%, bunker +50%, congestion 120h)
    const aOutlier = await axios.post(`${FLASK_URL}/anomaly`, {
      rates: [28.5, 32.0, 35.0],
      bunkerPrices: [900.0, 950.0, 980.0],
      congestionHours: 120.0
    });
    // 3. Missing telemetry
    const aMissing = await axios.post(`${FLASK_URL}/anomaly`, {});

    const normPass = aNorm.data.status === 'NORMAL';
    const outlierPass = aOutlier.data.status === 'WARNING';
    const missingPass = aMissing.data.status === 'UNAVAILABLE';

    record('anomaly', 'Status NORMAL on Nominal Conditions', normPass, `Status: ${aNorm.data.status}`);
    record('anomaly', 'Status WARNING on Extreme Market Disruption', outlierPass, `Status: ${aOutlier.data.status}`);
    record('anomaly', 'Status UNAVAILABLE when Data is Absent', missingPass, `Status: ${aMissing.data.status}`);
  } catch (err) {
    record('anomaly', 'Flask /anomaly', false, err.message);
  }

  // -------------------------------------------------------------------------
  // SECTION 9 & 17: COMPLETE ANALYSIS PIPELINE & MULTI-SHIPMENT
  // -------------------------------------------------------------------------
  console.log('\n--- 9. COMPLETE PIPELINE & MULTI-SHIPMENT PARCEL OPTIMIZATION ---');

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
        originPortId: 'port-id-taboneo',
        destinationPortId: 'port-in-paradip'
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

    const report = res.data;
    const hasRec = report.recommendation && report.recommendation.strategyName;
    const hasCost = report.costBreakdown && report.costBreakdown.totalDeliveredCostPerTon;
    const hasRisk = report.riskSimulation && report.riskSimulation.scenarioCount >= 1000;
    const hasSched = Array.isArray(report.shipmentSchedule) && report.shipmentSchedule.length === 8;
    const schedColumns = hasSched && report.shipmentSchedule[0].shipment && report.shipmentSchedule[0].month && report.shipmentSchedule[0].cargo && report.shipmentSchedule[0].vesselClass && report.shipmentSchedule[0].contractAllocation && report.shipmentSchedule[0].estimatedCost;

    record('pipeline', '12-Step Decision Analysis Execution', hasRec && hasCost && hasRisk, `Strategy: ${report.recommendation?.strategyName}, Delivered Cost: $${report.costBreakdown?.totalDeliveredCostPerTon}/t, Timing: ${report.recommendation?.timingAdvice}`);
    record('multiShipment', 'Multi-Shipment Schedule with 8 Parcels & Required Columns', hasSched && schedColumns, `Parcels: ${report.shipmentSchedule?.length}, Sample: ${report.shipmentSchedule?.[0]?.shipment} (${report.shipmentSchedule?.[0]?.cargo}, ${report.shipmentSchedule?.[0]?.contractAllocation}, ${report.shipmentSchedule?.[0]?.estimatedCost})`);
  } catch (err) {
    record('pipeline', 'POST /api/analyses', false, err.response?.data?.error?.message || err.message);
  }

  // -------------------------------------------------------------------------
  // SECTION 20: LIVE DATA AUDIT
  // -------------------------------------------------------------------------
  console.log('\n--- 10. LIVE DATA AUDIT ---');

  try {
    const snap = await axios.get(`${BASE_URL}/market/snapshot`);
    const alerts = await axios.get(`${BASE_URL}/market/alerts`);
    const hasData = snap.data.length > 0 && alerts.data.length > 0;
    record('contracts', 'Market Data (Baltic Snapshots & Early Warning Alerts)', hasData, `Snapshots: ${snap.data.length} indices, Alerts: ${alerts.data.length}`);
  } catch (err) {
    record('contracts', 'Market Data API', false, err.message);
  }

  console.log('\n================================================================');
  console.log('                      AUDIT SUMMARY RESULTS                     ');
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
}

runAudit().catch(console.error);
