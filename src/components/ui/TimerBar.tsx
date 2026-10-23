import { useEffect, useState, useCallback } from 'react';
import { AlertCircle } from 'lucide-react';
import { cn, formatDuration } from '@/lib/utils';

interface TimerBarProps {
  expiresAt: string; // ISO string
  onExpire?: () => void;
  className?: string;
}

export default function TimerBar({ expiresAt, onExpire, className }: TimerBarProps) {
  const getRemaining = useCallback(() => {
    return Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
  }, [expiresAt]);

  const [remaining, setRemaining] = useState(getRemaining);
  const totalSeconds = Math.floor((new Date(expiresAt).getTime() - new Date(expiresAt).getTime() + getRemaining() * 1000) / 1000);
  const [total] = useState(() => getRemaining());

  useEffect(() => {
    if (remaining <= 0) {
      onExpire?.();
      return;
    }
    const id = setInterval(() => {
      const r = getRemaining();
      setRemaining(r);
      if (r <= 0) {
        clearInterval(id);
        onExpire?.();
      }
    }, 1000);
    return () => clearInterval(id);
  }, [getRemaining, onExpire, remaining]);

  const pct = total > 0 ? (remaining / total) * 100 : 0;
  const isWarning = pct < 25;
  const isDanger = pct < 10;

  return (
    <div className={cn('flex items-center gap-3', className)}>
      {isDanger && <AlertCircle className="w-4 h-4 text-danger-600 animate-pulse shrink-0" />}
      <div className="flex-1">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-brand-muted">Time Remaining</span>
          <span className={cn('text-sm font-bold font-mono', isDanger ? 'text-danger-600' : isWarning ? 'text-warning-600' : 'text-brand-navy')}>
            {formatDuration(remaining)}
          </span>
        </div>
        <div className="h-1.5 bg-brand-cream-dark rounded-full overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all duration-1000',
              isDanger ? 'bg-danger-500' : isWarning ? 'bg-warning-500' : 'bg-brand-blue'
            )}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
