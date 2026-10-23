import { cn, getAIReadinessLevel, AI_READINESS_CONFIG } from '@/lib/utils';
import type { AIReadinessLevel } from '@/types';

interface ScoreBadgeProps {
  percentage: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function ScoreBadge({ percentage, label, size = 'md', className }: ScoreBadgeProps) {
  const level: AIReadinessLevel = getAIReadinessLevel(percentage);
  const config = AI_READINESS_CONFIG[level];

  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };

  return (
    <span className={cn('badge rounded-lg font-semibold', config.color, config.bgColor, sizes[size], className)}>
      {label ?? config.label}
    </span>
  );
}
