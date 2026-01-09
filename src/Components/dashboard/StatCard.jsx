import { cn } from '../../lib/utils';

export function StatCard({ title, value, subtitle, icon: Icon, trend, className }) {
  return (
    <div className={cn('rounded-xl border border-border bg-card p-6 animate-fade-in', className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-black">{title}</p>
          <p className="text-3xl font-bold text-black">{value}</p>
          {subtitle && (
            <p className="text-sm text-black">{subtitle}</p>
          )}
          {trend && (
            <p
              className={cn(
                'text-sm font-medium px-2 py-1 rounded-md inline-block',
                trend.isPositive 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              )}
            >
              {trend.isPositive ? '+' : ''}{trend.value}% from last month
            </p>
          )}
        </div>
        <div className="rounded-lg bg-primary/10 p-3">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>
    </div>
  );
}