import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  Ship,
  Clock,
  BarChart2,
  Anchor,
  ShieldCheck
} from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';

export const HomePage: React.FC = () => {
  return (
    <div className="space-y-20 py-6">
      {/* ─── Hero Section ─── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 text-center pt-10 pb-2">
        {/* Badge */}
        <div className="animate-fade-up inline-block px-3 py-1 mb-6 text-[11px] font-semibold uppercase tracking-widest text-slate-700 bg-slate-100 border border-slate-200 rounded">
          Maritime Freight Decision Support
        </div>

        {/* Headline */}
        <h1 className="animate-fade-up animate-delay-100 text-4xl sm:text-5xl md:text-[3.25rem] font-extrabold text-slate-900 tracking-tight leading-[1.12] max-w-3xl mx-auto">
          Charter smarter.{' '}
          <span className="text-slate-700">Before the market moves.</span>
        </h1>

        {/* Subtext */}
        <p className="animate-fade-up animate-delay-200 mt-6 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Data-driven freight forecasting, vessel optimization, voyage economics and contract strategy for bulk cargo procurement.
        </p>

        {/* CTAs */}
        <div className="animate-fade-up animate-delay-300 mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/contact"
            className="cta-primary px-5 py-2.5 text-sm font-semibold bg-slate-900 text-white rounded hover:bg-slate-800 transition-colors inline-flex items-center gap-2 shadow-sm"
          >
            Request a Demo
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/login"
            className="px-5 py-2.5 text-sm font-semibold bg-white text-slate-700 border border-slate-300 rounded hover:bg-slate-50 transition-colors"
          >
            Sign In
          </Link>
        </div>

        {/* Trust line */}
        <p className="animate-fade-up animate-delay-400 mt-5 text-[11px] text-slate-400 font-medium tracking-wide">
          Built for commercial chartering desks · Port Hedland · Paradip · Vizag · Haldia
        </p>
      </section>

      {/* ─── Product Preview ─── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 animate-section-reveal">
        <div className="text-center mb-4">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
            Decision Terminal Preview
          </div>
        </div>

        <div className="card-hover bg-white border border-slate-300 rounded-md shadow-sm overflow-hidden">
          {/* Mock Window Top Bar */}
          <div className="bg-slate-100/90 px-4 py-2 border-b border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block" />
              <span className="font-mono text-[11px] text-slate-600 ml-2">
                geoguard / analyses / AN-2026-0842
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              <span>Optimized Model Output</span>
            </div>
          </div>

          <div className="p-6">
            {/* Voyage Metadata */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <div className="text-xs text-slate-500">Route & Cargo Requirement</div>
                <div className="text-lg font-bold text-slate-900 mt-0.5 flex flex-wrap items-center gap-2">
                  <span>Indonesia (Kalimantan) → Paradip</span>
                  <span className="text-slate-300 font-normal">|</span>
                  <span className="text-sm font-semibold text-slate-700">Thermal Coal · 50,000 MT</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status="Completed" />
                <span className="text-xs text-slate-500 font-mono">12-Month Horizon</span>
              </div>
            </div>

            {/* Recommendation Summary */}
            <div className="mt-5 p-4 bg-slate-50 border border-slate-200 rounded-md">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200/70">
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                    Recommended Strategy
                  </span>
                  <div className="text-xl font-bold text-slate-900 mt-0.5">
                    60% Medium-Term / 40% Spot
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 border border-amber-300 rounded text-xs font-semibold text-amber-900">
                    <Clock className="w-3.5 h-3.5 text-amber-700" />
                    Consider booking within 15 days
                  </div>
                  <StatusBadge status="Moderate Risk" />
                </div>
              </div>

              {/* Data Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 pt-1">
                <div>
                  <div className="text-[11px] text-slate-500 uppercase tracking-wide font-medium">Forecast Range</div>
                  <div className="text-sm font-bold text-slate-900 mt-1 tabular-nums">
                    $19.8 – $23.4 / ton
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-500 uppercase tracking-wide font-medium">Recommended Vessel</div>
                  <div className="text-sm font-bold text-slate-900 mt-1 flex items-center gap-1">
                    <Ship className="w-3.5 h-3.5 text-slate-600" />
                    Panamax (74k DWT)
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-500 uppercase tracking-wide font-medium">Delivered Cost</div>
                  <div className="text-sm font-bold text-slate-900 mt-1 tabular-nums">
                    $21.15 / ton
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-500 uppercase tracking-wide font-medium">Savings vs Spot</div>
                  <div className="text-sm font-bold text-emerald-700 mt-1 tabular-nums">
                    $1.85 / ton saved
                  </div>
                </div>
              </div>
            </div>

            {/* Realistic Table Snapshot */}
            <div className="mt-5">
              <div className="text-xs font-semibold text-slate-800 mb-2">
                Contract Strategy Comparison Snapshot
              </div>
              <div className="overflow-x-auto border border-slate-200 rounded">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3">Strategy</th>
                      <th className="py-2.5 px-3">Allocation</th>
                      <th className="py-2.5 px-3 text-right">Delivered Cost</th>
                      <th className="py-2.5 px-3 text-right">Worst Case</th>
                      <th className="py-2.5 px-3">Risk Exposure</th>
                      <th className="py-2.5 px-3">Flexibility</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    <tr className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-3 font-medium text-slate-900">100% Spot Market</td>
                      <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">100% Spot</td>
                      <td className="py-2.5 px-3 text-right tabular-nums font-semibold">$23.00 / t</td>
                      <td className="py-2.5 px-3 text-right tabular-nums text-slate-500">$26.40 / t</td>
                      <td className="py-2.5 px-3"><StatusBadge status="High" /></td>
                      <td className="py-2.5 px-3 text-slate-600">High</td>
                    </tr>
                    <tr className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-3 font-medium text-slate-900">Short-Term Fixed</td>
                      <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">100% ST</td>
                      <td className="py-2.5 px-3 text-right tabular-nums font-semibold">$21.90 / t</td>
                      <td className="py-2.5 px-3 text-right tabular-nums text-slate-500">$24.10 / t</td>
                      <td className="py-2.5 px-3"><StatusBadge status="Moderate" /></td>
                      <td className="py-2.5 px-3 text-slate-600">Moderate</td>
                    </tr>
                    <tr className="bg-blue-50/50">
                      <td className="py-2.5 px-3 font-bold text-slate-900">
                        <span className="inline-flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-700" />
                          Hybrid Portfolio (Recommended)
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 font-mono text-[11px] font-medium">60% MT / 40% Spot</td>
                      <td className="py-2.5 px-3 text-right tabular-nums font-bold text-blue-900">$21.15 / t</td>
                      <td className="py-2.5 px-3 text-right tabular-nums text-slate-700">$23.40 / t</td>
                      <td className="py-2.5 px-3"><StatusBadge status="Moderate" /></td>
                      <td className="py-2.5 px-3 text-slate-700 font-medium">Moderate</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">
                Port draft verified: Kalimantan (18.0m) ✓ | Paradip Port (14.5m) ✓
              </span>
              <Link
                to="/app/analysis/AN-2026-0842"
                className="font-medium text-blue-700 hover:text-blue-900 inline-flex items-center gap-1 transition-colors"
              >
                View full decision report
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 animate-section-reveal">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-slate-900">How GeoGuard Works</h2>
          <p className="text-xs text-slate-500 mt-2 max-w-lg mx-auto leading-relaxed">
            Structured decision workflow designed for commercial chartering desks
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {[
            {
              num: '01',
              icon: Ship,
              title: 'Enter cargo requirement',
              desc: 'Specify commodity type, total tonnage, delivery schedule, and shipment batching across the planning horizon.'
            },
            {
              num: '02',
              icon: Anchor,
              title: 'Check route & vessel feasibility',
              desc: 'Verify loading and discharge draft limits, LOA, beam, canal restrictions, and port congestion in real time.'
            },
            {
              num: '03',
              icon: BarChart2,
              title: 'Forecast market & simulate scenarios',
              desc: 'Run econometric rate projections and 1,000+ Monte Carlo risk iterations to quantify price exposure and VaR.'
            },
            {
              num: '04',
              icon: ShieldCheck,
              title: 'Receive chartering recommendation',
              desc: 'Review optimized contract mix (Spot, ST, MT, Hybrid), delivered landed cost breakdown, and market entry timing.'
            }
          ].map((step) => (
            <div key={step.num} className="card-hover bg-white border border-slate-200 rounded-md p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl font-bold text-slate-300 font-mono">{step.num}</span>
                <step.icon className="w-4 h-4 text-slate-400" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1.5">{step.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Built For ─── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 animate-section-reveal">
        <div className="bg-slate-100 border border-slate-200 rounded-md p-6 sm:p-8">
          <div className="text-xs uppercase tracking-widest font-semibold text-slate-500 mb-5">
            Who uses GeoGuard
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-slate-700">
            <div>
              <div className="font-bold text-slate-900 mb-1.5 text-sm">Bulk Cargo Importers</div>
              <p className="text-slate-600 leading-relaxed">
                Power utilities, steelmakers, and cement producers importing coal, iron ore, and bauxite.
              </p>
            </div>
            <div>
              <div className="font-bold text-slate-900 mb-1.5 text-sm">Chartering Managers</div>
              <p className="text-slate-600 leading-relaxed">
                Freight desks evaluating whether to fix index-linked contracts, periodic time charters, or spot tonnage.
              </p>
            </div>
            <div>
              <div className="font-bold text-slate-900 mb-1.5 text-sm">Commodity Trading Desks</div>
              <p className="text-slate-600 leading-relaxed">
                Traders pricing CIF/CFR delivered sales requiring auditable freight cost and bunker hedge estimates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 text-center pb-10 animate-section-reveal">
        <div className="bg-white border border-slate-300 rounded-md p-10 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900">
            Ready to evaluate your upcoming freight program?
          </h2>
          <p className="text-sm text-slate-600 mt-3 max-w-md mx-auto leading-relaxed">
            GeoGuard provides clear, data-driven contract optimization without guesswork.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/contact"
              className="cta-primary px-5 py-2.5 text-sm font-semibold bg-slate-900 text-white rounded hover:bg-slate-800 transition-colors inline-flex items-center gap-2"
            >
              Request a Demo
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="px-5 py-2.5 text-sm font-semibold bg-slate-100 text-slate-700 border border-slate-300 rounded hover:bg-slate-200 transition-colors"
            >
              Sign in to terminal
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
