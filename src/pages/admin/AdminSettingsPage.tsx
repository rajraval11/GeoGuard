import React, { useState } from 'react';
import { CheckCircle2, Server, Database } from 'lucide-react';
import { API_BASE_URL } from '../../api/client';

export const AdminSettingsPage: React.FC = () => {
  const [saved, setSaved] = useState(false);
  const [feedCadence, setFeedCadence] = useState('hourly');
  const [retrainSchedule, setRetrainSchedule] = useState('weekly');
  const [logRetentionDays, setLogRetentionDays] = useState(90);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          System Administration Settings
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure ingestion workers, pipeline retraining cadence, and API gateway rules
        </p>
      </div>

      {saved && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>System administration parameters saved.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white border border-slate-200 rounded-md p-5 shadow-2xs">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-xs font-semibold text-slate-900">
            <Server className="w-4 h-4 text-blue-700" />
            <span>Data Pipeline Ingestion Parameters</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Port Congestion Ingestion Cadence
              </label>
              <select
                value={feedCadence}
                onChange={(e) => setFeedCadence(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded bg-white focus:outline-hidden"
              >
                <option value="hourly">Every 1 Hour (Standard)</option>
                <option value="six_hours">Every 6 Hours</option>
                <option value="twelve_hours">Every 12 Hours</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Model Retraining & Backtest Trigger
              </label>
              <select
                value={retrainSchedule}
                onChange={(e) => setRetrainSchedule(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded bg-white focus:outline-hidden"
              >
                <option value="weekly">Weekly (Sunday 02:00 UTC)</option>
                <option value="biweekly">Bi-weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-md p-5 shadow-2xs">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-xs font-semibold text-slate-900">
            <Database className="w-4 h-4 text-blue-700" />
            <span>Log Retention & Audit</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Decision Audit Log Retention (Days)
              </label>
              <input
                type="number"
                value={logRetentionDays}
                onChange={(e) => setLogRetentionDays(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded focus:outline-hidden bg-white tabular-nums"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Preserves audit trails for commercial compliance.
              </span>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Node.js Backend Connection
              </label>
              <input
                type="text"
                value={API_BASE_URL}
                readOnly
                className="w-full px-3 py-2 border border-slate-300 rounded bg-slate-50 font-mono text-[11px] text-slate-700"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-5 py-2 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-800 transition-colors shadow-2xs"
          >
            Save Admin Settings
          </button>
        </div>
      </form>
    </div>
  );
};
