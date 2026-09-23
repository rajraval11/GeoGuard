import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { Shield, Lock, Mail, AlertCircle, ShieldAlert, ArrowRight, UserCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<'user' | 'admin'>('user');

  // Dedicated inputs for user and admin login
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');

  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const email = activeTab === 'admin' ? adminEmail : userEmail;
    const password = activeTab === 'admin' ? adminPassword : userPassword;

    try {
      const authenticatedUser = await login(
        email,
        password,
        activeTab === 'admin' ? 'Admin' : undefined
      );

      // The backend response is the source of truth for authorization
      if (activeTab === 'admin') {
        if (authenticatedUser.role !== 'Admin') {
          // If the user selects Admin Login but the authenticated account is not an Admin, do not grant admin access
          await logout();
          setError('Access denied: Your authenticated account does not have Administrator privileges. Please use User Login.');
          return;
        }
        navigate('/admin');
      } else {
        // User login pathway -> access the freight decision workspace
        const from = (location.state as any)?.from?.pathname || '/app';
        navigate(from);
      }
    } catch (err: any) {
      const message =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        err?.message ||
        'Authentication failed. Please verify credentials or backend service status.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-10 h-10 rounded bg-slate-900 flex items-center justify-center text-white">
            <Shield className="w-5 h-5 text-sky-400" />
          </div>
        </div>

        {/* Dynamic header and subtext strictly matching specification */}
        <h2 className="mt-4 text-center text-xl font-bold tracking-tight text-slate-900">
          {activeTab === 'admin' ? 'Admin Sign In' : 'Sign in to GeoGuard'}
        </h2>
        <p className="mt-1 text-center text-xs text-slate-500">
          {activeTab === 'admin'
            ? 'Access GeoGuard system administration.'
            : 'Access your freight decision-support workspace.'}
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white border border-slate-200 rounded-md shadow-xs overflow-hidden">
          {/* Two clearly separated tabs: User Login | Admin Login */}
          <div className="grid grid-cols-2 border-b border-slate-200 bg-slate-50 text-xs font-semibold">
            <button
              type="button"
              id="tab-user-login"
              onClick={() => {
                setActiveTab('user');
                setError(null);
              }}
              className={`py-3 px-4 text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
                activeTab === 'user'
                  ? 'bg-white text-slate-900 border-slate-900 font-bold'
                  : 'text-slate-500 hover:text-slate-800 border-transparent'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>User Login</span>
            </button>
            <button
              type="button"
              id="tab-admin-login"
              onClick={() => {
                setActiveTab('admin');
                setError(null);
              }}
              className={`py-3 px-4 text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
                activeTab === 'admin'
                  ? 'bg-white text-slate-900 border-slate-900 font-bold'
                  : 'text-slate-500 hover:text-slate-800 border-transparent'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Admin Login</span>
            </button>
          </div>

          <div className="py-6 px-6 sm:px-8">
            {/* Target Audience Notice */}
            <div className="mb-4 p-2.5 bg-slate-50 border border-slate-200/80 rounded text-[11px] text-slate-600">
              {activeTab === 'user' ? (
                <span>
                  <strong>User Access:</strong> For Charterer, Logistics Manager, and Analyst accounts.
                </span>
              ) : (
                <span>
                  <strong>Admin Access:</strong> Restricted to authorized Administrator accounts.
                </span>
              )}
            </div>

            {error && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded flex items-center gap-2 text-xs text-rose-800">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {activeTab === 'admin' ? 'Administrator Email' : 'Institutional Email'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="email"
                    required
                    id={activeTab === 'admin' ? 'admin-email-input' : 'user-email-input'}
                    value={activeTab === 'admin' ? adminEmail : userEmail}
                    onChange={(e) =>
                      activeTab === 'admin'
                        ? setAdminEmail(e.target.value)
                        : setUserEmail(e.target.value)
                    }
                    className="w-full pl-8 pr-3 py-2 text-xs border border-slate-300 rounded focus:border-slate-800 focus:outline-hidden"
                    placeholder={activeTab === 'admin' ? 'admin@geoguard.io' : 'name@company.com'}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-[11px] font-medium text-slate-500 hover:text-slate-800"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="password"
                    required
                    id={activeTab === 'admin' ? 'admin-password-input' : 'user-password-input'}
                    value={activeTab === 'admin' ? adminPassword : userPassword}
                    onChange={(e) =>
                      activeTab === 'admin'
                        ? setAdminPassword(e.target.value)
                        : setUserPassword(e.target.value)
                    }
                    className="w-full pl-8 pr-3 py-2 text-xs border border-slate-300 rounded focus:border-slate-800 focus:outline-hidden"
                    placeholder="Enter password"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                  />
                  <span className="text-slate-600">Remember session</span>
                </label>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  id={activeTab === 'admin' ? 'admin-login-submit' : 'user-login-submit'}
                  className="w-full py-2 px-4 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5 shadow-2xs disabled:opacity-50"
                >
                  {isSubmitting ? (
                    'Verifying credentials...'
                  ) : (
                    <>
                      <span>{activeTab === 'admin' ? 'Sign in to Admin Console' : 'Sign in to GeoGuard'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Need institutional credentials?</span>
              <Link to="/register" className="font-semibold text-slate-800 hover:underline">
                Register account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
