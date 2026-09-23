import axios from 'axios';
const base = 'http://localhost:5001';

async function testFlask() {
  const endpoints = [
    { name: 'GET /health', fn: () => axios.get(base + '/health') },
    { name: 'POST /predict', fn: () => axios.post(base + '/predict', { vesselClass: 'Panamax', horizonWeeks: 8, baseRate: 22.80 }) },
    { name: 'POST /anomaly (nominal)', fn: () => axios.post(base + '/anomaly', { rates: [14.0, 14.1, 14.2], bunkerPrices: [615.0, 618.0, 620.0], congestionHours: 24.0 }) },
    { name: 'POST /anomaly (spike)', fn: () => axios.post(base + '/anomaly', { rates: [14.0, 22.0, 35.0], bunkerPrices: [600.0, 750.0, 950.0], congestionHours: 168.0 }) },
    { name: 'POST /simulate', fn: () => axios.post(base + '/simulate', { baseCost: 21.15, scenarioCount: 1000 }) },
    { name: 'POST /optimize', fn: () => axios.post(base + '/optimize', { planningDurationMonths: 12, riskTolerance: 'Moderate', totalQuantityMT: 600000, expectedSpot: 23.00 }) },
    { name: 'POST /explain', fn: () => axios.post(base + '/explain', { vesselClass: 'Panamax' }) },
    { name: 'POST /compatibility', fn: () => axios.post(base + '/compatibility', { originMaxDraft: 18.0, destMaxDraft: 14.5, destMaxLoa: 260.0 }) },
  ];

  console.log('Testing Flask ML Microservice Endpoints (port 5001):');
  for (const ep of endpoints) {
    const t0 = Date.now();
    try {
      const res = await ep.fn();
      const dt = Date.now() - t0;
      console.log(`[PASS] ${ep.name.padEnd(25)} | Status: ${res.status} | Latency: ${dt}ms | Keys: ${Object.keys(res.data).slice(0, 4).join(', ')}`);
    } catch (e) {
      console.error(`[FAIL] ${ep.name.padEnd(25)} | Error: ${e.message}`);
    }
  }
}
testFlask();
