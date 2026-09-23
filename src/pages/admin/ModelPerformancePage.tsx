import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../api/services';
import { LoadingSkeleton } from '../../components/common/StateViews';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';

export const ModelPerformancePage: React.FC = () => {
  const { data: modelPerf, isLoading } = useQuery({
    queryKey: ['admin-model-performance'],
    queryFn: adminApi.getModelPerformance
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Forecasting Model Performance & Backtests
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Statistical validation metrics for XGBoost, SARIMAX, and Quantile Regression ensembles
          </p>
        </div>
        <div className="text-xs text-slate-600 bg-white border border-slate-200 px-2.5 py-1 rounded">
          Model Version: <span className="font-mono font-bold text-slate-900">{modelPerf?.modelVersion}</span>
        </div>
      </div>

      {isLoading ? (
        <LoadingSkeleton rows={4} height="h-28" />
      ) : (
        <>
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-md p-4 shadow-2xs">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                Mean Absolute Error (MAE)
              </div>
              <div className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">
                ${modelPerf?.forecastMAE.toFixed(2)}{' '}
                <span className="text-xs font-normal text-slate-500">/ MT</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Average deviation across routes</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-md p-4 shadow-2xs">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                Root Mean Sq. Error (RMSE)
              </div>
              <div className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">
                ${modelPerf?.forecastRMSE.toFixed(2)}{' '}
                <span className="text-xs font-normal text-slate-500">/ MT</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Penalizes large outlier spikes</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-md p-4 shadow-2xs">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                Backtest Accuracy Score
              </div>
              <div className="text-2xl font-bold text-emerald-700 mt-1 tabular-nums">
                {modelPerf?.backtestPerformanceScore}%
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Within 80% confidence interval</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-md p-4 shadow-2xs">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                Last Retrained Date
              </div>
              <div className="text-sm font-bold text-slate-900 mt-2 font-mono">
                {modelPerf?.lastTrainedDate}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Scheduled weekly retraining</div>
            </div>
          </div>

          {/* Simple Backtest Chart */}
          <div className="bg-white border border-slate-200 rounded-md p-5 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Historical Backtest Performance: Actual vs. Predicted Spot Rate ($/MT)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Evaluation on out-of-sample Pacific Panamax fixtures
                </p>
              </div>
            </div>

            <div className="h-64 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={modelPerf?.backtestSeries} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="2 2" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} domain={['dataMin - 1', 'dataMax + 1']} tickFormatter={(v) => `$${v}`} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', fontSize: '12px', borderRadius: '4px' }}
                    formatter={(val: any) => [`$${Number(val).toFixed(2)} / MT`]}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Line type="monotone" dataKey="actual" name="Actual Market Spot ($/MT)" stroke="#0f172a" strokeWidth={2.2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="predicted" name="Predicted Baseline ($/MT)" stroke="#2563eb" strokeWidth={2} strokeDasharray="4 3" dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Clean Operational Details */}
          <div className="bg-slate-50 border border-slate-200 rounded-md p-4 text-xs text-slate-600 space-y-2">
            <div className="font-semibold text-slate-900">Explainability & Validation Governance:</div>
            <p className="leading-relaxed">
              Model residuals are evaluated through SHAP summary checks to confirm that bunker fuel costs, trade balance flows, and port congestion factors retain realistic economic signs and magnitude prior to pipeline deployment.
            </p>
          </div>
        </>
      )}
    </div>
  );
};
