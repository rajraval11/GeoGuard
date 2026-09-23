import { AlertTriangle, RefreshCw, Inbox } from 'lucide-react';

interface LoadingSkeletonProps {
  rows?: number;
  height?: string;
  className?: string;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ rows = 3, height = 'h-6', className = '' }) => {
  return (
    <div className={`space-y-3 animate-pulse ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className={`bg-slate-200/75 rounded ${height} w-full`}
          style={{ opacity: 1 - i * 0.15 }}
        />
      ))}
    </div>
  );
};

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  icon
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-white border border-slate-200 rounded-md my-4">
      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 mb-3">
        {icon || <Inbox className="w-5 h-5" />}
      </div>
      <h3 className="text-sm font-semibold text-slate-900 mb-1">{title}</h3>
      <p className="text-xs text-slate-500 max-w-sm mb-4 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-300 px-3 py-1.5 rounded transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

interface UnavailableStateProps {
  title?: string;
  message?: string;
  endpoint?: string;
  onRetry?: () => void;
}

export const UnavailableState: React.FC<UnavailableStateProps> = ({
  title = 'Service Unavailable',
  message = 'The requested data stream or backend calculation service is currently unreachable.',
  endpoint,
  onRetry
}) => {
  return (
    <div className="p-6 bg-slate-50 border border-slate-300 rounded-md my-3 text-slate-700">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-amber-100/80 text-amber-800 rounded">
          <AlertTriangle className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-slate-900">{title}</h4>
          <p className="text-xs text-slate-600 mt-1">{message}</p>
          {endpoint && (
            <div className="mt-2 text-[11px] font-mono bg-slate-200/80 px-2 py-1 rounded inline-block text-slate-700">
              Target endpoint: {endpoint}
            </div>
          )}
          {onRetry && (
            <div className="mt-3">
              <button
                onClick={onRetry}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-800 bg-white border border-slate-300 hover:bg-slate-50 px-2.5 py-1 rounded transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                Retry Connection
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
