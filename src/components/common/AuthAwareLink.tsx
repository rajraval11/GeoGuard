/**
 * AuthAwareLink
 *
 * A drop-in Link replacement for CTAs that point to authenticated routes.
 *
 * Behaviour:
 *  - Authenticated user  → navigates directly to `to`
 *  - Unauthenticated     → navigates to /login with state.from = `to`
 *                          so LoginPage redirects back after successful login
 *
 * No colors changed. No new features. No backend changes.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';

interface AuthAwareLinkProps extends React.ComponentPropsWithoutRef<typeof Link> {
  /** The protected destination (e.g. /app/analysis/new) */
  to: string;
  children: React.ReactNode;
  className?: string;
}

export const AuthAwareLink: React.FC<AuthAwareLinkProps> = ({
  to,
  children,
  className,
  ...rest
}) => {
  const { isAuthenticated, isLoading } = useAuth();

  // While auth is still resolving, render as a plain link — ProtectedRoute
  // will handle the redirect correctly on arrival.
  if (isLoading) {
    return (
      <Link to={to} className={className} {...rest}>
        {children}
      </Link>
    );
  }

  // Already authenticated → go directly to the destination
  if (isAuthenticated) {
    return (
      <Link to={to} className={className} {...rest}>
        {children}
      </Link>
    );
  }

  // Not authenticated → go to /login, carrying the intended destination
  // so LoginPage can redirect back after a successful login.
  return (
    <Link
      to="/login"
      state={{ from: { pathname: to } }}
      className={className}
      {...rest}
    >
      {children}
    </Link>
  );
};
