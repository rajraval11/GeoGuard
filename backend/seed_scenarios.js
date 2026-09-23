import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

async function generateScenarios() {
  console.log('Logging in as Charterer...');
  const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
    email: 'm.vance@pacificbulk.com',
    password: 'PacificPass2026!'
  });
  
  const token = loginRes.data.token;
  console.log('Login successful. Token acquired.');

  const headers = {
    Authorization: `Bearer ${token}`
  };

  const scenarios = [
    { name: 'Scenario A: Low Quantity (Book Immediately)', quantity: 55000 },
    { name: 'Scenario B: Normal Quantity (Book within 15 Days)', quantity: 70000 },
    { name: 'Scenario C: High Quantity (Wait / Monitor Market)', quantity: 95000 }
  ];

  for (const s of scenarios) {
    console.log(`Generating ${s.name}...`);
    try {
      const payload = {
        cargo: {
          cargoType: 'Thermal Coal',
          quantityMT: s.quantity,
          shipmentsCount: 1,
          laycanStart: '2026-09-20',
          laycanEnd: '2026-09-30'
        },
        route: {
          originPortId: 'port-kalimantan',
          originPortName: 'Kalimantan',
          originCountry: 'Indonesia',
          destinationPortId: 'port-paradip',
          destinationPortName: 'Paradip',
          destinationCountry: 'India'
        },
        contract: {
          planningDurationMonths: 12,
          preference: 'Hybrid',
          riskTolerance: 'Moderate'
        }
      };

      const res = await axios.post(`${BASE_URL}/analyses`, payload, { headers });
      console.log(`Success: Generated Analysis ID ${res.data.id} - Advice: ${res.data.recommendation.timingAdvice}`);
    } catch (err) {
      console.error(`Failed to generate ${s.name}:`, err.response?.data || err.message);
    }
  }

  console.log('All scenarios generated.');
}

generateScenarios().catch(console.error);
