import type { AnalysisResult, PortRecord, VesselRecord, AdminDataHealthSource, AdminModelPerformance, AdminUsageMetrics } from '../types';

/**
 * Standard Maritime Commercial Test Fixture
 * Route: Indonesia (Taboneo/Muara Pantai) → Paradip, India
 * Cargo: Thermal Coal, 50,000 MT Panamax shipment
 * Used for component testing and baseline verification.
 */
export const BENCHMARK_INDONESIA_PARADIP: AnalysisResult = {
  id: 'AN-2026-0842',
  createdAt: '2026-09-08T10:30:00Z',
  status: 'Completed',
  input: {
    cargo: {
      cargoType: 'Thermal Coal (NAR 4700)',
      quantityMT: 50000,
      shipmentsCount: 12,
      laycanStart: '2026-09-20',
      laycanEnd: '2026-10-05',
      specialHandling: 'Standard bulk trimming; moisture limit 14%'
    },
    route: {
      originPortId: 'port-id-taboneo',
      originPortName: 'Taboneo Anchorage',
      originCountry: 'Indonesia',
      destinationPortId: 'port-in-paradip',
      destinationPortName: 'Paradip Port',
      destinationCountry: 'India',
      distanceNM: 2860,
      canalTransit: 'None'
    },
    contract: {
      planningDurationMonths: 12,
      preference: 'Hybrid',
      riskTolerance: 'Moderate'
    }
  },
  recommendation: {
    strategyName: 'Hybrid Contract Portfolio',
    mixAllocation: '60% Medium-Term / 40% Spot',
    expectedDeliveredCostPerTon: 21.15,
    expectedSavingsVsSpotPerTon: 1.85,
    riskLevel: 'Moderate',
    confidencePercentage: 78,
    timingAdvice: 'BOOK WITHIN 15 DAYS',
    plainEnglishRationale: 'Medium-term coverage reduces exposure to the projected upward freight trend while retaining some flexibility if rates decline.',
    recommendedVessel: 'Panamax'
  },
  forecast: {
    currentRatePerTon: 20.40,
    fourWeekForecastPerTon: 21.80,
    eightWeekForecastPerTon: 22.90,
    forecastRangeText: '$19.8 – $23.4 / ton',
    timeSeries: [
      { date: 'W-8', historicalRate: 18.20 },
      { date: 'W-6', historicalRate: 18.90 },
      { date: 'W-4', historicalRate: 19.40 },
      { date: 'W-2', historicalRate: 19.90 },
      { date: 'Current', historicalRate: 20.40, forecastRate: 20.40, confidenceLower: 19.60, confidenceUpper: 21.10 },
      { date: 'W+2', forecastRate: 21.10, confidenceLower: 20.00, confidenceUpper: 22.10 },
      { date: 'W+4', forecastRate: 21.80, confidenceLower: 20.40, confidenceUpper: 22.90 },
      { date: 'W+6', forecastRate: 22.40, confidenceLower: 20.60, confidenceUpper: 23.50 },
      { date: 'W+8', forecastRate: 22.90, confidenceLower: 20.80, confidenceUpper: 24.10 }
    ]
  },
  strategies: [
    {
      strategy: 'Spot',
      label: '100% Spot Market',
      expectedDeliveredCostPerTon: 23.00,
      worstCaseDeliveredCostPerTon: 26.40,
      riskLevel: 'High',
      flexibilityScore: 'High',
      allocationText: '0% Period / 100% Spot',
      isRecommended: false
    },
    {
      strategy: 'Short-Term',
      label: 'Short-Term Coverage (3-6 mo)',
      expectedDeliveredCostPerTon: 21.90,
      worstCaseDeliveredCostPerTon: 24.10,
      riskLevel: 'Moderate',
      flexibilityScore: 'Moderate',
      allocationText: '100% Short-Term Fixed',
      isRecommended: false
    },
    {
      strategy: 'Medium-Term',
      label: 'Medium-Term Index-Linked COA',
      expectedDeliveredCostPerTon: 21.65,
      worstCaseDeliveredCostPerTon: 23.20,
      riskLevel: 'Low',
      flexibilityScore: 'Low',
      allocationText: '100% Medium-Term (12 mo)',
      isRecommended: false
    },
    {
      strategy: 'Hybrid',
      label: 'Hybrid Portfolio (60% MT / 40% Spot)',
      expectedDeliveredCostPerTon: 21.15,
      worstCaseDeliveredCostPerTon: 23.40,
      riskLevel: 'Moderate',
      flexibilityScore: 'Moderate',
      allocationText: '60% MT COA / 40% Spot',
      isRecommended: true
    }
  ],
  riskSimulation: {
    scenarioCount: 1000,
    expectedCostPerTon: 21.15,
    valueAtRisk95: 23.10,
    conditionalValueAtRisk95: 24.35,
    worstCaseCostPerTon: 25.80,
    distribution: [
      { costRange: '< $19.0', frequency: 32 },
      { costRange: '$19.0 - $20.0', frequency: 145 },
      { costRange: '$20.0 - $21.0', frequency: 280 },
      { costRange: '$21.0 - $22.0', frequency: 325 },
      { costRange: '$22.0 - $23.0', frequency: 148 },
      { costRange: '$23.0 - $24.0', frequency: 54 },
      { costRange: '> $24.0', frequency: 16 }
    ]
  },
  vesselPortFeasibility: [
    {
      vesselClass: 'Supramax',
      draftMeters: 12.8,
      loaMeters: 190.0,
      beamMeters: 32.2,
      originStatus: 'Compatible',
      originReason: 'Anchorage loading via floating cranes',
      destinationStatus: 'Compatible',
      destinationReason: 'Fully within berth draft limits (14.5m max)'
    },
    {
      vesselClass: 'Ultramax',
      draftMeters: 13.3,
      loaMeters: 199.9,
      beamMeters: 32.2,
      originStatus: 'Compatible',
      originReason: 'Anchorage transshipment suitable',
      destinationStatus: 'Compatible',
      destinationReason: 'Berth 1 & Central Quay compliant'
    },
    {
      vesselClass: 'Panamax',
      draftMeters: 14.2,
      loaMeters: 225.0,
      beamMeters: 32.2,
      originStatus: 'Compatible',
      originReason: 'Deep-water anchorage loading (Taboneo)',
      destinationStatus: 'Compatible',
      destinationReason: 'Berth draft allows up to 14.5m at high water'
    },
    {
      vesselClass: 'Kamsarmax',
      draftMeters: 14.5,
      loaMeters: 229.0,
      beamMeters: 32.2,
      originStatus: 'Compatible',
      originReason: 'Anchorage permitted',
      destinationStatus: 'Restricted',
      destinationReason: 'Tidal window required for 14.5m draft at Paradip coal dock'
    },
    {
      vesselClass: 'Capesize',
      draftMeters: 18.2,
      loaMeters: 292.0,
      beamMeters: 45.0,
      originStatus: 'Compatible',
      originReason: 'Offshore transshipment possible',
      destinationStatus: 'Incompatible',
      destinationReason: 'Exceeds maximum Paradip harbor draft (14.5m) and LOA limit (260m)'
    }
  ],
  costBreakdown: {
    freightPerTon: 14.20,
    bunkerCostPerTon: 4.15,
    portChargesPerTon: 1.25,
    waitingCostPerTon: 0.65,
    demurrageRiskPerTon: 0.45,
    deadheadingRepositioningPerTon: 0.45,
    lighteringPerTon: 0.00,
    totalDeliveredCostPerTon: 21.15
  },
  decisionFactors: [
    {
      factor: 'Freight trend',
      state: 'Increasing',
      trend: 'up',
      impactDescription: 'Baltic Panamax rates projected up 8–12% over the next 60 days on strong East coast India coal import demand.'
    },
    {
      factor: 'Bunker price (VLSFO)',
      state: 'Stable',
      trend: 'neutral',
      impactDescription: 'Singapore bunker benchmark holding at $615–$630/MT with moderate crack spreads.'
    },
    {
      factor: 'Port compatibility',
      state: 'Suitable',
      trend: 'compatible',
      impactDescription: 'Panamax class meets all draft and berth geometry requirements at both Taboneo anchorage and Paradip mechanised coal berth.'
    },
    {
      factor: 'Market volatility',
      state: 'Elevated',
      trend: 'up',
      impactDescription: 'High seasonal Pacific fixture churn warrants hybrid coverage to shield against spot spikes.'
    },
    {
      factor: 'Risk tolerance',
      state: 'Moderate',
      trend: 'neutral',
      impactDescription: 'Portfolio optimization penalizes open spot variance above the 70th percentile.'
    }
  ],
  anomalyDetected: false,
  shipmentSchedule: [
    { shipment: 'Shipment 01', month: 'Month 1', cargo: '50,000 MT', vesselClass: 'Panamax', contractAllocation: 'Medium-Term', estimatedCost: '$20.80/t ($1,040,000)' },
    { shipment: 'Shipment 02', month: 'Month 2', cargo: '50,000 MT', vesselClass: 'Panamax', contractAllocation: 'Medium-Term', estimatedCost: '$20.80/t ($1,040,000)' },
    { shipment: 'Shipment 03', month: 'Month 3', cargo: '50,000 MT', vesselClass: 'Panamax', contractAllocation: 'Medium-Term', estimatedCost: '$20.80/t ($1,040,000)' },
    { shipment: 'Shipment 04', month: 'Month 4', cargo: '50,000 MT', vesselClass: 'Panamax', contractAllocation: 'Medium-Term', estimatedCost: '$20.80/t ($1,040,000)' },
    { shipment: 'Shipment 05', month: 'Month 5', cargo: '50,000 MT', vesselClass: 'Panamax', contractAllocation: 'Medium-Term', estimatedCost: '$20.80/t ($1,040,000)' },
    { shipment: 'Shipment 06', month: 'Month 6', cargo: '50,000 MT', vesselClass: 'Panamax', contractAllocation: 'Medium-Term', estimatedCost: '$20.80/t ($1,040,000)' },
    { shipment: 'Shipment 07', month: 'Month 7', cargo: '50,000 MT', vesselClass: 'Panamax', contractAllocation: 'Medium-Term', estimatedCost: '$20.80/t ($1,040,000)' },
    { shipment: 'Shipment 08', month: 'Month 8', cargo: '50,000 MT', vesselClass: 'Panamax', contractAllocation: 'Spot', estimatedCost: '$21.45/t ($1,072,500)' },
    { shipment: 'Shipment 09', month: 'Month 9', cargo: '50,000 MT', vesselClass: 'Panamax', contractAllocation: 'Spot', estimatedCost: '$21.60/t ($1,080,000)' },
    { shipment: 'Shipment 10', month: 'Month 10', cargo: '50,000 MT', vesselClass: 'Panamax', contractAllocation: 'Spot', estimatedCost: '$21.75/t ($1,087,500)' },
    { shipment: 'Shipment 11', month: 'Month 11', cargo: '50,000 MT', vesselClass: 'Panamax', contractAllocation: 'Spot', estimatedCost: '$21.90/t ($1,095,000)' },
    { shipment: 'Shipment 12', month: 'Month 12', cargo: '50,000 MT', vesselClass: 'Panamax', contractAllocation: 'Spot', estimatedCost: '$21.95/t ($1,097,500)' }
  ]
};

export const BENCHMARK_PAST_ANALYSES: AnalysisResult[] = [
  BENCHMARK_INDONESIA_PARADIP,
  {
    id: 'AN-2026-0839',
    createdAt: '2026-09-06T14:15:00Z',
    status: 'Completed',
    input: {
      cargo: {
        cargoType: 'Iron Ore Fines',
        quantityMT: 170000,
        shipmentsCount: 4,
        laycanStart: '2026-10-01',
        laycanEnd: '2026-10-20'
      },
      route: {
        originPortId: 'port-au-damphier',
        originPortName: 'Port Hedland',
        originCountry: 'Australia',
        destinationPortId: 'port-cn-qingdao',
        destinationPortName: 'Qingdao',
        destinationCountry: 'China',
        distanceNM: 3620,
        canalTransit: 'None'
      },
      contract: {
        planningDurationMonths: 6,
        preference: 'Short-Term',
        riskTolerance: 'Conservative'
      }
    },
    recommendation: {
      strategyName: 'Short-Term Time Charter',
      mixAllocation: '80% Short-Term / 20% Spot',
      expectedDeliveredCostPerTon: 11.45,
      expectedSavingsVsSpotPerTon: 0.95,
      riskLevel: 'Conservative',
      confidencePercentage: 84,
      timingAdvice: 'BOOK WITHIN 7 DAYS',
      plainEnglishRationale: 'Capesize tonnage supply tightening in West Australia; securing short-term period coverage limits exposure to anticipated Q4 ore rush.',
      recommendedVessel: 'Capesize'
    },
    forecast: {
      currentRatePerTon: 11.20,
      fourWeekForecastPerTon: 12.10,
      eightWeekForecastPerTon: 12.60,
      forecastRangeText: '$10.8 – $13.2 / ton',
      timeSeries: []
    },
    strategies: [],
    riskSimulation: {
      scenarioCount: 1000,
      expectedCostPerTon: 11.45,
      valueAtRisk95: 12.80,
      conditionalValueAtRisk95: 13.40,
      worstCaseCostPerTon: 14.10,
      distribution: []
    },
    vesselPortFeasibility: [],
    costBreakdown: {
      freightPerTon: 8.40,
      bunkerCostPerTon: 2.10,
      portChargesPerTon: 0.45,
      waitingCostPerTon: 0.25,
      demurrageRiskPerTon: 0.15,
      deadheadingRepositioningPerTon: 0.10,
      lighteringPerTon: 0.00,
      totalDeliveredCostPerTon: 11.45
    },
    decisionFactors: []
  },
  {
    id: 'AN-2026-0831',
    createdAt: '2026-08-29T09:00:00Z',
    status: 'Completed',
    input: {
      cargo: {
        cargoType: 'Bauxite Bulk',
        quantityMT: 60000,
        shipmentsCount: 6,
        laycanStart: '2026-09-15',
        laycanEnd: '2026-09-30'
      },
      route: {
        originPortId: 'port-gn-kamsar',
        originPortName: 'Port Kamsar',
        originCountry: 'Guinea',
        destinationPortId: 'port-in-jaigad',
        destinationPortName: 'Jaigad Port',
        destinationCountry: 'India',
        distanceNM: 7420,
        canalTransit: 'Suez'
      },
      contract: {
        planningDurationMonths: 12,
        preference: 'Medium-Term',
        riskTolerance: 'Moderate'
      }
    },
    recommendation: {
      strategyName: '12-Month Contract of Affreightment',
      mixAllocation: '70% Medium-Term / 30% Spot',
      expectedDeliveredCostPerTon: 34.80,
      expectedSavingsVsSpotPerTon: 2.30,
      riskLevel: 'Moderate',
      confidencePercentage: 76,
      timingAdvice: 'HOLD — EVALUATE WITHIN 30 DAYS',
      plainEnglishRationale: 'Atlantic basin Supramax ballasters sufficient; securing base COA at current discount mitigates Cape of Good Hope rerouting variance.',
      recommendedVessel: 'Kamsarmax'
    },
    forecast: {
      currentRatePerTon: 35.10,
      fourWeekForecastPerTon: 34.60,
      eightWeekForecastPerTon: 35.20,
      forecastRangeText: '$33.5 – $37.2 / ton',
      timeSeries: []
    },
    strategies: [],
    riskSimulation: {
      scenarioCount: 1000,
      expectedCostPerTon: 34.80,
      valueAtRisk95: 38.20,
      conditionalValueAtRisk95: 39.50,
      worstCaseCostPerTon: 41.20,
      distribution: []
    },
    vesselPortFeasibility: [],
    costBreakdown: {
      freightPerTon: 24.50,
      bunkerCostPerTon: 7.20,
      portChargesPerTon: 1.60,
      waitingCostPerTon: 0.80,
      demurrageRiskPerTon: 0.40,
      deadheadingRepositioningPerTon: 0.30,
      lighteringPerTon: 0.00,
      totalDeliveredCostPerTon: 34.80
    },
    decisionFactors: []
  }
];

export const BENCHMARK_PORTS: PortRecord[] = [
  {
    id: 'port-id-taboneo',
    name: 'Taboneo Anchorage',
    country: 'Indonesia',
    code: 'IDTAB',
    maxDraftMeters: 18.0,
    maxLoaMeters: 300,
    maxBeamMeters: 50,
    tideRestriction: false,
    averageWaitingHours: 18,
    congestionIndex: 'Moderate'
  },
  {
    id: 'port-in-paradip',
    name: 'Paradip Port',
    country: 'India',
    code: 'INPRT',
    maxDraftMeters: 14.5,
    maxLoaMeters: 260,
    maxBeamMeters: 32.5,
    tideRestriction: true,
    averageWaitingHours: 36,
    congestionIndex: 'High'
  },
  {
    id: 'port-au-damphier',
    name: 'Port Hedland',
    country: 'Australia',
    code: 'AUPHE',
    maxDraftMeters: 19.5,
    maxLoaMeters: 330,
    maxBeamMeters: 55,
    tideRestriction: true,
    averageWaitingHours: 24,
    congestionIndex: 'Moderate'
  },
  {
    id: 'port-cn-qingdao',
    name: 'Qingdao Port',
    country: 'China',
    code: 'CNTAO',
    maxDraftMeters: 21.0,
    maxLoaMeters: 360,
    maxBeamMeters: 65,
    tideRestriction: false,
    averageWaitingHours: 22,
    congestionIndex: 'Low'
  },
  {
    id: 'port-in-visakhapatnam',
    name: 'Visakhapatnam (Vizag)',
    country: 'India',
    code: 'INVTZ',
    maxDraftMeters: 16.5,
    maxLoaMeters: 280,
    maxBeamMeters: 45,
    tideRestriction: false,
    averageWaitingHours: 28,
    congestionIndex: 'Moderate'
  },
  {
    id: 'port-in-haldia',
    name: 'Haldia Dock Complex',
    country: 'India',
    code: 'INHAL',
    maxDraftMeters: 8.5,
    maxLoaMeters: 195,
    maxBeamMeters: 28,
    tideRestriction: true,
    averageWaitingHours: 42,
    congestionIndex: 'High'
  }
];

export const BENCHMARK_VESSELS: VesselRecord[] = [
  {
    id: 'ves-handysize',
    vesselClass: 'Handysize',
    dwtMin: 28000,
    dwtMax: 39000,
    typicalDraftM: 10.5,
    typicalLoaM: 175,
    typicalBeamM: 28.0,
    dailyFuelConsumptionMT: 18.5,
    suitableCargoes: ['Grain', 'Steel', 'Fertilizer', 'Coal']
  },
  {
    id: 'ves-supramax',
    vesselClass: 'Supramax',
    dwtMin: 50000,
    dwtMax: 59000,
    typicalDraftM: 12.8,
    typicalLoaM: 190,
    typicalBeamM: 32.2,
    dailyFuelConsumptionMT: 25.0,
    suitableCargoes: ['Coal', 'Iron Ore', 'Grains', 'Clinker']
  },
  {
    id: 'ves-ultramax',
    vesselClass: 'Ultramax',
    dwtMin: 60000,
    dwtMax: 65000,
    typicalDraftM: 13.3,
    typicalLoaM: 200,
    typicalBeamM: 32.2,
    dailyFuelConsumptionMT: 26.5,
    suitableCargoes: ['Coal', 'Grains', 'Bauxite', 'Petcoke']
  },
  {
    id: 'ves-panamax',
    vesselClass: 'Panamax',
    dwtMin: 70000,
    dwtMax: 79000,
    typicalDraftM: 14.2,
    typicalLoaM: 225,
    typicalBeamM: 32.2,
    dailyFuelConsumptionMT: 30.0,
    suitableCargoes: ['Thermal Coal', 'Coking Coal', 'Iron Ore', 'Grain']
  },
  {
    id: 'ves-kamsarmax',
    vesselClass: 'Kamsarmax',
    dwtMin: 80000,
    dwtMax: 85000,
    typicalDraftM: 14.5,
    typicalLoaM: 229,
    typicalBeamM: 32.2,
    dailyFuelConsumptionMT: 31.5,
    suitableCargoes: ['Bauxite', 'Coal', 'Grain']
  },
  {
    id: 'ves-capesize',
    vesselClass: 'Capesize',
    dwtMin: 160000,
    dwtMax: 185000,
    typicalDraftM: 18.2,
    typicalLoaM: 292,
    typicalBeamM: 45.0,
    dailyFuelConsumptionMT: 46.0,
    suitableCargoes: ['Iron Ore', 'Coal']
  }
];

export const BENCHMARK_DATA_HEALTH: AdminDataHealthSource[] = [
  { id: '1', source: 'Baltic Dry Index & FFA Curves', lastUpdated: '2026-09-08 09:00 UTC', status: 'Healthy', records: 48920, frequency: 'Daily (London Close)' },
  { id: '2', source: 'Singapore / Fujairah Bunker Benchmarks', lastUpdated: '2026-09-08 08:30 UTC', status: 'Healthy', records: 12450, frequency: 'Daily' },
  { id: '3', source: 'Global Coal & Ore Commodity Prices', lastUpdated: '2026-09-08 07:15 UTC', status: 'Healthy', records: 34100, frequency: 'Daily' },
  { id: '4', source: 'Port Congestion & Berth Waiting Queue', lastUpdated: '2026-09-08 09:45 UTC', status: 'Healthy', records: 8750, frequency: 'Hourly' },
  { id: '5', source: 'Trade Volume & Customs Cargo Flows', lastUpdated: '2026-09-07 23:00 UTC', status: 'Healthy', records: 112000, frequency: 'Weekly' },
  { id: '6', source: 'Maritime Meteorological & Sea State', lastUpdated: '2026-09-08 09:50 UTC', status: 'Healthy', records: 65400, frequency: '6-hourly' },
  { id: '7', source: 'Canal Transit Schedules (Suez & Panama)', lastUpdated: '2026-09-08 06:00 UTC', status: 'Delayed', records: 4320, frequency: '12-hourly' }
];

export const BENCHMARK_MODEL_PERFORMANCE: AdminModelPerformance = {
  forecastMAE: 0.84,
  forecastRMSE: 1.18,
  backtestPerformanceScore: 91.4,
  modelVersion: 'v2.4.1 (XGBoost + SARIMAX + Quantile Reg)',
  lastTrainedDate: '2026-09-01 02:00 UTC',
  trainingSamplesCount: 28400,
  backtestSeries: [
    { date: 'May 26', actual: 17.8, predicted: 17.5 },
    { date: 'Jun 26', actual: 18.6, predicted: 18.4 },
    { date: 'Jul 26', actual: 19.2, predicted: 19.5 },
    { date: 'Aug 26', actual: 20.1, predicted: 19.9 },
    { date: 'Sep 26', actual: 20.4, predicted: 20.3 }
  ]
};

export const BENCHMARK_USAGE: AdminUsageMetrics = {
  activeUsersCount: 42,
  analysesThisMonth: 184,
  apiSuccessRate: 99.82,
  averageResponseTimeMs: 142,
  organizationCount: 16
};
