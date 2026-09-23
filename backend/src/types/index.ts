import { Request } from 'express';

export type UserRole = 'CHARTERER' | 'LOGISTICS_MANAGER' | 'ANALYST' | 'ADMIN';
export type AccountStatus = 'ACTIVE' | 'SUSPENDED' | 'PENDING';
export type VesselClass = 'Handysize' | 'Supramax' | 'Panamax' | 'Capesize';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: AccountStatus;
  organizationId: string;
  organizationName: string;
  createdAt: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  organizationId: string;
}

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
  originPortName?: string;
  originCountry?: string;
  destinationPortId: string;
  destinationPortName?: string;
  destinationCountry?: string;
  distanceNM: number;
  canalTransit?: 'Suez' | 'Panama' | 'None';
}

export interface ContractParameters {
  planningDurationMonths: number;
  preference: 'Spot' | 'Short-Term' | 'Medium-Term' | 'Hybrid';
  riskTolerance: 'Conservative' | 'Moderate' | 'Aggressive';
}

export interface AnalysisInput {
  cargo: CargoRequirement;
  route: RouteSpecification;
  contract: ContractParameters;
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

export interface MarketSnapshot {
  balticIndexName: string;
  currentRate: string;
  sevenDayMovement: string;
  direction: 'up' | 'down' | 'flat';
  updatedAt: string;
}

export interface MarketAlert {
  id: string;
  type: 'rate' | 'congestion' | 'vessel' | 'bunker' | 'weather';
  severity: 'info' | 'warning' | 'alert';
  headline: string;
  details: string;
  timestamp: string;
}

export interface ForecastRequest {
  vesselClass: VesselClass;
  routeId?: string;
  horizonWeeks?: number;
}

export interface ForecastResponse {
  currentRatePerTon: number;
  fourWeekForecastPerTon: number;
  eightWeekForecastPerTon: number;
  confidencePercentage: number;
  forecastRangeText: string;
  timeSeries: {
    period: string;
    actualRate?: number;
    predictedRate?: number;
    upperBound?: number;
    lowerBound?: number;
  }[];
}

export interface CompatibilityRequest {
  vesselClass: VesselClass;
  originPortId: string;
  destinationPortId: string;
}

export interface CompatibilityResponse {
  feasible: boolean;
  draftMarginOriginM: number;
  draftMarginDestM: number;
  loaMarginDestM: number;
  beamMarginDestM: number;
  requiresLightering: boolean;
  tideDependentDischarge: boolean;
  notes: string[];
}

export interface OptimizationRequest {
  cargoQuantityMT: number;
  shipmentsCount: number;
  planningDurationMonths: number;
  riskTolerance: 'Conservative' | 'Moderate' | 'Aggressive';
}

export interface OptimizationResponse {
  recommendedStrategy: string;
  mixAllocation: string;
  expectedDeliveredCostPerTon: number;
  expectedSavingsVsSpotPerTon: number;
  timingAdvice: string;
  strategies: {
    name: string;
    description: string;
    mix: string;
    deliveredCostPerTon: number;
    riskScore: number;
    advantages: string[];
    disadvantages: string[];
    isRecommended: boolean;
  }[];
}

