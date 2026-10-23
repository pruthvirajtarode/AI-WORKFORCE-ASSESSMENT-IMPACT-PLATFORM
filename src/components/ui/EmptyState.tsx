import type { LucideIcon } from 'lucide-react';
import { InboxIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export default function EmptyState({ icon: Icon = InboxIcon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-14 h-14 rounded-2xl bg-brand-cream flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-brand-muted" />
      </div>
      <h3 className="text-base font-semibold text-brand-navy mb-1">{title}</h3>
      {description && <p className="text-sm text-brand-muted max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
