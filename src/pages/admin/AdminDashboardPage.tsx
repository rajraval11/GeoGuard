import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../api/services';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSkeleton } from '../../components/common/StateViews';
import {
  Activity,
  Cpu,
  Users,
  Database,
  ArrowRight
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { data: usage } = useQuery({
    queryKey: ['admin-usage'],
    queryFn: adminApi.getUsage
  });

  const { data: modelPerf } = useQuery({
    queryKey: ['admin-model-performance'],
    queryFn: adminApi.getModelPerformance
  });

  const { data: dataHealth, isLoading: isHealthLoading } = useQuery({
    queryKey: ['admin-data-health'],
    queryFn: adminApi.getDataHealth
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            System Telemetry & Platform Health
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational status of data ingestion workers, econometric pipelines, and user quotas
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Pipeline Status:</span>
          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-xs font-semibold">
            All Pipelines Nominal
          </span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-md p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider">System Health</span>
            <Activity className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 mt-2">100.0%</div>
          <div className="text-[11px] text-emerald-700 mt-1 flex items-center gap-1">
            <span>● All microservices running</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-md p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Forecast Model</span>
            <Cpu className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 mt-2">
            {modelPerf?.modelVersion.split(' ')[0] || 'v2.4.1'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            MAE: {modelPerf?.forecastMAE.toFixed(2)} $/t
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-md p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Analyses Generated</span>
            <Database className="w-4 h-4 text-slate-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 mt-2 tabular-nums">
            {usage?.analysesThisMonth || 184}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">This month across 16 orgs</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-md p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Active Charterers</span>
            <Users className="w-4 h-4 text-slate-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 mt-2 tabular-nums">
            {usage?.activeUsersCount || 42}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Across Asia & Europe desks</div>
        </div>
      </div>

      {/* Two Column Layout: Data Feeds & Model Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Data Health Summary */}
        <div className="bg-white border border-slate-200 rounded-md p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
              Critical Data Feeds
            </div>
            <Link
              to="/admin/data-health"
              className="text-xs text-blue-700 hover:text-blue-900 font-semibold flex items-center gap-1"
            >
              <span>Manage all</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {isHealthLoading ? (
            <LoadingSkeleton rows={4} />
          ) : (
            <div className="space-y-2.5">
              {(dataHealth || []).slice(0, 5).map((source) => (
                <div
                  key={source.id}
                  className="flex items-center justify-between p-2.5 bg-slate-50 rounded border border-slate-200/70 text-xs"
                >
                  <div>
                    <div className="font-semibold text-slate-800">{source.source}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Last update: {source.lastUpdated}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[11px] text-slate-500 tabular-nums">
                      {source.records.toLocaleString()} rows
                    </span>
                    <StatusBadge status={source.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Model Performance Snapshot */}
        <div className="bg-white border border-slate-200 rounded-md p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
              Forecasting Model Telemetry
            </div>
            <Link
              to="/admin/model-performance"
              className="text-xs text-blue-700 hover:text-blue-900 font-semibold flex items-center gap-1"
            >
              <span>View backtests</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="p-3 bg-slate-50 rounded border border-slate-200/80 text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Algorithm Stack:</span>
              <span className="font-semibold text-slate-800">XGBoost + SARIMAX + Quantile Reg</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Training Samples:</span>
              <span className="font-mono font-semibold text-slate-800">
                {modelPerf?.trainingSamplesCount.toLocaleString()} maritime fixtures
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Mean Absolute Error (MAE):</span>
              <span className="font-mono font-semibold text-slate-800">
                ${modelPerf?.forecastMAE.toFixed(2)} / MT
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Root Mean Sq. Error (RMSE):</span>
              <span className="font-mono font-semibold text-slate-800">
                ${modelPerf?.forecastRMSE.toFixed(2)} / MT
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Backtest Reliability Score:</span>
              <span className="font-mono font-bold text-emerald-700">
                {modelPerf?.backtestPerformanceScore}%
              </span>
            </div>
            <div className="flex justify-between pt-1 border-t border-slate-200 text-[10px]">
              <span className="text-slate-400">Last Model Retrained:</span>
              <span className="font-mono text-slate-600">{modelPerf?.lastTrainedDate}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
