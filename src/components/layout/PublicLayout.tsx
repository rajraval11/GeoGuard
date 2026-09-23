import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Shield, Menu } from 'lucide-react';

export const PublicLayout: React.FC = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Overview', path: '/' },
    { label: 'How it works', path: '/how-it-works' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Public Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xs border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-8">
            {/* Brand */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0">
              <div className="w-7 h-7 rounded bg-slate-900 flex items-center justify-center text-white">
                <Shield className="w-4 h-4 text-sky-400" />
              </div>
              <div>
                <span className="font-bold text-base tracking-tight text-slate-900 leading-none block">
                  GeoGuard
                </span>
              </div>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center space-x-6 text-xs font-medium text-slate-600">
              {navLinks.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`transition-colors py-1 border-b-2 ${isActive
                      ? 'text-slate-950 font-semibold border-slate-900'
                      : 'border-transparent hover:text-slate-900 hover:border-slate-300'
                      }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="hidden sm:inline-flex text-xs font-medium text-slate-700 hover:text-slate-950 px-3 py-1.5 transition-colors"
            >
              Sign in
            </Link>
            <Link
              to="/contact"
              className="cta-primary text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 px-3.5 py-2 rounded transition-colors"
            >
              Request a Demo
            </Link>
            {/* Mobile menu toggle */}
            <button
              className="md:hidden ml-1 p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-200 px-4 py-3 space-y-1 animate-fade-up">
            {navLinks.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block py-2 px-3 rounded text-sm font-medium transition-colors ${isActive
                    ? 'text-slate-900 bg-slate-100 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <div className="pt-2 border-t border-slate-100">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 px-3 text-sm font-medium text-slate-600 hover:text-slate-900 rounded transition-colors"
              >
                Sign in
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Concise Public Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-slate-800 flex items-center justify-center text-white text-[10px]">
                <Shield className="w-3 h-3 text-sky-400" />
              </div>
              <span className="font-semibold text-slate-800">GeoGuard</span>
              <span className="text-slate-400">—</span>
              <span>Commercial Maritime Freight Decision Support</span>
            </div>

            <div className="flex items-center gap-6 text-slate-500">
              <Link to="/how-it-works" className="hover:text-slate-800 transition-colors">
                Methodology
              </Link>
              <Link to="/about" className="hover:text-slate-800 transition-colors">
                About
              </Link>
              <Link to="/contact" className="hover:text-slate-800 transition-colors">
                Institutional Inquiries
              </Link>
              <Link to="/login" className="hover:text-slate-800 transition-colors">
                Terminal Login
              </Link>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center text-[11px] text-slate-400">
            © {new Date().getFullYear()} GeoGuard Systems Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};
