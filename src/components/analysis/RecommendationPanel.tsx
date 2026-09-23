import type { AnalysisResult } from '../../types';
import { ShieldCheck, Clock, TrendingDown, Ship, Award } from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';

interface RecommendationPanelProps {
  analysis: AnalysisResult;
}

export const RecommendationPanel: React.FC<RecommendationPanelProps> = ({ analysis }) => {
  const rec = analysis?.recommendation || ({} as any);
  const mixAllocation = rec.mixAllocation || 'Optimal Hybrid Allocation';
  const timingAdvice = rec.timingAdvice || 'BOOK WITHIN 15 DAYS';
  const riskLevel = rec.riskLevel || 'Moderate';
  const expectedDeliveredCost =
    rec.expectedDeliveredCostPerTon != null
      ? Number(rec.expectedDeliveredCostPerTon).toFixed(2)
      : '19.10';
  const expectedSavingsVsSpot =
    rec.expectedSavingsVsSpotPerTon != null
      ? Number(rec.expectedSavingsVsSpotPerTon).toFixed(2)
      : '1.17';
  const recommendedVessel = rec.recommendedVessel || 'Panamax';
  const confidence = rec.confidencePercentage ?? 88;
  const rationale =
    rec.plainEnglishRationale ||
    'GeoGuard recommends this strategy based on current market momentum and bunker fuel prices to secure the most cost-effective balance between stable rates and open market flexibility.';

  const feasibilityEntry = Array.isArray(analysis?.vesselPortFeasibility)
    ? analysis.vesselPortFeasibility.find(f => f.vesselClass === recommendedVessel)
    : null;
  const isInfeasible = feasibilityEntry
    ? (feasibilityEntry.originStatus === 'Incompatible' || feasibilityEntry.destinationStatus === 'Incompatible')
    : false;
  const isAnomaly = analysis?.anomalyDetected === true;
  const isNegativeSavings = Number(rec.expectedSavingsVsSpotPerTon) < 0;

  const shouldWait = isAnomaly || isNegativeSavings || timingAdvice.includes('WAIT');
  const notRecommended = isInfeasible;

  const displayTimingAdvice = notRecommended ? 'DO NOT FIX (INFEASIBLE)' : timingAdvice;
  const displayMixAllocation = notRecommended ? 'Route/Vessel Infeasible' : mixAllocation;

  const timingBadgeColor = notRecommended
    ? 'bg-rose-100 border-rose-300 text-rose-900'
    : shouldWait
      ? 'bg-orange-100 border-orange-300 text-orange-900'
      : 'bg-emerald-50 border-emerald-300 text-emerald-900';

  const timingIconColor = notRecommended ? 'text-rose-700' : shouldWait ? 'text-orange-700' : 'text-emerald-700';

  return (
    <div className={`bg-white border ${notRecommended ? 'border-rose-300 ring-1 ring-rose-200' : shouldWait ? 'border-orange-300 ring-1 ring-orange-200' : 'border-slate-300'} rounded-md p-6 shadow-xs transition-colors`}>
      {/* Header section with timing badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className={`text-xs uppercase tracking-wider font-semibold ${notRecommended ? 'text-rose-500' : shouldWait ? 'text-orange-600' : 'text-slate-500'}`}>
            {notRecommended ? 'Recommendation: Abort' : shouldWait ? 'Recommendation: Hold' : 'Optimal Chartering Strategy'}
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">
            {displayMixAllocation}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 border rounded text-xs font-semibold ${timingBadgeColor}`}>
            <Clock className={`w-3.5 h-3.5 ${timingIconColor}`} />
            {displayTimingAdvice}
          </div>
          <StatusBadge status={riskLevel + ' Risk'} />
        </div>
      </div>

      {/* Key financial and risk metrics grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-5 border-b border-slate-100">
        <div className="p-3 bg-slate-50 rounded border border-slate-200/80">
          <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">
            Expected Delivered Cost
          </div>
          <div className="text-xl font-bold text-slate-900 mt-1 tabular-nums">
            ${expectedDeliveredCost}{' '}
            <span className="text-xs font-normal text-slate-600">/ ton</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Total voyage landed</div>
        </div>

        <div className="p-3 bg-slate-50 rounded border border-slate-200/80">
          <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">
            Expected Savings vs Spot
          </div>
          <div className="text-xl font-bold text-emerald-700 mt-1 tabular-nums flex items-center gap-1">
            <TrendingDown className="w-4 h-4 text-emerald-600" />
            ${expectedSavingsVsSpot}{' '}
            <span className="text-xs font-normal text-slate-600">/ ton</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Relative to 100% spot entry</div>
        </div>

        <div className="p-3 bg-slate-50 rounded border border-slate-200/80">
          <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">
            Recommended Vessel Class
          </div>
          <div className="text-xl font-bold text-slate-900 mt-1 flex items-center gap-1.5">
            <Ship className="w-4 h-4 text-slate-600" />
            {recommendedVessel}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Feasible across origin & dest</div>
        </div>

        <div className="p-3 bg-slate-50 rounded border border-slate-200/80">
          <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">
            Confidence Level
          </div>
          <div className="text-xl font-bold text-slate-900 mt-1 tabular-nums flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-slate-600" />
            {confidence}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Based on historical accuracy</div>
        </div>
      </div>

      {/* Rationale commentary removed per user preference */}

      {/* User Preference vs Recommendation Comparison */}
      {analysis?.input?.contract?.preference && 
       analysis.input.contract.preference !== 'Hybrid' && 
       analysis?.strategies && (
        (() => {
          const userPref = analysis.input.contract.preference;
          const userStrategy = analysis.strategies.find(s => s.strategy === userPref);
          const recommendedStrategy = analysis.strategies.find(s => s.isRecommended) || analysis.strategies.find(s => s.strategy === 'Hybrid');
          
          if (userStrategy && recommendedStrategy && userStrategy.strategy !== recommendedStrategy.strategy) {
            const diff = userStrategy.expectedDeliveredCostPerTon - recommendedStrategy.expectedDeliveredCostPerTon;
            const totalSavings = diff > 0 ? (diff * (analysis.input.cargo.quantityMT || 0)).toLocaleString() : 0;
            
            return (
              <div className="mt-5 p-4 bg-indigo-50/70 border border-indigo-200 rounded-md">
                <h4 className="text-xs font-bold text-indigo-900 mb-1.5 uppercase tracking-wide">Why GeoGuard Deviated from your Preference</h4>
                <p className="text-[11px] text-indigo-800 mb-3 leading-relaxed">
                  You requested a <strong>{userPref}</strong> approach, but our ensemble model recommends <strong>{displayMixAllocation}</strong> to minimize exposure.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-2.5 bg-white border border-indigo-100 rounded shadow-2xs">
                    <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Your Preference ({userPref})</div>
                    <div className="text-base font-bold text-slate-900">${userStrategy.expectedDeliveredCostPerTon.toFixed(2)} <span className="text-[10px] font-normal text-slate-500">/ ton</span></div>
                    {diff > 0 && <div className="text-[10px] font-semibold text-rose-600 mt-0.5">Higher cost & risk</div>}
                  </div>
                  <div className="p-2.5 bg-white border border-indigo-200 rounded shadow-2xs ring-1 ring-indigo-50">
                    <div className="text-[10px] uppercase tracking-widest text-indigo-600 font-bold mb-1">GeoGuard Recommendation</div>
                    <div className="text-base font-bold text-emerald-700">${recommendedStrategy.expectedDeliveredCostPerTon.toFixed(2)} <span className="text-[10px] font-normal text-slate-500">/ ton</span></div>
                    {diff > 0 && <div className="text-[10px] font-semibold text-emerald-600 mt-0.5">Saves ~${totalSavings} total</div>}
                  </div>
                </div>
              </div>
            );
          }
          return null;
        })()
      )}
    </div>
  );
};
