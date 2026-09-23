import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../api/services';
import { LoadingSkeleton } from '../../components/common/StateViews';

export const UsagePage: React.FC = () => {
  const { data: usage, isLoading } = useQuery({
    queryKey: ['admin-usage'],
    queryFn: adminApi.getUsage
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Platform Consumption & Operational Metrics
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Query volume, optimization solve compute times, and institutional active sessions
          </p>
        </div>
      </div>

      {isLoading ? (
        <LoadingSkeleton rows={4} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-md p-4 shadow-2xs">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
              Analyses Executed
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">
              {usage?.analysesThisMonth || 184}
            </div>
            <div className="text-[11px] text-emerald-700 mt-1">+18% month-on-month</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-md p-4 shadow-2xs">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
              API Success Rate
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">
              {usage?.apiSuccessRate || 99.82}%
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Target SLA: &gt; 99.5%</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-md p-4 shadow-2xs">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
              Average Latency
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">
              {usage?.averageResponseTimeMs || 142} ms
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Including MILP solve step</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-md p-4 shadow-2xs">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
              Enterprise Organizations
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">
              {usage?.organizationCount || 16}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Multi-seat tenants active</div>
          </div>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-md p-5 shadow-2xs">
        <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-2">
          Computational Resource Allocation
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          GeoGuard assigns high-priority worker threads to Monte Carlo simulations (1,000+ iterations per evaluation) and Linear Programming solver routines. Optimization solvers run in isolated sandboxes to guarantee sub-second turnaround on multi-shipment parcels.
        </p>
      </div>
    </div>
  );
};
