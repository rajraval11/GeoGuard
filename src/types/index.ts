// GeoGuard Maritime Freight Decision Support Platform Types

export type UserRole = 'Admin' | 'Charterer' | 'Analyst';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organizationId: string;
  organizationName: string;
  createdAt: string;
  lastActive?: string;
  status: 'Active' | 'Suspended' | 'Pending';
}

export interface Organization {
  id: string;
  name: string;
  tier: 'Enterprise' | 'Commercial';
  defaultCurrency: 'USD';
  defaultRiskTolerance: RiskTolerance;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export type RiskTolerance = 'Conservative' | 'Moderate' | 'Aggressive';

export type ContractPreference = 'Spot' | 'Short-Term' | 'Medium-Term' | 'Hybrid';

export type VesselClass =
  | 'Handysize'
  | 'Supramax'
  | 'Ultramax'
  | 'Panamax'
  | 'Kamsarmax'
  | 'Capesize'
  | 'Newcastlemax';

export interface CargoRequirement {
  cargoType: string;
  quantityMT: number;
  shipmentsCount: number;
  laycanStart?: string;
  laycanEnd?: string;
  specialHandling?: string;
}

export interface RouteSpecification {
  originPortId: string;
  originPortName: string;
  originCountry: string;
  destinationPortId: string;
  destinationPortName: string;
  destinationCountry: string;
  distanceNM: number;
  canalTransit?: 'Suez' | 'Panama' | 'None';
}

export interface ContractParameters {
  planningDurationMonths: number;
  preference: ContractPreference;
  riskTolerance: RiskTolerance;
}

export interface AnalysisInput {
  cargo: CargoRequirement;
  route: RouteSpecification;
  contract: ContractParameters;
}

export interface StrategyComparisonItem {
  strategy: 'Spot' | 'Short-Term' | 'Medium-Term' | 'Hybrid';
  label: string;
  expectedDeliveredCostPerTon: number;
  worstCaseDeliveredCostPerTon: number;
  riskLevel: 'Low' | 'Moderate' | 'High';
  flexibilityScore: 'High' | 'Moderate' | 'Low';
  allocationText: string;
  isRecommended: boolean;
}

export interface PortVesselFeasibility {
  vesselClass: VesselClass;
  draftMeters: number;
  loaMeters: number;
  beamMeters: number;
  originStatus: 'Compatible' | 'Restricted' | 'Incompatible';
  originReason?: string;
  destinationStatus: 'Compatible' | 'Restricted' | 'Incompatible';
  destinationReason?: string;
}

export interface VoyageCostBreakdown {
  freightPerTon: number;
  bunkerCostPerTon: number; // VLSFO & MGO calculated
  portChargesPerTon: number;
  waitingCostPerTon: number;
  demurrageRiskPerTon: number;
  deadheadingRepositioningPerTon: number;
  lighteringPerTon: number;
  totalDeliveredCostPerTon: number;
}

export interface ForecastDataPoint {
  date: string;
  historicalRate?: number;
  forecastRate?: number;
  confidenceLower?: number; // 10th percentile (Quantile Regression)
  confidenceUpper?: number; // 90th percentile (Quantile Regression)
}

export interface MonteCarloScenarioSummary {
  scenarioCount: number; // 1,000+
  expectedCostPerTon: number;
  valueAtRisk95: number; // VaR (95%)
  conditionalValueAtRisk95: number; // CVaR (95%)
  worstCaseCostPerTon: number;
  distribution: {
    costRange: string;
    frequency: number;
  }[];
}

export interface DecisionFactor {
  factor: string;
  state: string;
  trend: 'up' | 'down' | 'neutral' | 'compatible';
  impactDescription: string;
}

export interface AnalysisResult {
  id: string;
  createdAt: string;
  status: 'Completed' | 'Processing' | 'Failed' | 'Draft';
  input: AnalysisInput;
  recommendation: {
    strategyName: string;
    mixAllocation: string; // e.g. "60% Medium-Term / 40% Spot"
    expectedDeliveredCostPerTon: number;
    expectedSavingsVsSpotPerTon: number;
    riskLevel: 'Conservative' | 'Moderate' | 'Elevated';
    confidencePercentage: number;
    timingAdvice: string; // e.g. "BOOK WITHIN 15 DAYS"
    plainEnglishRationale: string;
    recommendedVessel: VesselClass;
  };
  forecast: {
    currentRatePerTon: number;
    fourWeekForecastPerTon: number;
    eightWeekForecastPerTon: number;
    forecastRangeText: string;
    timeSeries: ForecastDataPoint[];
  };
  strategies: StrategyComparisonItem[];
  riskSimulation: MonteCarloScenarioSummary;
  vesselPortFeasibility: PortVesselFeasibility[];
  costBreakdown: VoyageCostBreakdown;
  decisionFactors: DecisionFactor[];
  anomalyDetected?: boolean;
  anomalyNotes?: string;
  shipmentSchedule?: ShipmentScheduleItem[];
  // Weather corridor assessment fields (added by weatherService)
  weatherStatus?: 'SUCCESS' | 'UNAVAILABLE';
  weatherFreshness?: 'CURRENT' | 'STALE' | 'UNAVAILABLE';
  weatherExposure?: 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE' | 'UNAVAILABLE';
  weatherMessage?: string;
  maxWaveM?: number;
  maxSwellM?: number;
  maxCurrentKt?: number;
  worstSegment?: string;
  affectedSegments?: string[];
  riskScore?: number;
}

export interface ShipmentScheduleItem {
  shipment: string;
  month: string;
  cargo: string;
  vesselClass: VesselClass | string;
  contractAllocation: string;
  estimatedCost: string;
}

export interface MarketSnapshot {
  balticIndexName: string;
  currentRate: string;
  sevenDayMovement: string;
  direction: 'up' | 'down' | 'flat';
  updatedAt: string;
}

export interface MarketAlert {
  id: string;
  type: 'rate' | 'congestion' | 'vessel' | 'weather';
  severity: 'info' | 'warning' | 'alert';
  headline: string;
  details: string;
  timestamp: string;
}

export interface PortRecord {
  id: string;
  name: string;
  country: string;
  code: string;
  maxDraftMeters: number;
  maxLoaMeters: number;
  maxBeamMeters: number;
  tideRestriction: boolean;
  averageWaitingHours: number;
  congestionIndex: 'Low' | 'Moderate' | 'High';
}

export interface VesselRecord {
  id: string;
  vesselClass: VesselClass;
  dwtMin: number;
  dwtMax: number;
  typicalDraftM: number;
  typicalLoaM: number;
  typicalBeamM: number;
  dailyFuelConsumptionMT: number;
  suitableCargoes: string[];
}

export interface AdminDataHealthSource {
  id: string;
  source: string;
  lastUpdated: string;
  status: 'Healthy' | 'Delayed' | 'Unavailable';
  records: number;
  frequency: string;
}

export interface AdminModelPerformance {
  forecastMAE: number;
  forecastRMSE: number;
  backtestPerformanceScore: number;
  modelVersion: string;
  lastTrainedDate: string;
  trainingSamplesCount: number;
  backtestSeries: {
    date: string;
    actual: number;
    predicted: number;
  }[];
}

export interface AdminUsageMetrics {
  activeUsersCount: number;
  analysesThisMonth: number;
  apiSuccessRate: number;
  averageResponseTimeMs: number;
  organizationCount: number;
}

// ---------------------------------------------------------------------------
// Dedicated API Contracts (POST /api/forecast, /api/compatibility, /api/optimization)
// ---------------------------------------------------------------------------

// POST /api/forecast
export interface ForecastRequest {
  routeId?: string;
  originPortId?: string;
  destinationPortId?: string;
  vesselClass?: VesselClass | string;
  horizonWeeks?: number;
}

export interface ForecastResponse {
  forecastValues: {
    date: string;
    rate: number;
    uncertaintyLower?: number;
    uncertaintyUpper?: number;
  }[];
  uncertaintyRange?: {
    lower: number;
    upper: number;
    spreadText?: string;
  };
  confidence?: number;
  confidencePercentage?: number;
  forecastHorizonWeeks?: number;
  currentRatePerTon?: number;
  fourWeekForecastPerTon?: number;
  eightWeekForecastPerTon?: number;
  forecastRangeText?: string;
  timeSeries?: ForecastDataPoint[];
}

// POST /api/compatibility
export interface CompatibilityRequest {
  originPortId: string;
  destinationPortId: string;
  vesselClass?: VesselClass | string;
  draftMeters?: number;
  loaMeters?: number;
  beamMeters?: number;
}

export interface CompatibilityResponseItem {
  vesselClass: VesselClass | string;
  draft: number;
  draftMeters?: number;
  loa: number;
  loaMeters?: number;
  beam: number;
  beamMeters?: number;
  originCompatibility: 'Compatible' | 'Restricted' | 'Incompatible' | boolean;
  originStatus?: 'Compatible' | 'Restricted' | 'Incompatible';
  originReason?: string;
  destinationCompatibility: 'Compatible' | 'Restricted' | 'Incompatible' | boolean;
  destinationStatus?: 'Compatible' | 'Restricted' | 'Incompatible';
  destinationReason?: string;
}

export type CompatibilityResponse = CompatibilityResponseItem[];

// POST /api/optimization
export interface OptimizationRequest {
  cargoQuantityMT?: number;
  totalQuantityMT?: number;
  planningDurationMonths?: number;
  riskTolerance?: RiskTolerance | string;
  originPortId?: string;
  destinationPortId?: string;
  vesselClass?: VesselClass | string;
}

export interface OptimizationResponse {
  spotAllocation: number | string;
  stAllocation: number | string;
  mtAllocation: number | string;
  hybridAllocation: number | string;
  expectedCost: number;
  expectedCostPerTon?: number;
  risk: string;
  riskLevel?: 'Conservative' | 'Moderate' | 'Elevated' | 'Low' | 'High';
  cvar: number;
  conditionalValueAtRisk95?: number;
  valueAtRisk95?: number;
  recommendation: {
    strategyName: string;
    mixAllocation: string;
    plainEnglishRationale?: string;
    timingAdvice?: string;
    confidencePercentage?: number;
  } | string;
  strategies?: StrategyComparisonItem[];
}

