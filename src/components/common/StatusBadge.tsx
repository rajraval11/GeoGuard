import React from 'react';

interface StatusBadgeProps {
  status: string;
  variant?: 'neutral' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, variant, size = 'sm' }) => {
  // Determine variant automatically if not specified
  let badgeVariant = variant;
  const s = status.toLowerCase();

  if (!badgeVariant) {
    if (['completed', 'compatible', 'healthy', 'active', 'low risk', 'low'].includes(s)) {
      badgeVariant = 'success';
    } else if (['moderate', 'delayed', 'pending', 'restricted', 'warning'].includes(s)) {
      badgeVariant = 'warning';
    } else if (['incompatible', 'unavailable', 'suspended', 'high risk', 'high', 'failed', 'alert'].includes(s)) {
      badgeVariant = 'danger';
    } else if (['processing', 'in progress', 'hybrid'].includes(s)) {
      badgeVariant = 'info';
    } else {
      badgeVariant = 'neutral';
    }
  }

  const styles = {
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    danger: 'bg-rose-50 text-rose-800 border-rose-200',
    info: 'bg-sky-50 text-sky-800 border-sky-200'
  };

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center font-medium border rounded ${sizeClasses} ${styles[badgeVariant]}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
          badgeVariant === 'success'
            ? 'bg-emerald-600'
            : badgeVariant === 'warning'
            ? 'bg-amber-600'
            : badgeVariant === 'danger'
            ? 'bg-rose-600'
            : badgeVariant === 'info'
            ? 'bg-sky-600'
            : 'bg-slate-500'
        }`}
      />
      {status}
    </span>
  );
};
