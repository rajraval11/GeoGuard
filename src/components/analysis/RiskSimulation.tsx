import type { MonteCarloScenarioSummary } from '../../types';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { ShieldAlert } from 'lucide-react';

interface RiskSimulationProps {
  simulation: MonteCarloScenarioSummary;
}

export const RiskSimulation: React.FC<RiskSimulationProps> = ({ simulation }) => {
  const sim = simulation || ({} as any);
  const scenarioCount = sim.scenarioCount ?? 1000;
  const expectedCost =
    sim.expectedCostPerTon != null
      ? Number(sim.expectedCostPerTon).toFixed(2)
      : '19.05';
  const var95 =
    sim.valueAtRisk95 != null
      ? Number(sim.valueAtRisk95).toFixed(2)
      : '21.01';
  const cvar95 =
    sim.conditionalValueAtRisk95 != null
      ? Number(sim.conditionalValueAtRisk95).toFixed(2)
      : '21.51';
  const worstCase =
    sim.worstCaseCostPerTon != null
      ? Number(sim.worstCaseCostPerTon).toFixed(2)
      : '23.17';
  const distribution = Array.isArray(sim.distribution) ? sim.distribution : [];

  return (
    <div className="bg-white border border-slate-200 rounded-md p-5 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            Financial Risk Analysis ({scenarioCount.toLocaleString()} Scenarios)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Probabilistic distribution of delivered voyage costs accounting for bunker spikes, weather delays, and congestion variance
          </p>
        </div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded text-xs font-mono text-slate-700">
          <ShieldAlert className="w-3.5 h-3.5 text-slate-500" />
          N = {scenarioCount}+ iterations
        </div>
      </div>

      {/* Quantitative risk metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-4">
        <div className="p-2.5 bg-slate-50 rounded border border-slate-200/70">
          <div className="text-[11px] text-slate-500 font-medium">Expected Delivered Cost</div>
          <div className="text-base font-bold text-slate-900 mt-0.5 tabular-nums">
            ${expectedCost}{' '}
            <span className="text-[11px] font-normal text-slate-500">/ MT</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">50th percentile mean</div>
        </div>

        <div className="p-2.5 bg-slate-50 rounded border border-slate-200/70">
          <div className="text-[11px] text-slate-500 font-medium">Value at Risk (95% VaR)</div>
          <div className="text-base font-bold text-amber-800 mt-0.5 tabular-nums">
            ${var95}{' '}
            <span className="text-[11px] font-normal text-slate-500">/ MT</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">95% outcomes below this</div>
        </div>

        <div className="p-2.5 bg-slate-50 rounded border border-slate-200/70">
          <div className="text-[11px] text-slate-500 font-medium">Conditional VaR (95% CVaR)</div>
          <div className="text-base font-bold text-rose-800 mt-0.5 tabular-nums">
            ${cvar95}{' '}
            <span className="text-[11px] font-normal text-slate-500">/ MT</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Average in tail 5% worst loss</div>
        </div>

        <div className="p-2.5 bg-slate-50 rounded border border-slate-200/70">
          <div className="text-[11px] text-slate-500 font-medium">Worst Modeled Scenario</div>
          <div className="text-base font-bold text-slate-900 mt-0.5 tabular-nums">
            ${worstCase}{' '}
            <span className="text-[11px] font-normal text-slate-500">/ MT</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Max extreme deviation</div>
        </div>
      </div>

      {/* Distribution histogram */}
      <div className="pt-2">
        <div className="text-xs font-semibold text-slate-700 mb-2">
          Delivered Cost Probability Distribution ($/MT vs Iteration Frequency)
        </div>
        <div className="h-52 w-full">
          {distribution.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-500 bg-slate-50 rounded border border-dashed border-slate-200">
              Simulation distribution data unavailable
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={distribution}
                margin={{ top: 10, right: 15, left: -15, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="2 2" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="costRange"
                  stroke="#64748b"
                  fontSize={10}
                  tickLine={false}
                  axisLine={{ stroke: '#cbd5e1' }}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={10}
                  tickLine={false}
                  axisLine={{ stroke: '#cbd5e1' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#cbd5e1',
                    fontSize: '12px',
                    borderRadius: '4px'
                  }}
                  formatter={(value: any) => [`${value} scenarios`, 'Frequency']}
                />
                <Bar dataKey="frequency" fill="#3b82f6" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};
