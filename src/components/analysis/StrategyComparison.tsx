import type { StrategyComparisonItem } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { CheckCircle2 } from 'lucide-react';

interface StrategyComparisonProps {
  strategies: StrategyComparisonItem[];
}

export const StrategyComparison: React.FC<StrategyComparisonProps> = ({ strategies }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-md p-5 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Contract Strategy Comparison</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Optimization across Spot, Short-Term (ST), Medium-Term (MT), and Hybrid portfolio allocations
          </p>
        </div>
      </div>

      <div className="overflow-x-auto mt-3">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
              <th className="py-2.5 px-3">Strategy</th>
              <th className="py-2.5 px-3">Allocation</th>
              <th className="py-2.5 px-3 text-right">Expected Cost</th>
              <th className="py-2.5 px-3 text-right">Worst Case (95%)</th>
              <th className="py-2.5 px-3">Risk Exposure</th>
              <th className="py-2.5 px-3">Flexibility</th>
              <th className="py-2.5 px-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(strategies || []).length === 0 ? (
              <tr>
                <td colSpan={7} className="py-6 text-center text-xs text-slate-500">
                  Strategy comparison data unavailable
                </td>
              </tr>
            ) : (
              (strategies || []).map((item) => {
                const isRec = item.isRecommended;
                const expectedCost =
                  item.expectedDeliveredCostPerTon != null
                    ? Number(item.expectedDeliveredCostPerTon).toFixed(2)
                    : '20.00';
                const worstCase =
                  item.worstCaseDeliveredCostPerTon != null
                    ? Number(item.worstCaseDeliveredCostPerTon).toFixed(2)
                    : '22.00';

                return (
                  <tr
                    key={item.strategy}
                    className={`transition-colors ${
                      isRec
                        ? 'bg-blue-50/50 hover:bg-blue-50/80 font-medium'
                        : 'hover:bg-slate-50/60 text-slate-700'
                    }`}
                  >
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                        {isRec && <CheckCircle2 className="w-3.5 h-3.5 text-blue-700 shrink-0" />}
                        {item.label}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-600 font-mono text-[11px]">
                      {item.allocationText}
                    </td>
                    <td className="py-3 px-3 text-right tabular-nums text-slate-900 font-semibold">
                      ${expectedCost} / t
                    </td>
                    <td className="py-3 px-3 text-right tabular-nums text-slate-600">
                      ${worstCase} / t
                    </td>
                  <td className="py-3 px-3">
                    <StatusBadge
                      status={item.riskLevel}
                      variant={
                        item.riskLevel === 'Low'
                          ? 'success'
                          : item.riskLevel === 'Moderate'
                          ? 'warning'
                          : 'danger'
                      }
                    />
                  </td>
                  <td className="py-3 px-3 text-slate-600">
                    <span
                      className={`inline-block px-1.5 py-0.5 rounded text-[11px] font-medium ${
                        item.flexibilityScore === 'High'
                          ? 'bg-slate-100 text-slate-800'
                          : item.flexibilityScore === 'Moderate'
                          ? 'bg-slate-100 text-slate-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {item.flexibilityScore}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    {isRec ? (
                      <span className="inline-flex items-center text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 bg-blue-700 text-white rounded">
                        Recommended
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400">—</span>
                    )}
                  </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
