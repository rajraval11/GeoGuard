import React from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import {
  Activity,
  Cpu,
  BarChart3,
  Users,
  Settings,
  ArrowLeft,
  Server
} from 'lucide-react';
import { useAuth } from '../../context/useAuth';

export const AdminLayout: React.FC = () => {
  const { user } = useAuth();

  const adminNav = [
    { label: 'Overview', path: '/admin', icon: Activity, end: true },
    { label: 'Data Health', path: '/admin/data-health', icon: Server },
    { label: 'Model Performance', path: '/admin/model-performance', icon: Cpu },
    { label: 'Usage & Quotas', path: '/admin/usage', icon: BarChart3 },
    { label: 'User Management', path: '/admin/users', icon: Users },
    { label: 'System Settings', path: '/admin/settings', icon: Settings }
  ];

  return (
    <div className="min-h-screen flex bg-slate-100 text-slate-900">
      {/* Admin Sidebar */}
      <aside className="w-60 bg-slate-900 text-slate-300 flex flex-col shrink-0">
        <div className="h-14 px-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xs">
              G
            </div>
            <div>
              <div className="text-xs font-bold text-white tracking-wide">GeoGuard</div>
              <div className="text-[10px] text-sky-400 uppercase tracking-widest font-mono">
                Admin Console
              </div>
            </div>
          </div>
          <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded uppercase font-mono">
            v2.4
          </span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {adminNav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2 rounded text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-800 text-white font-semibold'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}

          <div className="pt-6 mt-6 border-t border-slate-800">
            <Link
              to="/app"
              className="flex items-center gap-2 px-3 py-2 rounded text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Freight App</span>
            </Link>
          </div>
        </nav>

        {/* Current Admin user info */}
        <div className="p-3 border-t border-slate-800 text-xs">
          <div className="text-slate-200 font-medium truncate">{user?.name || 'Administrator'}</div>
          <div className="text-[10px] text-slate-500 truncate">{user?.email || 'admin@geoguard.io'}</div>
        </div>
      </aside>

      {/* Admin Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
          <div className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <span>System Administration</span>
            <span className="text-slate-300">|</span>
            <span className="text-xs font-normal text-slate-500">
              Pipeline Health & Operational Telemetry
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              API Online (Port 5000 / Production)
            </span>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
