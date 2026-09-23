import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { marketApi, analysisApi } from '../../api/services';
import { LoadingSkeleton } from '../../components/common/StateViews';
import {
  PlusCircle,
  FileText,
  Activity,
  CheckCircle,
  TrendingDown,
  DollarSign,
  AlertCircle,
  ArrowRight,
  Zap,
  BarChart2,
  Clock
} from 'lucide-react';
import { useAuth } from '../../context/useAuth';

export const OverviewPage: React.FC = () => {
  const { user } = useAuth();

  const {
    data: recentAnalyses,
    isLoading: isAnalysesLoading
  } = useQuery({
    queryKey: ['recent-analyses'],
    queryFn: analysisApi.listAnalyses
  });

  const {
    data: marketAlerts,
    isLoading: isAlertsLoading
  } = useQuery({
    queryKey: ['market-alerts'],
    queryFn: marketApi.getMarketAlerts
  });

  // Calculate Metrics from real data
  const hasData = recentAnalyses && recentAnalyses.length > 0;

  const activeAnalyses = hasData ? recentAnalyses.filter(a => a.status !== 'Completed').length : 0;
  const completedAnalyses = hasData ? recentAnalyses.filter(a => a.status === 'Completed').length : 0;

  const totalSavings = hasData
    ? recentAnalyses.reduce((acc, curr) => acc + (curr.recommendation?.expectedSavingsVsSpotPerTon || 0), 0)
    : 0;

  const latestCost = hasData
    ? recentAnalyses[0]?.recommendation?.expectedDeliveredCostPerTon
    : null;

  const marketStatus = isAlertsLoading
    ? 'Loading...'
    : marketAlerts && marketAlerts.length > 0
    ? `${marketAlerts.length} Active Alerts`
    : 'Stable';

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  })();

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-up">
      {/* ── Welcome Header + Primary CTA ── */}
      <div className="bg-white border border-slate-200 rounded-md p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-widest mb-1">
              Operational Overview
            </p>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              {greeting}, {user?.name?.split(' ')[0] || 'User'}
            </h2>
            <p className="text-xs text-slate-500 mt-1.5 max-w-xl leading-relaxed">
              Monitor freight conditions, review active analyses, and identify opportunities to improve delivered cargo cost.
            </p>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              to="/app/analyses"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-slate-700 border border-slate-300 rounded text-xs font-semibold hover:bg-slate-50 transition-colors shadow-xs"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>View All Analyses</span>
            </Link>
            <Link
              to="/app/analysis/new"
              className="cta-primary inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white border border-slate-900 rounded text-xs font-semibold hover:bg-slate-800 transition-colors shadow-xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>New Analysis</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Key Decision Metrics ── */}
      <section>
        <h3 className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-3 px-0.5">
          Key Decision Metrics
        </h3>

        {isAnalysesLoading ? (
          <LoadingSkeleton rows={1} height="h-24" />
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Active */}
            <div className="card-hover bg-white border border-slate-200 rounded-md p-4 shadow-2xs">
              <div className="flex items-center gap-2 text-slate-500 mb-2.5">
                <Activity className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="text-[11px] font-semibold uppercase tracking-wide">Active</span>
              </div>
              <div className="text-2xl font-bold text-slate-900 tabular-nums">
                {hasData ? activeAnalyses : <span className="text-sm text-slate-400 font-medium">—</span>}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">Analyses running</div>
            </div>

            {/* Completed */}
            <div className="card-hover bg-white border border-slate-200 rounded-md p-4 shadow-2xs">
              <div className="flex items-center gap-2 text-slate-500 mb-2.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="text-[11px] font-semibold uppercase tracking-wide">Completed</span>
              </div>
              <div className="text-2xl font-bold text-slate-900 tabular-nums">
                {hasData ? completedAnalyses : <span className="text-sm text-slate-400 font-medium">—</span>}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">Decision reports</div>
            </div>

            {/* Savings */}
            <div className="card-hover bg-white border border-slate-200 rounded-md p-4 shadow-2xs">
              <div className="flex items-center gap-2 text-slate-500 mb-2.5">
                <TrendingDown className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="text-[11px] font-semibold uppercase tracking-wide">Savings</span>
              </div>
              <div className="text-xl font-bold text-slate-900 tabular-nums mt-0.5">
                {hasData && totalSavings > 0
                  ? `$${totalSavings.toFixed(2)}/t`
                  : <span className="text-sm text-slate-400 font-medium">—</span>}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">vs. all-spot baseline</div>
            </div>

            {/* Latest Cost */}
            <div className="card-hover bg-white border border-slate-200 rounded-md p-4 shadow-2xs">
              <div className="flex items-center gap-2 text-slate-500 mb-2.5">
                <DollarSign className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="text-[11px] font-semibold uppercase tracking-wide">Latest Cost</span>
              </div>
              <div className="text-xl font-bold text-slate-900 tabular-nums mt-0.5">
                {latestCost
                  ? `$${latestCost.toFixed(2)}/t`
                  : <span className="text-sm text-slate-400 font-medium">—</span>}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">Delivered cost per ton</div>
            </div>

            {/* Market Status */}
            <div className="card-hover bg-white border border-slate-200 rounded-md p-4 shadow-2xs col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2 text-slate-500 mb-2.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span className="text-[11px] font-semibold uppercase tracking-wide">Market</span>
              </div>
              <div className="text-base font-bold text-slate-900 mt-0.5">
                {marketStatus}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">Market conditions</div>
            </div>
          </div>
        )}
      </section>

      {/* ── Recent Analyses ── */}
      <section>
        <div className="flex items-center justify-between mb-3 px-0.5">
          <h3 className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
            Recent Analyses
          </h3>
          {hasData && (
            <Link
              to="/app/analyses"
              className="text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1 transition-colors"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          )}
        </div>

        <div className="bg-white border border-slate-200 rounded-md shadow-2xs overflow-hidden">
          {isAnalysesLoading ? (
            <div className="p-6">
              <LoadingSkeleton rows={5} />
            </div>
          ) : !hasData ? (
            <div className="p-12 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                <BarChart2 className="w-5 h-5 text-slate-400" />
              </div>
              <h4 className="text-sm font-semibold text-slate-900 mb-1">No analyses yet</h4>
              <p className="text-xs text-slate-500 max-w-sm mb-5 leading-relaxed">
                You haven't run any freight chartering analyses. Start one to evaluate route costs, contract strategies, and savings opportunities.
              </p>
              <Link
                to="/app/analysis/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-800 transition-colors"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Start your first analysis</span>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4">Analysis</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Cargo</th>
                    <th className="py-3 px-4">Route</th>
                    <th className="py-3 px-4">Vessel</th>
                    <th className="py-3 px-4">Strategy</th>
                    <th className="py-3 px-4 text-right">Delivered Cost</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentAnalyses.slice(0, 8).map((item) => {
                    const dateFormatted = new Date(item.createdAt).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    });

                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="py-3 px-4 text-xs font-mono font-medium text-slate-900 whitespace-nowrap">
                          {item.id}
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-500 whitespace-nowrap">
                          {dateFormatted}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="font-medium text-slate-900">{item.input?.cargo?.cargoType}</div>
                          <div className="text-[10px] text-slate-500 tabular-nums">{item.input?.cargo?.quantityMT?.toLocaleString()} MT</div>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 text-slate-800">
                            <span className="font-medium">{item.input?.route?.originPortName}</span>
                            <span className="text-slate-400">→</span>
                            <span className="font-medium">{item.input?.route?.destinationPortName}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                          {item.recommendation?.recommendedVessel}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-100">
                            {item.recommendation?.strategyName}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right tabular-nums font-bold text-slate-900 whitespace-nowrap">
                          ${item.recommendation?.expectedDeliveredCostPerTon?.toFixed(2)}/t
                        </td>
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <Link
                            to={`/app/analysis/${item.id}`}
                            className="inline-flex items-center px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                          >
                            Open →
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* ── Quick Actions ── */}
      <section>
        <h3 className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-3 px-0.5">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link
            to="/app/analysis/new"
            className="card-hover bg-white border border-slate-200 rounded-md p-4 shadow-2xs flex items-start gap-3 hover:bg-slate-50 transition-colors group"
          >
            <div className="p-2 bg-slate-100 rounded shrink-0">
              <Zap className="w-4 h-4 text-slate-600" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-900 group-hover:text-slate-700">Run new chartering analysis</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Evaluate cargo, route, and contract strategy</div>
            </div>
          </Link>
          <Link
            to="/app/analyses"
            className="card-hover bg-white border border-slate-200 rounded-md p-4 shadow-2xs flex items-start gap-3 hover:bg-slate-50 transition-colors group"
          >
            <div className="p-2 bg-slate-100 rounded shrink-0">
              <FileText className="w-4 h-4 text-slate-600" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-900 group-hover:text-slate-700">Review past analyses</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Browse historical decision reports</div>
            </div>
          </Link>
          <Link
            to="/app/routes"
            className="card-hover bg-white border border-slate-200 rounded-md p-4 shadow-2xs flex items-start gap-3 hover:bg-slate-50 transition-colors group"
          >
            <div className="p-2 bg-slate-100 rounded shrink-0">
              <Clock className="w-4 h-4 text-slate-600" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-900 group-hover:text-slate-700">Browse routes & port data</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Supported origins, India ports, distances</div>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
};
