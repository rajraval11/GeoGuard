import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export const HowItWorksPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-12">
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Decision Architecture
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
          How GeoGuard Generates Decisions
        </h1>
        <p className="text-sm text-slate-600 mt-2 max-w-2xl leading-relaxed">
          GeoGuard connects physical route constraints with econometric freight forecasting and portfolio optimization, translating complex market data into an executable chartering recommendation.
        </p>
      </div>

      <div className="space-y-8">
        {/* Step 1 */}
        <div className="bg-white border border-slate-200 rounded-md p-6">
          <div className="flex items-start gap-4">
            <div className="w-9 h-9 rounded bg-slate-100 flex items-center justify-center font-mono font-bold text-slate-800 text-sm shrink-0">
              01
            </div>
            <div className="flex-1">
              <h2 className="text-base font-bold text-slate-900">Cargo & Shipment Scheduling</h2>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                The user defines the physical cargo parameters: commodity specification (e.g. thermal coal, iron ore, bauxite), total quantity in metric tons, parcel size, shipment distribution across the calendar, and laycan tolerance.
              </p>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-700 bg-slate-50 p-3 rounded border border-slate-100">
                <div>• Total voyage tonnage</div>
                <div>• Laycan flexibility window</div>
                <div>• Discharge rate & demurrage rate</div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 2 */}
        <div className="bg-white border border-slate-200 rounded-md p-6">
          <div className="flex items-start gap-4">
            <div className="w-9 h-9 rounded bg-slate-100 flex items-center justify-center font-mono font-bold text-slate-800 text-sm shrink-0">
              02
            </div>
            <div className="flex-1">
              <h2 className="text-base font-bold text-slate-900">Two-Sided Route & Port Feasibility</h2>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                The engine evaluates vessel classes (Handysize up to Capesize) against physical constraints at both load and discharge terminals: maximum arrival/departure draft, LOA, beam, air draft, tidal windows, and current anchorage congestion.
              </p>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-700 bg-slate-50 p-3 rounded border border-slate-100">
                <div>• Draft & LOA verification</div>
                <div>• Canal transit feasibility (Suez/Panama)</div>
                <div>• Turnaround & berth queue estimation</div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 3 */}
        <div className="bg-white border border-slate-200 rounded-md p-6">
          <div className="flex items-start gap-4">
            <div className="w-9 h-9 rounded bg-slate-100 flex items-center justify-center font-mono font-bold text-slate-800 text-sm shrink-0">
              03
            </div>
            <div className="flex-1">
              <h2 className="text-base font-bold text-slate-900">Econometric Rate Forecasting & Monte Carlo Simulation</h2>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Rates are projected across 4-week and 8-week horizons using XGBoost and SARIMAX, with Quantile Regression establishing 80% confidence uncertainty intervals. The engine runs 1,000+ Monte Carlo simulation runs to evaluate price variance, fuel price shocks, and weather delays.
              </p>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-700 bg-slate-50 p-3 rounded border border-slate-100">
                <div>• Baltic index & FFA trajectory</div>
                <div>• Value at Risk (95% VaR / CVaR)</div>
                <div>• Bunker consumption modeling</div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 4 */}
        <div className="bg-white border border-slate-200 rounded-md p-6">
          <div className="flex items-start gap-4">
            <div className="w-9 h-9 rounded bg-slate-100 flex items-center justify-center font-mono font-bold text-slate-800 text-sm shrink-0">
              04
            </div>
            <div className="flex-1">
              <h2 className="text-base font-bold text-slate-900">Contract Portfolio Optimization & Timing</h2>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Linear and Mixed-Integer Programming models solve for the optimal contract blend: Spot market fixtures, Short-Term time charters, Medium-Term COAs, or Hybrid allocations. The output includes auditable landed cost, expected savings, and recommended booking timing.
              </p>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-700 bg-slate-50 p-3 rounded border border-slate-100">
                <div>• Expected delivered $/ton</div>
                <div>• Savings vs 100% Spot baseline</div>
                <div>• Plain-English commercial rationale</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-300 rounded-md p-6 text-center">
        <h3 className="text-sm font-bold text-slate-900">Explore the Decision Support Workflow</h3>
        <p className="text-xs text-slate-600 mt-1 max-w-lg mx-auto">
          Sign in to the commercial platform to run a complete analysis on your active shipping lanes.
        </p>
        <div className="mt-4 flex items-center justify-center gap-3">
          <Link
            to="/app/analysis/new"
            className="px-4 py-2 text-xs font-semibold bg-slate-900 text-white rounded hover:bg-slate-800 transition-colors inline-flex items-center gap-1.5"
          >
            Start New Analysis
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            to="/app/analysis/AN-2026-0842"
            className="px-4 py-2 text-xs font-semibold bg-white border border-slate-300 text-slate-700 rounded hover:bg-slate-50 transition-colors"
          >
            Inspect Benchmark Report
          </Link>
        </div>
      </div>
    </div>
  );
};
