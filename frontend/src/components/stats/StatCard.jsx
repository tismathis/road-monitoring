import { Card } from '../ui/Card';
import { tokens } from '../../styles/tokens';
import { useTranslation } from '../../i18n/LanguageContext';

/**
 * Sparkline component for mini charts
 */
function Sparkline({ data, color, height = 40, width = 100 }) {
  if (!data || data.length === 0) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} style={{ position: 'absolute', bottom: 8, right: 8, opacity: 0.4 }}>
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * StatCard component - displays a large metric with trend and sparkline
 * Apple-style dark mode with frosted glass
 * @param {Object} props
 * @param {number|string} props.value - Main value to display
 * @param {string} props.label - Label for the metric
 * @param {Object} props.trend - Trend object { direction: 'up'|'down'|'neutral', percentage: number }
 * @param {Array<number>} props.sparklineData - Array of values for sparkline chart
 * @param {React.Component} props.icon - Optional lucide-react icon component
 * @param {string} props.suffix - Optional suffix (e.g., 'km/h')
 */
export function StatCard({ value, label, trend, sparklineData, icon: Icon, suffix }) {
  const { locale } = useTranslation();
  const getTrendColor = () => {
    if (!trend) return tokens.colors.text.tertiary;
    if (trend.direction === 'up') return tokens.colors.primary[500];
    if (trend.direction === 'down') return tokens.colors.severity.fatal;
    return tokens.colors.text.tertiary;
  };

  const getTrendIcon = () => {
    if (!trend) return '→';
    if (trend.direction === 'up') return '↑';
    if (trend.direction === 'down') return '↓';
    return '→';
  };

  const containerStyles = {
    position: 'relative',
    minHeight: '160px',
    overflow: 'hidden',
  };

  const iconStyles = {
    color: tokens.colors.text.tertiary,
    marginBottom: tokens.spacing.sm,
  };

  const labelStyles = {
    fontSize: tokens.typography.fontSize.sm,
    color: tokens.colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    fontWeight: tokens.typography.fontWeight.medium,
    marginBottom: tokens.spacing.sm,
  };

  const valueContainerStyles = {
    display: 'flex',
    alignItems: 'baseline',
    gap: tokens.spacing.sm,
    marginBottom: tokens.spacing.md,
  };

  const valueStyles = {
    fontSize: tokens.typography.fontSize['4xl'],
    fontWeight: tokens.typography.fontWeight.bold,
    color: tokens.colors.text.primary,
    lineHeight: 1,
  };

  const suffixStyles = {
    fontSize: tokens.typography.fontSize.lg,
    color: tokens.colors.text.secondary,
    fontWeight: tokens.typography.fontWeight.normal,
  };

  const trendStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: tokens.typography.fontSize.sm,
    fontWeight: tokens.typography.fontWeight.medium,
    color: getTrendColor(),
  };

  return (
    <Card padding="xl" hover={true}>
      <div style={containerStyles}>
        {Icon && (
          <div style={iconStyles}>
            <Icon size={24} />
          </div>
        )}
        <div style={labelStyles}>{label}</div>
        <div style={valueContainerStyles}>
          <span style={valueStyles}>
            {typeof value === 'number' ? value.toLocaleString(locale) : value}
          </span>
          {suffix && <span style={suffixStyles}>{suffix}</span>}
        </div>
        {trend && (
          <div style={trendStyles}>
            <span>{getTrendIcon()}</span>
            <span>{trend.percentage > 0 ? '+' : ''}{trend.percentage}%</span>
          </div>
        )}
        {sparklineData && sparklineData.length > 0 && (
          <Sparkline
            data={sparklineData}
            color={getTrendColor()}
            width={120}
            height={50}
          />
        )}
      </div>
    </Card>
  );
}
