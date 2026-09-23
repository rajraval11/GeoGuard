import React, { useState } from 'react';
import { useAuth } from '../../context/useAuth';
import { Building2, User, Sliders, CheckCircle2 } from 'lucide-react';
import { API_BASE_URL } from '../../api/client';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  const [riskDefault, setRiskDefault] = useState('Moderate');
  const [currency, setCurrency] = useState('USD');
  const [bunkerBenchmark, setBunkerBenchmark] = useState('Singapore VLSFO 0.5%');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Organization & Modeling Preferences
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage entity credentials, default chartering risk postures, and operational parameters
        </p>
      </div>

      {saved && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Operational settings updated successfully.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* User Profile */}
        <div className="bg-white border border-slate-200 rounded-md p-5 shadow-2xs">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-xs font-semibold text-slate-900">
            <User className="w-4 h-4 text-blue-700" />
            <span>Chartering User Profile</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 text-xs">
            <div>
              <label className="block text-slate-600 mb-1 font-medium">Full Name</label>
              <input
                type="text"
                defaultValue={user?.name || 'Marcus Vance'}
                className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-hidden bg-slate-50 text-slate-800"
                readOnly
              />
            </div>
            <div>
              <label className="block text-slate-600 mb-1 font-medium">Work Email</label>
              <input
                type="email"
                defaultValue={user?.email || 'm.vance@pacificbulk.com'}
                className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-hidden bg-slate-50 text-slate-800"
                readOnly
              />
            </div>
          </div>
        </div>

        {/* Organization Details */}
        <div className="bg-white border border-slate-200 rounded-md p-5 shadow-2xs">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-xs font-semibold text-slate-900">
            <Building2 className="w-4 h-4 text-blue-700" />
            <span>Institutional Entity</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 text-xs">
            <div>
              <label className="block text-slate-600 mb-1 font-medium">Entity Name</label>
              <input
                type="text"
                defaultValue={user?.organizationName || 'Pacific Bulk Carriers Ltd.'}
                className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-hidden bg-slate-50 text-slate-800"
                readOnly
              />
            </div>
            <div>
              <label className="block text-slate-600 mb-1 font-medium">Account Tier</label>
              <div className="px-3 py-2 border border-slate-200 rounded bg-slate-50 text-slate-700 font-medium">
                Commercial Enterprise (Multi-Desk)
              </div>
            </div>
          </div>
        </div>

        {/* Risk & Modeling Parameters */}
        <div className="bg-white border border-slate-200 rounded-md p-5 shadow-2xs">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-xs font-semibold text-slate-900">
            <Sliders className="w-4 h-4 text-blue-700" />
            <span>Decision Optimization Parameters</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Default Risk Tolerance
              </label>
              <select
                value={riskDefault}
                onChange={(e) => setRiskDefault(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded bg-white focus:outline-hidden"
              >
                <option value="Conservative">Conservative (Period Focused)</option>
                <option value="Moderate">Moderate (Hybrid Default)</option>
                <option value="Aggressive">Aggressive (Spot Exposure)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Default Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded bg-white focus:outline-hidden"
              >
                <option value="USD">USD ($) — Standard Maritime Freight</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Bunker Baseline Price Index
              </label>
              <select
                value={bunkerBenchmark}
                onChange={(e) => setBunkerBenchmark(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded bg-white focus:outline-hidden"
              >
                <option value="Singapore VLSFO 0.5%">Singapore VLSFO 0.5%</option>
                <option value="Fujairah VLSFO 0.5%">Fujairah VLSFO 0.5%</option>
                <option value="Rotterdam VLSFO 0.5%">Rotterdam VLSFO 0.5%</option>
              </select>
            </div>
          </div>
        </div>

        {/* System Backend Endpoint */}
        <div className="bg-white border border-slate-200 rounded-md p-5 shadow-2xs">
          <div className="text-xs font-semibold text-slate-900 mb-2">Backend Connection Status</div>
          <div className="flex items-center justify-between text-xs bg-slate-50 p-3 rounded border border-slate-200">
            <div>
              <span className="text-slate-500">Configured API Base URL: </span>
              <span className="font-mono text-slate-900 font-semibold">{API_BASE_URL}</span>
            </div>
            <span className="text-emerald-700 font-medium text-[11px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Active Connection
            </span>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-5 py-2 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-800 transition-colors shadow-2xs"
          >
            Save Preferences
          </button>
        </div>
      </form>
    </div>
  );
};
