import React from 'react';
import { Target, Compass } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-10">
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          About GeoGuard
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
          Quantitative Freight Intelligence for Bulk Charterers
        </h1>
        <p className="text-sm text-slate-600 mt-2 max-w-2xl leading-relaxed">
          GeoGuard is a specialized decision-support platform designed to help bulk cargo importers, commodity trading desks, and industrial shippers make disciplined chartering decisions before entering the freight market.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-md p-5">
          <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-slate-700 mb-3">
            <Target className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-bold text-slate-900">The Problem We Address</h2>
          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
            Bulk freight markets are notoriously volatile. Charterers often fix vessels using retrospective data or isolated broker quotes, exposing organizations to rate spikes, unexpected port demurrage, and suboptimal contract structures (relying either 100% on spot exposure or locking in overpriced long-term COAs).
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-md p-5">
          <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-slate-700 mb-3">
            <Compass className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-bold text-slate-900">Our Methodology</h2>
          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
            GeoGuard combines physical port infrastructure data with time-series econometric forecasting and mathematical portfolio optimization. We evaluate true delivered voyage economics—including bunker consumption, canal dues, waiting queues, and repositioning risk—rather than nominal spot indices alone.
          </p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-md p-6">
        <h2 className="text-sm font-bold text-slate-900 mb-3">Operational Principles</h2>
        <div className="space-y-3 text-xs text-slate-600">
          <div className="flex items-start gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-900 mt-1.5 shrink-0" />
            <div>
              <strong className="text-slate-900 font-semibold">Decision-Support, Not Black-Box Automation:</strong> The final fixture decision remains with the commercial charterer. GeoGuard calculates trade-offs, quantifies downside risks, and provides auditable cost breakdowns so teams can justify decisions to executive committees and risk desks.
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-900 mt-1.5 shrink-0" />
            <div>
              <strong className="text-slate-900 font-semibold">Physical Feasibility First:</strong> No freight contract is viable if the vessel cannot berth or must lighter unexpectedly. Every recommendation rigorously checks draft, LOA, beam, and tidal restrictions across both origin and destination terminals.
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-900 mt-1.5 shrink-0" />
            <div>
              <strong className="text-slate-900 font-semibold">Rigorous Risk Quantification:</strong> Through 1,000+ Monte Carlo iterations, GeoGuard models Value at Risk (VaR) and worst-case scenarios, ensuring organizations understand the tail risk of open spot exposure.
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200 pt-6 text-xs text-slate-500">
        GeoGuard is engineered for enterprise deployment across industrial logistics desks, sovereign procurement entities, and commercial trading desks.
      </div>
    </div>
  );
};
