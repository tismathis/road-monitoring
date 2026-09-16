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
    <svg width={width} height={height} style={{ position: 'absolute', bottom: 8, right: 8, opacity: 0.3 }}>
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
 * StatCard component - Displays key metrics
 * Light theme, operational density
 * NO ALL-CAPS labels (from avoid list)
 * @param {Object} props
 * @param {number|string} props.value - Main value to display
 * @param {string} props.label - Label for the metric (NOT forced uppercase)
 * @param {Object} props.trend - Optional trend { direction: 'up'|'down'|'neutral', percentage: number }
 * @param {Array<number>} props.sparklineData - Optional sparkline data
 * @param {React.Component} props.icon - Optional lucide-react icon
 * @param {string} props.suffix - Optional suffix (e.g., 'km/h', '%')
 */
export function StatCard({ value, label, trend, sparklineData, icon: Icon, suffix }) {
  const { locale } = useTranslation();

  const getTrendColor = () => {
    if (!trend) return tokens.colors.text.tertiary;
    if (trend.direction === 'up') return tokens.colors.infosys.primary; // #007CC3
    if (trend.direction === 'down') return tokens.colors.alert.critical; // #DC2626
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
    minHeight: '120px', // Reduced from 160px for density
    overflow: 'hidden',
  };

  const iconStyles = {
    color: tokens.colors.infosys.primary,
    marginBottom: tokens.spacing.xs,
  };

  const labelStyles = {
    fontSize: tokens.typography.fontSize.sm,
    color: tokens.colors.text.secondary, // Asphalt gray
    // NO textTransform: 'uppercase' - avoid generic ALL-CAPS labels
    fontWeight: tokens.typography.fontWeight.medium,
    marginBottom: tokens.spacing.sm,
  };

  const valueContainerStyles = {
    display: 'flex',
    alignItems: 'baseline',
    gap: tokens.spacing.sm,
    marginBottom: tokens.spacing.sm,
  };

  const valueStyles = {
    fontFamily: tokens.typography.fontFamily.heading, // Inter for numbers
    fontSize: tokens.typography.fontSize['3xl'], // Reduced from 4xl
    fontWeight: tokens.typography.fontWeight.semibold,
    color: tokens.colors.text.primary,
    lineHeight: 1,
    fontVariantNumeric: 'tabular-nums', // Align numbers
  };

  const suffixStyles = {
    fontSize: tokens.typography.fontSize.base,
    color: tokens.colors.text.secondary,
    fontWeight: tokens.typography.fontWeight.normal,
  };

  const trendStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: tokens.spacing.xs,
    fontSize: tokens.typography.fontSize.sm,
    fontWeight: tokens.typography.fontWeight.medium,
    color: getTrendColor(),
  };

  return (
    <Card padding="lg" hover={false}>
      <div style={containerStyles}>
        {Icon && (
          <div style={iconStyles}>
            <Icon size={20} />
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
            width={100}
            height={40}
          />
        )}
      </div>
    </Card>
  );
}
