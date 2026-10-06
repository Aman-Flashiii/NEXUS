'use client';

import { cn, getRiskColor } from '@/lib/utils';

interface StatusBadgeProps {
  level: 'High' | 'Medium' | 'Low' | string;
  size?: 'sm' | 'md';
}

export function StatusBadge({ level, size = 'sm' }: StatusBadgeProps) {
  const colors = getRiskColor(level);
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border font-medium',
        colors.bg,
        colors.text,
        colors.border,
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', colors.dot)} />
      {level} Risk
    </span>
  );
}

interface MetricCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  trend?: 'up' | 'down' | 'flat';
  trendValue?: string;
}

export function MetricCard({
  label,
  value,
  subtext,
  trend,
  trendValue,
}: MetricCardProps) {
  return (
    <div className="rounded-lg border border-neutral-800/80 bg-neutral-900/60 p-4">
      <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-500">
        {label}
      </p>
      <div className="mt-1.5 flex items-baseline gap-2">
        <p className="text-2xl font-semibold tracking-tight text-neutral-100">
          {value}
        </p>
        {trend && trendValue && (
          <span
            className={cn(
              'text-xs font-medium',
              trend === 'up' ? 'text-emerald-400' : '',
              trend === 'down' ? 'text-rose-400' : '',
              trend === 'flat' ? 'text-neutral-500' : ''
            )}
          >
            {trend === 'up' ? '+' : trend === 'down' ? '' : ''}
            {trendValue}
          </span>
        )}
      </div>
      {subtext && (
        <p className="mt-1 text-[11px] text-neutral-600">{subtext}</p>
      )}
    </div>
  );
}

export function CardShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'rounded-lg border border-neutral-800/80 bg-neutral-900/60',
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between border-b border-neutral-800/60 px-5 py-4">
      <div>
        <h3 className="text-sm font-semibold text-neutral-100">{title}</h3>
        {subtitle && (
          <p className="mt-0.5 text-[12px] text-neutral-500">{subtitle}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center py-12 text-sm text-neutral-600">
      {message}
    </div>
  );
}

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-neutral-700 border-t-neutral-400" />
    </div>
  );
}
