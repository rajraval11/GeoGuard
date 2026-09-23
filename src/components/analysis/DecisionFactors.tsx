import type { DecisionFactor } from '../../types';
import { ArrowUpRight, ArrowDownRight, Minus, CheckCircle } from 'lucide-react';

interface DecisionFactorsProps {
  factors: DecisionFactor[];
  summaryExplanation?: string;
}

export const DecisionFactors: React.FC<DecisionFactorsProps> = ({
  factors,
  summaryExplanation
}) => {
  const getTrendIcon = (trend: DecisionFactor['trend']) => {
    switch (trend) {
      case 'up':
        return <ArrowUpRight className="w-3.5 h-3.5 text-amber-600 stroke-[2.5]" />;
      case 'down':
        return <ArrowDownRight className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />;
      case 'compatible':
        return <CheckCircle className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />;
      default:
        return <Minus className="w-3.5 h-3.5 text-slate-500 stroke-[2.5]" />;
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-md p-5 shadow-xs">
      <div className="pb-3 border-b border-slate-100">
        <h3 className="text-sm font-semibold text-slate-900">Why this recommendation?</h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Key market variables, physical port constraints, and risk parameters driving the optimization model
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 my-4">
        {(factors || []).length === 0 ? (
          <div className="col-span-full py-4 text-center text-xs text-slate-500 bg-slate-50 rounded border border-dashed border-slate-200">
            Decision factor telemetry unavailable
          </div>
        ) : (
          (factors || []).map((f) => (
            <div
              key={f.factor}
              className="p-3 bg-slate-50 rounded border border-slate-200/80 flex flex-col justify-between"
            >
              <div>
                <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">
                  {f.factor}
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  {getTrendIcon(f.trend)}
                  <span className="text-sm font-bold text-slate-900">{f.state}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary explanation removed per user preference */}
    </div>
  );
};
