import React, { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import {
  LayoutDashboard,
  PlusCircle,
  FileText,
  Anchor,
  Settings,
  LogOut,
  Shield,
  Bell,
  ChevronRight,
  Menu,
  X,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';

export const AppLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem('geoguard_sidebar_collapsed') === 'true';
  });

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const newState = !prev;
      localStorage.setItem('geoguard_sidebar_collapsed', String(newState));
      return newState;
    });
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Overview', path: '/app', icon: LayoutDashboard, end: true },
    { label: 'New Analysis', path: '/app/analysis/new', icon: PlusCircle },
    { label: 'Analyses', path: '/app/analyses', icon: FileText },
    { label: 'Routes & Ports', path: '/app/routes', icon: Anchor },
    { label: 'Settings', path: '/app/settings', icon: Settings }
  ];

  // Dynamic breadcrumb
  const getPageMeta = () => {
    const p = location.pathname;
    if (p === '/app') return { title: 'Operational Overview', breadcrumb: 'Overview' };
    if (p === '/app/analysis/new') return { title: 'New Chartering Analysis', breadcrumb: 'Analyses › New' };
    if (p.startsWith('/app/analysis/')) return { title: 'Decision Report', breadcrumb: 'Analyses › Report' };
    if (p === '/app/analyses') return { title: 'Past Analyses & History', breadcrumb: 'Analyses' };
    if (p === '/app/routes') return { title: 'Routes & Port Constraints', breadcrumb: 'Database › Routes' };
    if (p === '/app/settings') return { title: 'Organization Settings', breadcrumb: 'Settings' };
    return { title: 'GeoGuard Terminal', breadcrumb: 'Terminal' };
  };

  const { title, breadcrumb } = getPageMeta();

  const SidebarContent = ({ collapsed }: { collapsed: boolean }) => (
    <>
      {/* Brand */}
      <div className={`h-14 px-4 flex items-center ${collapsed ? 'justify-center' : 'gap-2.5'} border-b border-slate-200 shrink-0`}>
        <div className="w-6 h-6 rounded bg-slate-900 flex items-center justify-center text-white shrink-0">
          <Shield className="w-3.5 h-3.5 text-sky-400" />
        </div>
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <span className="font-bold text-sm tracking-tight text-slate-900 truncate block leading-none">GeoGuard</span>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">
              Terminal
            </span>
          </div>
        )}
        {!collapsed && (
          <button
            onClick={handleToggleSidebar}
            title="Collapse sidebar"
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors ml-auto"
          >
            <ChevronsLeft className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Navigation list */}
      <nav className="flex-1 px-2 py-4 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              title={collapsed ? item.label : undefined}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `sidebar-nav-item flex items-center gap-2.5 px-2.5 py-2.5 rounded text-xs font-medium ${
                  collapsed ? 'justify-center' : ''
                } ${
                  isActive
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Expand button when collapsed */}
      {collapsed && (
        <div className="px-2 pb-2">
          <button
            onClick={handleToggleSidebar}
            title="Expand sidebar"
            className="w-full flex justify-center p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
          >
            <ChevronsRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Bottom user profile */}
      <div className={`p-3 border-t border-slate-200 bg-slate-50/60 ${collapsed ? 'flex justify-center' : ''}`}>
        {collapsed ? (
          <button
            onClick={handleLogout}
            title="Sign out"
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        ) : (
          <>
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-slate-900 truncate leading-tight">
                  {user?.name || 'Chartering Desk'}
                </div>
                <div className="text-[11px] text-slate-500 truncate mt-0.5">
                  {user?.organizationName || 'Pacific Bulk Carriers'}
                </div>
              </div>
              <button
                onClick={handleLogout}
                title="Sign out"
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded transition-colors shrink-0"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-200 text-slate-500">
              <span>Access Role:</span>
              <span className="font-semibold text-slate-800 bg-slate-200/70 px-1.5 py-0.5 rounded text-[10px]">
                {user?.role || 'Charterer'}
              </span>
            </div>
          </>
        )}
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900">
      {/* ── Mobile sidebar overlay ── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden animate-fade-in"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Mobile sidebar drawer ── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-56 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out lg:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="absolute top-3 right-3">
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <SidebarContent collapsed={false} />
      </aside>

      {/* ── Desktop persistent sidebar ── */}
      <aside
        className={`hidden lg:flex ${isSidebarCollapsed ? 'w-14' : 'w-56'} bg-white border-r border-slate-200 flex-col shrink-0 transition-all duration-250 ease-in-out`}
      >
        <SidebarContent collapsed={isSidebarCollapsed} />
      </aside>

      {/* ── Content area ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Application Header */}
        <header className="h-14 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
              title="Open menu"
            >
              <Menu className="w-4 h-4" />
            </button>

            {/* Desktop sidebar toggle */}
            <button
              onClick={handleToggleSidebar}
              className="hidden lg:flex p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
              title="Toggle Sidebar"
            >
              <Menu className="w-4 h-4" />
            </button>

            <div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                <span>GeoGuard</span>
                <ChevronRight className="w-3 h-3 text-slate-300" />
                <span className="text-slate-600">{breadcrumb}</span>
              </div>
              <h1 className="text-sm font-bold text-slate-900 leading-none mt-0.5">
                {title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded relative transition-colors"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-amber-500 rounded-full" />
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded shadow-md p-3 z-50 text-xs animate-fade-up">
                  <div className="font-semibold text-slate-900 pb-2 border-b border-slate-100 flex items-center justify-between">
                    <span>Market Notices</span>
                    <span className="text-[10px] text-slate-400">2 active</span>
                  </div>
                  <div className="space-y-2.5 mt-2">
                    <div className="p-2 bg-amber-50/70 border border-amber-200 rounded text-slate-700">
                      <div className="font-semibold text-amber-900 text-[11px]">Paradip Port Queue</div>
                      <div className="text-[10px] text-slate-600 mt-0.5">Discharge congestion elevated to 36 hours.</div>
                    </div>
                    <div className="p-2 bg-slate-50 border border-slate-200 rounded text-slate-700">
                      <div className="font-semibold text-slate-900 text-[11px]">BPI Panamax Index</div>
                      <div className="text-[10px] text-slate-600 mt-0.5">Up +4.2% over 7 days.</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* User info */}
            <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
              <div className="w-7 h-7 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-semibold uppercase shrink-0">
                {user?.name ? user.name.slice(0, 2) : 'MV'}
              </div>
              <div className="hidden sm:block text-right">
                <div className="text-xs font-semibold text-slate-900 leading-tight">
                  {user?.name || 'Marcus Vance'}
                </div>
                <div className="text-[10px] text-slate-500">
                  {user?.organizationName || 'Pacific Bulk Carriers'}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page View */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
