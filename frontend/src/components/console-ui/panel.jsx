import { Sparkline } from './charts';

export function SectionHeader({ title, action, tone = 'primary' }) {
  if (!title && !action) return null;
  const dot = { primary: 'bg-gb-primary', destructive: 'bg-gb-destructive', warning: 'bg-gb-warning' }[tone] || 'bg-gb-primary';
  return (
    <div className="mb-4 flex items-center gap-2">
      <span className={`h-3 w-[3px] rounded-full ${dot}`} />
      <span className="flex-1 text-[11.5px] font-semibold uppercase tracking-[0.08em] text-gb-foreground/80">{title}</span>
      {action}
    </div>
  );
}

export function Panel({ title, action, tone, className = '', children }) {
  return (
    <div className={`rounded-[8px] border border-gb-border bg-gb-card p-5 ${className}`}>
      <SectionHeader title={title} action={action} tone={tone} />
      {children}
    </div>
  );
}

export function DetailRow({ label, value, valueClassName = '' }) {
  return (
    <div className="flex items-center justify-between border-b border-gb-border py-2.5 last:border-b-0">
      <span className="text-[12px] text-gb-muted-foreground">{label}</span>
      <span className={`text-[13px] font-medium text-gb-foreground ${valueClassName}`}>{value}</span>
    </div>
  );
}

const TREND_TONE = {
  up: 'text-gb-success',
  down: 'text-gb-destructive',
  neutral: 'text-gb-muted-foreground',
};
const TREND_ARROW = { up: '↑', down: '↓', neutral: '→' };

export function StatTile({ icon: Icon, label, value, suffix, trend, sparklineData, valueClassName = '' }) {
  const toneClass = trend ? TREND_TONE[trend.direction] : 'text-gb-muted-foreground';
  const sparkColor = trend?.direction === 'down' ? 'var(--gb-destructive)' : 'var(--gb-primary)';
  return (
    <div className="relative overflow-hidden rounded-[8px] border border-gb-border bg-gb-card p-4">
      {Icon && (
        <div className="mb-2 flex size-8 items-center justify-center rounded-[6px] bg-gb-background-2 text-gb-muted-foreground">
          <Icon size={16} strokeWidth={2} />
        </div>
      )}
      <div className="mb-1.5 text-[12px] text-gb-muted-foreground">{label}</div>
      <div className="flex items-baseline gap-1.5">
        <span className={`gb-num text-[26px] font-semibold leading-none text-gb-foreground ${valueClassName}`}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </span>
        {suffix && <span className="text-[12px] text-gb-muted-foreground">{suffix}</span>}
      </div>
      {trend && (
        <div className={`mt-1.5 flex items-center gap-1 text-[11px] font-medium ${toneClass}`}>
          <span>{TREND_ARROW[trend.direction]}</span>
          <span>
            {trend.percentage > 0 ? '+' : ''}
            {trend.percentage}%
          </span>
        </div>
      )}
      {sparklineData && sparklineData.length > 0 && (
        <div className="pointer-events-none absolute bottom-3 right-3 opacity-40">
          <Sparkline data={sparklineData} color={sparkColor} width={72} height={28} />
        </div>
      )}
    </div>
  );
}

export const SEVERITY_TONE = {
  fatal: { dot: 'bg-gb-destructive', badge: 'destructive' },
  serious: { dot: 'bg-gb-warning', badge: 'warning' },
  minor: { dot: 'bg-gb-warning', badge: 'warning' },
};
