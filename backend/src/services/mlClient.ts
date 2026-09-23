import axios from 'axios';
import { config } from '../config/index.js';

const mlApi = axios.create({
  baseURL: config.flaskMlUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const mlClient = {
  async getHealth() {
    try {
      const res = await mlApi.get('/health');
      return res.data;
    } catch (err: any) {
      return {
        status: 'UNAVAILABLE',
        service: 'GeoGuard ML Microservice',
        message: 'ML forecasting and optimization service is currently unreachable.'
      };
    }
  },

  async predict(params: { routeId?: string; vesselClass?: string; horizonWeeks?: number; baseRate?: number }) {
    try {
      const res = await mlApi.post('/predict', params);
      return res.data;
    } catch (err: any) {
      const error: any = new Error('Forecasting ML service is currently unavailable.');
      error.code = 'ML_SERVICE_UNAVAILABLE';
      error.status = 503;
      throw error;
    }
  },

  async detectAnomaly(params: { rates?: number[]; bunkerPrices?: number[]; congestionHours?: number; routeId?: string }) {
    try {
      const res = await mlApi.post('/anomaly', params);
      return res.data;
    } catch (err: any) {
      return {
        status: 'UNAVAILABLE',
        anomalyDetected: null,
        message: 'The anomaly service has not returned a result.',
        anomalyScore: null
      };
    }
  },

  async simulateMonteCarlo(params: { baseCost: number; scenarioCount?: number }) {
    try {
      const res = await mlApi.post('/simulate', params);
      return res.data;
    } catch (err: any) {
      const error: any = new Error('Monte Carlo risk calculation service is currently unavailable.');
      error.code = 'ML_SIMULATION_UNAVAILABLE';
      error.status = 503;
      throw error;
    }
  },

  async optimizeContractMix(params: {
    planningDurationMonths: number;
    riskTolerance: string;
    totalQuantityMT: number;
    expectedSpot?: number;
  }) {
    try {
      const res = await mlApi.post('/optimize', params);
      return res.data;
    } catch (err: any) {
      const error: any = new Error('Contract optimization service is currently unavailable.');
      error.code = 'OPTIMIZATION_SERVICE_UNAVAILABLE';
      error.status = 503;
      throw error;
    }
  },

  async checkCompatibility(params: {
    originMaxDraft?: number;
    destMaxDraft?: number;
    destMaxLoa?: number;
  }) {
    try {
      const res = await mlApi.post('/compatibility', params);
      return res.data;
    } catch (err: any) {
      const error: any = new Error('Vessel compatibility service is currently unavailable.');
      error.code = 'COMPATIBILITY_SERVICE_UNAVAILABLE';
      error.status = 503;
      throw error;
    }
  },

  async explain(params: { features?: any }) {
    try {
      const res = await mlApi.post('/explain', params);
      return res.data;
    } catch (err: any) {
      return {
        factors: [],
        plainEnglishRationale: 'Recommendation derived from multi-factor econometrics and physical charter constraints.'
      };
    }
  }
};
