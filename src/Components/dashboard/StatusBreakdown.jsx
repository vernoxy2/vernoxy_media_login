import { getStatusColor } from '../../lib/projectUtils';
import { cn } from '../../lib/utils';

const statuses = ['Draft', 'In Progress', 'Review', 'Approved', 'Delivered'];

export function StatusBreakdown({ projects }) {
  const getCount = (status) => 
    projects.filter(p => p.status === status).length;

  const total = projects.length;

  return (
    <div className="rounded-xl border border-border bg-card p-6 animate-fade-in">
      <h3 className="text-sm font-semibold text-foreground mb-4">Projects by Status</h3>
      <div className="space-y-4">
        {statuses.map((status) => {
          const count = getCount(status);
          const percentage = total > 0 ? (count / total) * 100 : 0;

          return (
            <div key={status} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{status}</span>
                <span className="font-medium text-foreground">{count}</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className={cn('h-full rounded-full transition-all duration-500', getStatusColor(status))}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
