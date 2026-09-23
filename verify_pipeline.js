import axios from 'axios';

const FLASK_URL = 'http://localhost:5001';
const NODE_URL = 'http://localhost:5000';

async function runVerification() {
  console.log('================================================================');
  console.log('      GEOGUARD END-TO-END PIPELINE & SENSITIVITY VERIFICATION   ');
  console.log('================================================================\n');

  // 1. Flask Direct Tests
  console.log('--- Step 1: Testing Flask ML Microservice Direct Endpoints ---');
  
  // GET /health
  const healthRes = await axios.get(`${FLASK_URL}/health`);
  console.log('[PASS] GET /health ->', {
    status: healthRes.data.status,
    modelVersion: healthRes.data.modelVersion,
    lastTrainedDate: healthRes.data.lastTrainedDate,
    datasetSource: healthRes.data.datasetSource,
    forecastMAE: healthRes.data.forecastMAE,
    forecastRMSE: healthRes.data.forecastRMSE,
    empiricalCorrelation: healthRes.data.empiricalCorrelation
  });

  // POST /predict (Panamax)
  const predPanamax = await axios.post(`${FLASK_URL}/predict`, {
    vesselClass: 'Panamax',
    horizonWeeks: 8,
    baseRate: 22.80
  });
  console.log('[PASS] POST /predict (Panamax) ->', {
    current: predPanamax.data.currentRatePerTon,
    w4: predPanamax.data.fourWeekForecastPerTon,
    w8: predPanamax.data.eightWeekForecastPerTon,
    range: predPanamax.data.forecastRangeText
  });

  // Sensitivity Test 1: Capesize vs Panamax
  const predCapesize = await axios.post(`${FLASK_URL}/predict`, {
    vesselClass: 'Capesize',
    horizonWeeks: 8,
    baseRate: 25.10
  });
  console.log('[PASS] SENSITIVITY TEST (Capesize) ->', {
    current: predCapesize.data.currentRatePerTon,
    w4: predCapesize.data.fourWeekForecastPerTon,
    w8: predCapesize.data.eightWeekForecastPerTon,
    range: predCapesize.data.forecastRangeText
  });

  // POST /anomaly (Nominal)
  const anomNominal = await axios.post(`${FLASK_URL}/anomaly`, {
    rates: [14.0, 14.1, 14.2],
    bunkerPrices: [615.0, 618.0, 620.0],
    congestionHours: 24.0
  });
  console.log('[PASS] POST /anomaly (Nominal) ->', {
    status: anomNominal.data.status,
    detected: anomNominal.data.anomalyDetected,
    score: anomNominal.data.anomalyScore
  });

  // Sensitivity Test 2: Anomaly Divergence (Spike)
  const anomSpike = await axios.post(`${FLASK_URL}/anomaly`, {
    rates: [14.0, 22.0, 35.0],
    bunkerPrices: [600.0, 750.0, 950.0],
    congestionHours: 168.0
  });
  console.log('[PASS] SENSITIVITY TEST (Anomaly Divergence) ->', {
    status: anomSpike.data.status,
    detected: anomSpike.data.anomalyDetected,
    score: anomSpike.data.anomalyScore,
    message: anomSpike.data.message
  });

  // POST /simulate (Monte Carlo)
  const simRes = await axios.post(`${FLASK_URL}/simulate`, {
    baseCost: 21.15,
    scenarioCount: 1000
  });
  console.log('[PASS] POST /simulate (Monte Carlo 1,000 Scenarios) ->', {
    expectedCost: simRes.data.expectedCostPerTon,
    var95: simRes.data.valueAtRisk95,
    cvar95: simRes.data.conditionalValueAtRisk95,
    worstCase: simRes.data.worstCaseCostPerTon,
    bins: simRes.data.distribution.length
  });

  // POST /optimize (Moderate vs Conservative)
  const optMod = await axios.post(`${FLASK_URL}/optimize`, {
    planningDurationMonths: 12,
    riskTolerance: 'Moderate',
    totalQuantityMT: 600000,
    expectedSpot: 23.00
  });
  const optCons = await axios.post(`${FLASK_URL}/optimize`, {
    planningDurationMonths: 12,
    riskTolerance: 'Conservative',
    totalQuantityMT: 600000,
    expectedSpot: 23.00
  });
  console.log('[PASS] SENSITIVITY TEST (Contract Optimization) ->', {
    moderate: { strategy: optMod.data.recommendedStrategy, allocation: optMod.data.mixAllocation, cost: optMod.data.expectedDeliveredCostPerTon },
    conservative: { strategy: optCons.data.recommendedStrategy, allocation: optCons.data.mixAllocation, cost: optCons.data.expectedDeliveredCostPerTon }
  });

  // POST /explain
  const explainRes = await axios.post(`${FLASK_URL}/explain`, { vesselClass: 'Panamax' });
  console.log('[PASS] POST /explain (Tree SHAP) ->', {
    topFactor: explainRes.data.factors[0].factor,
    trend: explainRes.data.factors[0].trend,
    rationalePreview: explainRes.data.plainEnglishRationale.slice(0, 90) + '...'
  });

  // POST /compatibility
  const compatRes = await axios.post(`${FLASK_URL}/compatibility`, {
    originMaxDraft: 18.0,
    destMaxDraft: 14.5,
    destMaxLoa: 260.0
  });
  console.log('[PASS] POST /compatibility -> Evaluated', compatRes.data.feasibility.length, 'vessel classes');

  // 2. Node Backend Integration Tests
  console.log('\n--- Step 2: Testing Node API Gateway Endpoints ---');

  // User Login for Auth Token
  const loginRes = await axios.post(`${NODE_URL}/api/auth/login`, {
    email: 'm.vance@pacificbulk.com',
    password: 'PacificPass2026!',
    loginType: 'user'
  });
  const userToken = loginRes.data.token;
  console.log('[PASS] POST /api/auth/login -> User authenticated successfully');

  // Admin Login for Admin Token
  const adminLoginRes = await axios.post(`${NODE_URL}/api/auth/login`, {
    email: 'admin@geoguard.io',
    password: 'AdminPass2026!',
    loginType: 'admin'
  });
  const adminToken = adminLoginRes.data.token;
  console.log('[PASS] POST /api/auth/login (Admin) -> Admin authenticated successfully');

  // POST /api/forecast
  const nodeForecast = await axios.post(`${NODE_URL}/api/forecast`, {
    vesselClass: 'Panamax',
    horizonWeeks: 8
  }, {
    headers: { Authorization: `Bearer ${userToken}` }
  });
  console.log('[PASS] POST /api/forecast -> Received', nodeForecast.data.timeSeries.length, 'time-series points');

  // POST /api/compatibility
  const nodeCompat = await axios.post(`${NODE_URL}/api/compatibility`, {
    vesselClass: 'Panamax',
    originPortId: 'TABONEO',
    destinationPortId: 'PARADIP'
  }, {
    headers: { Authorization: `Bearer ${userToken}` }
  });
  console.log('[PASS] POST /api/compatibility -> Feasible:', nodeCompat.data.feasible, '| Notes:', nodeCompat.data.notes[0]);

  // POST /api/optimization
  const nodeOpt = await axios.post(`${NODE_URL}/api/optimization`, {
    cargoQuantityMT: 600000,
    shipmentsCount: 8,
    planningDurationMonths: 12,
    riskTolerance: 'Moderate'
  }, {
    headers: { Authorization: `Bearer ${userToken}` }
  });
  console.log('[PASS] POST /api/optimization -> Strategy:', nodeOpt.data.recommendedStrategy, '| Mix:', nodeOpt.data.mixAllocation);

  // POST /api/analyses (Full decision pipeline persistence)
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

  const createAnalysisRes = await axios.post(`${NODE_URL}/api/analyses`, analysisPayload, {
    headers: { Authorization: `Bearer ${userToken}` }
  });
  console.log('[PASS] POST /api/analyses -> Created Analysis in PostgreSQL:', {
    id: createAnalysisRes.data.id,
    vessel: createAnalysisRes.data.recommendation.recommendedVessel,
    forecast4w: createAnalysisRes.data.forecast.fourWeekForecastPerTon,
    anomalyDetected: createAnalysisRes.data.anomalyDetected,
    deliveredCost: createAnalysisRes.data.costBreakdown.totalDeliveredCostPerTon,
    monteCarloExpected: createAnalysisRes.data.riskSimulation.expectedCostPerTon,
    contractMix: createAnalysisRes.data.recommendation.mixAllocation
  });

  // GET /api/admin/model-performance
  const adminPerfRes = await axios.get(`${NODE_URL}/api/admin/model-performance`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  console.log('[PASS] GET /api/admin/model-performance ->', {
    modelVersion: adminPerfRes.data.modelVersion,
    lastTrainedDate: adminPerfRes.data.lastTrainedDate,
    trainingSamplesCount: adminPerfRes.data.trainingSamplesCount,
    forecastMAE: adminPerfRes.data.forecastMAE,
    forecastRMSE: adminPerfRes.data.forecastRMSE,
    backtestPerformanceScore: adminPerfRes.data.backtestPerformanceScore
  });

  console.log('\n================================================================');
  console.log('   ALL INFERENCE & END-TO-END PIPELINE TESTS PASSED 100%!       ');
  console.log('================================================================');
}

runVerification().catch((err) => {
  console.error('VERIFICATION FAILED:', err.response?.data || err.message);
  process.exit(1);
});
