import { cn, getScoreColor } from '@/lib/utils';

interface ProgressBarProps {
  value: number; // 0-100
  max?: number;
  label?: string;
  showPercent?: boolean;
  colorByScore?: boolean;
  className?: string;
  barClassName?: string;
  color?: string; // Tailwind bg-* class OR hex color; overrides colorByScore
  height?: 'sm' | 'md' | 'lg';
}

export default function ProgressBar({
  value,
  max = 100,
  label,
  showPercent = false,
  colorByScore = false,
  className,
  barClassName,
  color: colorProp,
  height = 'md',
}: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const heights = { sm: 'h-1.5', md: 'h-2', lg: 'h-3' };
  const scoreColor = colorByScore ? getScoreColor(pct) : undefined;
  // colorProp takes precedence: if bg-* class use as className, else inline style
  const isTailwindClass = colorProp?.startsWith('bg-');
  const fillClass = isTailwindClass ? cn('progress-fill', colorProp, barClassName) : cn('progress-fill', barClassName);
  const fillStyle = { width: `${pct}%`, ...(!isTailwindClass && colorProp ? { backgroundColor: colorProp } : !isTailwindClass && scoreColor ? { backgroundColor: scoreColor } : !isTailwindClass && !barClassName ? { backgroundColor: '#3B6EA5' } : {}) };

  return (
    <div className={className}>
      {(label || showPercent) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-xs text-brand-muted">{label}</span>}
          {showPercent && <span className="text-xs font-semibold text-brand-navy">{pct.toFixed(0)}%</span>}
        </div>
      )}
      <div className={cn('progress-bar', heights[height])}>
        <div className={fillClass} style={fillStyle} />
      </div>
    </div>
  );
}
