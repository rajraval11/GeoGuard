import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'Admin' | 'User';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole = 'User'
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-xs text-slate-500 animate-pulse font-medium">
          Verifying session credentials...
        </div>
      </div>
    );
  }

  // Not authenticated -> redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Admin route requested but user is not Admin -> access denied
  if (requiredRole === 'Admin' && user.role !== 'Admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
        <div className="bg-white border border-slate-300 rounded-md p-6 max-w-md w-full shadow-xs text-center">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto mb-3">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-slate-900">Administrator Access Restricted</h2>
          <p className="text-xs text-slate-600 mt-2 leading-relaxed">
            Your current account (<span className="font-semibold">{user.email}</span> with role <span className="font-semibold">{user.role}</span>) does not possess system administration privileges.
          </p>
          <div className="mt-5 flex items-center justify-center gap-3">
            <Link
              to="/app"
              className="px-4 py-2 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-800 transition-colors inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Freight Operations</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
