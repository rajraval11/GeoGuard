import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { analysisApi } from '../../api/services';
import { RecommendationPanel } from '../../components/analysis/RecommendationPanel';
import { ForecastChart } from '../../components/analysis/ForecastChart';
import { StrategyComparison } from '../../components/analysis/StrategyComparison';
import { RiskSimulation } from '../../components/analysis/RiskSimulation';
import { CompatibilityMatrix } from '../../components/analysis/CompatibilityMatrix';
import { CostBreakdownTable } from '../../components/analysis/CostBreakdownTable';
import { DecisionFactors } from '../../components/analysis/DecisionFactors';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSkeleton, UnavailableState } from '../../components/common/StateViews';
import {
  Printer,
  RefreshCw,
  ArrowLeft,
  CheckCircle2,
  ShieldAlert,
  Layers,
  ChevronDown,
  ChevronUp,
  CloudLightning
} from 'lucide-react';

export const AnalysisDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const analysisId = id || 'AN-2026-0842';
  const [isScheduleExpanded, setIsScheduleExpanded] = useState(true);

  const {
    data: analysis,
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: ['analysis-detail', analysisId],
    queryFn: () => analysisApi.getAnalysisById(analysisId)
  });

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="h-6 w-48 bg-slate-200 animate-pulse rounded" />
        <LoadingSkeleton rows={4} height="h-24" />
      </div>
    );
  }

  if (isError || !analysis) {
    return (
      <div className="max-w-3xl mx-auto py-12">
        <UnavailableState
          title="Decision Report Unavailable"
          message={`Unable to retrieve analysis fixture "${analysisId}". The backend calculation service may be offline or the analysis ID does not exist.`}
          endpoint={`/analyses/${analysisId}`}
          onRetry={() => refetch()}
        />
        <div className="mt-4">
          <Link
            to="/app/analyses"
            className="text-xs font-semibold text-slate-700 hover:text-slate-900 inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Analyses List</span>
          </Link>
        </div>
      </div>
    );
  }

  const input = analysis.input || ({} as any);
  const route = input.route || {};
  const cargo = input.cargo || {};
  const contract = input.contract || {};
  const recommendation = analysis.recommendation || ({} as any);
  const forecast = analysis.forecast || ({} as any);
  const strategies = analysis.strategies || [];
  const riskSimulation = analysis.riskSimulation || ({} as any);
  const vesselPortFeasibility = analysis.vesselPortFeasibility || [];
  const costBreakdown = analysis.costBreakdown || ({} as any);
  const decisionFactors = analysis.decisionFactors || [];

  const originName = route.originPortName || 'Load Terminal';
  const destinationName = route.destinationPortName || 'Discharge Terminal';
  const cargoType = cargo.cargoType || (cargo as any)?.commodity || 'Dry Bulk Cargo';
  const quantityMT = cargo.quantityMT ?? 50000;
  const shipmentsCount = cargo.shipmentsCount ?? 1;
  const planningMonths = contract.planningDurationMonths ?? 12;

  const hasMultipleShipments =
    shipmentsCount > 1 ||
    Boolean(analysis.shipmentSchedule && analysis.shipmentSchedule.length > 0);

  const formattedDate = analysis.createdAt
    ? new Date(analysis.createdAt).toLocaleDateString()
    : 'Recent';

  return (
    <div className="max-w-5xl mx-auto space-y-6 print:p-0 print:m-0">
      {/* Top Navigation & Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Link
            to="/app/analyses"
            className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded transition-colors"
            title="Back to past analyses"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="text-[11px] text-slate-500 font-mono flex items-center gap-2">
              <span>{analysis.id}</span>
              <span>•</span>
              <span>Calculated {formattedDate}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => refetch()}
            className="px-2.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 rounded text-xs font-semibold text-slate-700 transition-colors inline-flex items-center gap-1.5"
            title="Re-run calculation"
          >
            <RefreshCw className="w-3 h-3 text-slate-500" />
            <span>Refresh</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-3 py-1.5 bg-slate-900 text-white hover:bg-slate-800 rounded text-xs font-semibold transition-colors inline-flex items-center gap-1.5 shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Export Report (PDF)</span>
          </button>
        </div>
      </div>

      {/* Decision Header */}
      <div className="bg-white border border-slate-200 rounded-md p-5 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
              <span>{originName}</span>
              <span className="text-slate-400 font-normal">→</span>
              <span>{destinationName}</span>
            </h1>
            <div className="text-xs text-slate-600 mt-1 flex flex-wrap items-center gap-2 font-medium">
              <span>{cargoType}</span>
              <span>•</span>
              <span className="tabular-nums">
                {quantityMT.toLocaleString()} MT
              </span>
              <span>•</span>
              <span>{planningMonths} months horizon</span>
              <span>•</span>
              <span>{shipmentsCount} {shipmentsCount === 1 ? 'planned shipment' : 'planned shipments'}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-[10px] uppercase font-semibold text-slate-400">
                Status
              </div>
              <div className="text-xs font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Analysis completed
              </div>
            </div>
            <StatusBadge status={analysis.status || 'Completed'} variant="success" size="md" />
          </div>
        </div>
      </div>

      {/* Market Early Warning (Isolation Forest Anomaly Detection) */}
      <div className="bg-white border border-slate-200 rounded-md p-4 shadow-2xs">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div
              className={`p-2 rounded mt-0.5 shrink-0 ${
                analysis.anomalyDetected === true
                  ? 'bg-amber-100 text-amber-800'
                  : analysis.anomalyDetected === false
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Market Early Warning
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  • Market Integrity Scan
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 mt-0.5">
                {analysis.anomalyDetected === true
                  ? 'Market divergence detected'
                  : analysis.anomalyDetected === false
                  ? 'Market conditions nominal'
                  : 'Early-warning analysis unavailable'}
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {analysis.anomalyDetected === true
                  ? 'One or more monitored indicators are behaving outside their recent normal range.'
                  : analysis.anomalyDetected === false
                  ? 'No significant deviation detected across monitored freight, bunker, volume or congestion indicators.'
                  : 'The anomaly service has not returned a result.'}
              </p>
            </div>
          </div>

          <div>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${
                analysis.anomalyDetected === true
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : analysis.anomalyDetected === false
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}
            >
              {analysis.anomalyDetected === true
                ? 'Warning'
                : analysis.anomalyDetected === false
                ? 'Normal'
                : 'Unavailable'}
            </span>
          </div>
        </div>
      </div>

      {/* Weather-aware Route Status */}
      <div className="bg-white border border-slate-200 rounded-md p-5 shadow-2xs mt-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div
                className={`p-2 rounded mt-0.5 shrink-0 ${
                  ['SEVERE', 'HIGH'].includes(analysis.weatherExposure || '')
                    ? 'bg-rose-100 text-rose-800'
                    : analysis.weatherExposure === 'MODERATE'
                    ? 'bg-amber-100 text-amber-800'
                    : analysis.weatherExposure === 'LOW'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                <CloudLightning className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Weather-Aware Route Status
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    • Corridor Approximation
                  </span>
                  {analysis.weatherFreshness === 'STALE' && (
                    <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded">
                      STALE CACHE WARNING
                    </span>
                  )}
                </div>
                
                <h3 className="text-sm font-bold text-slate-900 mt-1">
                  {analysis.weatherStatus === 'UNAVAILABLE' 
                    ? 'Live marine weather unavailable'
                    : `Exposure Level: ${analysis.weatherExposure}`}
                </h3>
                
                <p className="text-xs text-slate-600 mt-1 leading-relaxed max-w-3xl">
                  {analysis.weatherStatus === 'UNAVAILABLE'
                    ? 'Weather data is currently unavailable. The baseline route remains unchanged and the core analysis is still valid.'
                    : analysis.weatherExposure && ['SEVERE', 'HIGH', 'MODERATE'].includes(analysis.weatherExposure)
                    ? 'Elevated weather exposure detected on the baseline corridor. Alternative maritime routing is unavailable.'
                    : 'Weather assessment based on route corridor approximation. Baseline route remains unchanged.'}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1.5">
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded text-[11px] font-semibold border uppercase tracking-wider ${
                  ['SEVERE', 'HIGH'].includes(analysis.weatherExposure || '')
                    ? 'bg-rose-50 text-rose-800 border-rose-200'
                    : analysis.weatherExposure === 'MODERATE'
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : analysis.weatherExposure === 'LOW'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}
              >
                {analysis.weatherExposure || 'UNAVAILABLE'}
              </span>
              <span className="text-[10px] font-medium text-slate-500">
                Freshness: <span className="font-bold text-slate-700">{analysis.weatherFreshness || 'UNAVAILABLE'}</span>
              </span>
            </div>
          </div>

          {analysis.weatherStatus === 'SUCCESS' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
              <div className="bg-slate-50 p-2.5 rounded border border-slate-200/60">
                <div className="text-[10px] uppercase font-semibold text-slate-500 mb-1">Max Wave / Swell</div>
                <div className="text-sm font-bold text-slate-900 tabular-nums">
                  {analysis.maxWaveM?.toFixed(1) || '0.0'}m <span className="text-slate-400 font-normal">/</span> {analysis.maxSwellM?.toFixed(1) || '0.0'}m
                </div>
              </div>
              <div className="bg-slate-50 p-2.5 rounded border border-slate-200/60">
                <div className="text-[10px] uppercase font-semibold text-slate-500 mb-1">Max Current</div>
                <div className="text-sm font-bold text-slate-900 tabular-nums">
                  {analysis.maxCurrentKt !== undefined && analysis.maxCurrentKt !== null ? `${analysis.maxCurrentKt} kt` : 'N/A'}
                </div>
              </div>
              <div className="bg-slate-50 p-2.5 rounded border border-slate-200/60">
                <div className="text-[10px] uppercase font-semibold text-slate-500 mb-1">Worst Segment</div>
                <div className="text-sm font-bold text-slate-900 truncate">
                  {analysis.worstSegment || 'None'}
                </div>
              </div>
              <div className="bg-slate-50 p-2.5 rounded border border-slate-200/60">
                <div className="text-[10px] uppercase font-semibold text-slate-500 mb-1">Affected Segments</div>
                <div className="text-[11px] font-medium text-slate-700">
                  {analysis.affectedSegments && analysis.affectedSegments.length > 0
                    ? analysis.affectedSegments.join(', ')
                    : 'No elevated-weather segment was detected.'}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 1. Large Restrained Recommendation Panel */}
      <RecommendationPanel analysis={analysis} />

      {/* 2. Forecast Section with Line Chart */}
      <ForecastChart
        timeSeries={forecast.timeSeries}
        currentRate={forecast.currentRatePerTon}
        fourWeekForecast={forecast.fourWeekForecastPerTon}
        eightWeekForecast={forecast.eightWeekForecastPerTon}
        forecastRangeText={forecast.forecastRangeText}
      />

      {/* 3. Contract Strategy Comparison Table */}
      <StrategyComparison strategies={strategies} />

      {/* Multi-Shipment Schedule (Expandable / Collapsible) */}
      {hasMultipleShipments && (
        <div className="bg-white border border-slate-200 rounded-md p-5 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-slate-700" />
                <span>Shipment Schedule</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Shipment allocation across the {planningMonths}-month planning horizon
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsScheduleExpanded(!isScheduleExpanded)}
              className="px-2.5 py-1 text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded border border-slate-200 transition-colors flex items-center gap-1 font-medium"
            >
              <span>{isScheduleExpanded ? 'Collapse' : 'Expand'}</span>
              {isScheduleExpanded ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          {isScheduleExpanded && (
            <div className="mt-3">
              {analysis.shipmentSchedule && analysis.shipmentSchedule.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                        <th className="py-2.5 px-3">Shipment</th>
                        <th className="py-2.5 px-3">Month</th>
                        <th className="py-2.5 px-3">Cargo</th>
                        <th className="py-2.5 px-3">Vessel class</th>
                        <th className="py-2.5 px-3">Contract allocation</th>
                        <th className="py-2.5 px-3 text-right">Estimated cost</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {analysis.shipmentSchedule.map((item, idx) => (
                        <tr
                          key={idx}
                          className="hover:bg-slate-50/70 transition-colors"
                        >
                          <td className="py-2 px-3 font-mono font-semibold text-slate-900">
                            {item.shipment}
                          </td>
                          <td className="py-2 px-3 text-slate-700 font-medium">
                            {item.month}
                          </td>
                          <td className="py-2 px-3 tabular-nums text-slate-800">
                            {item.cargo}
                          </td>
                          <td className="py-2 px-3 text-slate-600">
                            {item.vesselClass}
                          </td>
                          <td className="py-2 px-3">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                                (item.contractAllocation || '')
                                  .toLowerCase()
                                  .includes('medium') ||
                                (item.contractAllocation || '')
                                  .toLowerCase()
                                  .includes('mt')
                                  ? 'bg-blue-50 text-blue-800 border border-blue-200'
                                  : 'bg-slate-100 text-slate-700 border border-slate-200'
                              }`}
                            >
                              {item.contractAllocation}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-right text-[11px] text-slate-800 font-mono">
                            {item.estimatedCost}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-slate-500 bg-slate-50 rounded border border-dashed border-slate-200">
                  <p className="font-semibold text-slate-700">
                    Shipment schedule unavailable
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    The shipment allocation schedule was not returned by the
                    optimization service.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 4. Risk Simulation has been hidden per user preference */}

      {/* 5. Vessel & Port Compatibility */}
      <CompatibilityMatrix
        feasibility={vesselPortFeasibility}
        originName={originName}
        destinationName={destinationName}
      />

      {/* 6. Auditable Delivered Voyage Cost Breakdown */}
      <CostBreakdownTable
        breakdown={costBreakdown}
        quantityMT={quantityMT}
      />

      {/* 7. Why this recommendation? (Decision Factors) */}
      <DecisionFactors
        factors={decisionFactors}
        summaryExplanation={recommendation.plainEnglishRationale}
      />

      {/* Bottom Compliance & Disclaimer */}
      <div className="p-4 bg-slate-100/70 border border-slate-200 rounded text-[11px] text-slate-500 leading-relaxed">
        <span className="font-semibold text-slate-700">Governance & Audit Notice: </span>
        This chartering evaluation was generated by the GeoGuard Decision Support engine using Baltic Exchange spot indices, forward freight agreements (FFA), physical terminal constraints, and speed-optimized bunker consumption tables. Fixture commitments remain subject to commercial charterer confirmation.
      </div>
    </div>
  );
};
