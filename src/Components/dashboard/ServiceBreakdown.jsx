import { SERVICE_NAMES } from '../../types/project';
import { FileText, Palette, Globe, Code } from 'lucide-react';

const serviceConfig = {
  CW: { icon: FileText, colorClass: 'service-content' },
  GD: { icon: Palette, colorClass: 'service-graphic' },
  WD: { icon: Globe, colorClass: 'service-website' },
  ERP: { icon: Code, colorClass: 'service-erp' },
};

export function ServiceBreakdown({ projects }) {
  const services = ['CW', 'GD', 'WD', 'ERP'];

  return (
    <div className="rounded-xl border border-border bg-card p-6 animate-fade-in">
      <h3 className="text-sm font-semibold text-foreground mb-4">Projects by Service</h3>
      <div className="grid grid-cols-2 gap-4">
        {services.map((service) => {
          const config = serviceConfig[service];
          const Icon = config.icon;
          const count = projects.filter(p => p.serviceType === service).length;

          return (
            <div
              key={service}
              className="flex items-center gap-3 rounded-lg  border border-border p-4 transition-colors hover:bg-muted/50"
            >
              <div className={`service-badge ${config.colorClass}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-2xl font-bold text-black">{count}</p>
                <p className="text-xs text-black">{SERVICE_NAMES[service]}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
