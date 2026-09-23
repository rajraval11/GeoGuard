import { apiClient } from './client';
import type {
  AnalysisInput,
  AnalysisResult,
  MarketSnapshot,
  MarketAlert,
  PortRecord,
  VesselRecord,
  User,
  AdminDataHealthSource,
  AdminModelPerformance,
  AdminUsageMetrics,
  ForecastRequest,
  ForecastResponse,
  CompatibilityRequest,
  CompatibilityResponse,
  OptimizationRequest,
  OptimizationResponse,
} from '../types';
import {
  BENCHMARK_INDONESIA_PARADIP,
  BENCHMARK_PAST_ANALYSES,
  BENCHMARK_PORTS,
  BENCHMARK_VESSELS,
  BENCHMARK_DATA_HEALTH,
  BENCHMARK_MODEL_PERFORMANCE,
  BENCHMARK_USAGE,
} from '../data/benchmarkFixture';

// Auth API
export const authApi = {
  login: async (credentials: { email: string; password: string; role?: string }): Promise<{ user: User; token: string }> => {
    try {
      const response = await apiClient.post<{ user: User; token: string }>('/auth/login', credentials);
      return response.data;
    } catch (err: any) {
      // In development when backend is offline, provide the realistic session matching the selected pathway
      if (import.meta.env.DEV && (err.code === 'ERR_NETWORK' || !err.response)) {
        const isAdmin = credentials.role === 'Admin' || credentials.email.toLowerCase().includes('admin');
        const mockUser: User = isAdmin
          ? {
              id: 'usr-admin',
              name: 'Elena Rostova',
              email: credentials.email || 'admin@geoguard.io',
              role: 'Admin',
              organizationId: 'org-admin',
              organizationName: 'GeoGuard Systems',
              createdAt: '2025-11-01',
              status: 'Active'
            }
          : {
              id: 'usr-001',
              name: 'Marcus Vance',
              email: credentials.email || 'm.vance@pacificbulk.com',
              role: 'Charterer',
              organizationId: 'org-101',
              organizationName: 'Pacific Bulk Carriers Ltd.',
              createdAt: '2026-01-15',
              status: 'Active'
            };
        const mockToken = `geoguard-dev-jwt-${isAdmin ? 'admin' : 'charterer'}`;
        return { user: mockUser, token: mockToken };
      }
      throw err;
    }
  },

  register: async (data: { name: string; email: string; organizationName: string; password: string }): Promise<{ user: User; token: string }> => {
    const response = await apiClient.post<{ user: User; token: string }>('/auth/register', data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      localStorage.removeItem('geoguard_auth_token');
      localStorage.removeItem('geoguard_user');
    }
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<User>('/auth/me');
    return response.data;
  }
};

// Analysis API
export const analysisApi = {
  listAnalyses: async (): Promise<AnalysisResult[]> => {
    try {
      const response = await apiClient.get('/analyses');
      return response.data;
    } catch (err) {
      // Return initial benchmark analyses if backend is in development/offline
      if (import.meta.env.DEV) {
        return BENCHMARK_PAST_ANALYSES;
      }
      throw err;
    }
  },

  getAnalysisById: async (id: string): Promise<AnalysisResult> => {
    try {
      const response = await apiClient.get(`/analyses/${id}`);
      return response.data;
    } catch (err) {
      // If benchmark ID requested or during development testing
      if (id === 'AN-2026-0842' || id === 'benchmark') {
        return BENCHMARK_INDONESIA_PARADIP;
      }
      const match = BENCHMARK_PAST_ANALYSES.find((a) => a.id === id);
      if (match) return match;
      throw err;
    }
  },

  createAnalysis: async (input: AnalysisInput): Promise<AnalysisResult> => {
    try {
      const response = await apiClient.post('/analyses', input);
      return response.data;
    } catch (err) {
      // During development when backend is not actively listening, return computed benchmark result for testing
      if (import.meta.env.DEV) {
        return {
          ...BENCHMARK_INDONESIA_PARADIP,
          id: `AN-${Date.now().toString().slice(-6)}`,
          createdAt: new Date().toISOString(),
          input
        };
      }
      throw err;
    }
  }
};

// Market Data API
export const marketApi = {
  getBalticSnapshot: async (): Promise<MarketSnapshot[]> => {
    try {
      const response = await apiClient.get('/market/snapshot');
      return response.data;
    } catch (err) {
      if (import.meta.env.DEV) {
        return [
          { balticIndexName: 'Baltic Panamax (BPI 82)', currentRate: '$16,420 / day', sevenDayMovement: '+4.2%', direction: 'up', updatedAt: 'Today 11:00 UTC' },
          { balticIndexName: 'Baltic Supramax (BSI 58)', currentRate: '$14,180 / day', sevenDayMovement: '+1.8%', direction: 'up', updatedAt: 'Today 11:00 UTC' },
          { balticIndexName: 'Baltic Capesize (BCI 180)', currentRate: '$24,650 / day', sevenDayMovement: '-2.1%', direction: 'down', updatedAt: 'Today 11:00 UTC' },
          { balticIndexName: 'VLSFO Bunker (Singapore)', currentRate: '$622.50 / MT', sevenDayMovement: '-0.4%', direction: 'flat', updatedAt: 'Today 10:30 UTC' }
        ];
      }
      throw err;
    }
  },

  getMarketAlerts: async (): Promise<MarketAlert[]> => {
    try {
      const response = await apiClient.get('/market/alerts');
      return response.data;
    } catch (err) {
      if (import.meta.env.DEV) {
        return [
          {
            id: 'alt-01',
            type: 'rate',
            severity: 'warning',
            headline: 'Freight rates trending upward',
            details: 'Pacific Panamax spot index increased 4.2% over 7 days, driven by active East Coast India thermal coal replenishment.',
            timestamp: '2 hours ago'
          },
          {
            id: 'alt-02',
            type: 'congestion',
            severity: 'warning',
            headline: 'Destination congestion elevated',
            details: 'Paradip Port average waiting time increased to 36 hours due to monsoon handling slowdown and high coal discharge queue.',
            timestamp: '5 hours ago'
          },
          {
            id: 'alt-03',
            type: 'vessel',
            severity: 'alert',
            headline: 'Panamax availability tightening',
            details: 'Prompt open tonnage in South-East Asia basin down 14% week-on-week as Chinese grain fixtures absorb ballast fleet.',
            timestamp: '1 day ago'
          }
        ];
      }
      throw err;
    }
  }
};

// Vessel and Port API
export const vesselPortApi = {
  getPorts: async (): Promise<PortRecord[]> => {
    try {
      const response = await apiClient.get('/routes');
      return response.data;
    } catch (err) {
      if (import.meta.env.DEV) return BENCHMARK_PORTS;
      throw err;
    }
  },

  getVessels: async (): Promise<VesselRecord[]> => {
    try {
      const response = await apiClient.get('/vessels');
      return response.data;
    } catch (err) {
      if (import.meta.env.DEV) return BENCHMARK_VESSELS;
      throw err;
    }
  }
};

// Reference API
export const referenceApi = {
  getOrigins: async (): Promise<Record<string, { id: string; name: string }[]>> => {
    const response = await apiClient.get('/origins');
    return response.data;
  },
  getDestinations: async (): Promise<Record<string, { id: string; name: string }[]>> => {
    const response = await apiClient.get('/destinations');
    return response.data;
  },
  getLocations: async (): Promise<Record<string, { id: string; name: string }[]>> => {
    const response = await apiClient.get('/locations');
    return response.data;
  },
  getDistance: async (originPortId: string, destinationPortId: string): Promise<number> => {
    const response = await apiClient.get(`/distance?originPortId=${encodeURIComponent(originPortId)}&destinationPortId=${encodeURIComponent(destinationPortId)}`);
    return response.data.distanceNM;
  }
};

// Admin API
export const adminApi = {
  getDataHealth: async (): Promise<AdminDataHealthSource[]> => {
    try {
      const response = await apiClient.get('/admin/data-health');
      return response.data;
    } catch (err) {
      if (import.meta.env.DEV) return BENCHMARK_DATA_HEALTH;
      throw err;
    }
  },

  getModelPerformance: async (): Promise<AdminModelPerformance> => {
    try {
      const response = await apiClient.get('/admin/model-performance');
      return response.data;
    } catch (err) {
      if (import.meta.env.DEV) return BENCHMARK_MODEL_PERFORMANCE;
      throw err;
    }
  },

  getUsage: async (): Promise<AdminUsageMetrics> => {
    try {
      const response = await apiClient.get('/admin/usage');
      return response.data;
    } catch (err) {
      if (import.meta.env.DEV) return BENCHMARK_USAGE;
      throw err;
    }
  },

  getUsers: async (): Promise<User[]> => {
    try {
      const response = await apiClient.get('/admin/users');
      return response.data;
    } catch (err) {
      if (import.meta.env.DEV) {
        return [
          { id: 'usr-1', name: 'Marcus Vance', email: 'm.vance@pacificbulk.com', role: 'Charterer', organizationId: 'org-1', organizationName: 'Pacific Bulk Carriers', createdAt: '2026-02-10', lastActive: '10 mins ago', status: 'Active' },
          { id: 'usr-2', name: 'Elena Rostova', email: 'e.rostova@geoguard.io', role: 'Admin', organizationId: 'org-0', organizationName: 'GeoGuard Systems', createdAt: '2025-11-01', lastActive: 'Just now', status: 'Active' },
          { id: 'usr-3', name: 'Siddharth Rao', email: 's.rao@bharatpower.co.in', role: 'Charterer', organizationId: 'org-2', organizationName: 'Bharat Power Imports', createdAt: '2026-04-18', lastActive: '2 hours ago', status: 'Active' },
          { id: 'usr-4', name: 'Henrik Lindqvist', email: 'h.lindqvist@nordictrade.se', role: 'Analyst', organizationId: 'org-3', organizationName: 'Nordic Commodity Trading', createdAt: '2026-05-22', lastActive: '3 days ago', status: 'Active' },
          { id: 'usr-5', name: 'Karthik Menon', email: 'k.menon@coromandel.in', role: 'Charterer', organizationId: 'org-4', organizationName: 'Coromandel Steels', createdAt: '2026-07-09', lastActive: '5 days ago', status: 'Suspended' }
        ];
      }
      throw err;
    }
  }
};

// Standalone Direct Calculation APIs
export const forecastApi = {
  getForecast: async (params: ForecastRequest): Promise<ForecastResponse> => {
    const response = await apiClient.post<ForecastResponse>('/forecast', params);
    return response.data;
  }
};

export const compatibilityApi = {
  checkCompatibility: async (params: CompatibilityRequest): Promise<CompatibilityResponse> => {
    const response = await apiClient.post<CompatibilityResponse>('/compatibility', params);
    return response.data;
  }
};

export const optimizationApi = {
  optimizeContractMix: async (params: OptimizationRequest): Promise<OptimizationResponse> => {
    const response = await apiClient.post<OptimizationResponse>('/optimization', params);
    return response.data;
  }
};


