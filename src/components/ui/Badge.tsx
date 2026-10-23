import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'blue' | 'gold' | 'gray' | 'navy';
  className?: string;
}

export default function Badge({ children, variant = 'gray', className }: BadgeProps) {
  const variants = {
    success: 'badge-success',
    warning: 'badge-warning',
    danger: 'badge-danger',
    blue: 'badge-blue',
    gold: 'badge-gold',
    gray: 'badge-gray',
    navy: 'badge bg-brand-navy text-white',
  };
  return <span className={cn(variants[variant], className)}>{children}</span>;
}
