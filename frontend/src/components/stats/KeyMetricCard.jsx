import { Card } from '../ui/Card';
import { tokens } from '../../styles/tokens';

/**
 * KeyMetricCard component - compact card with icon, label, and value
 * Apple-style dark mode with frosted glass and glow effects
 * @param {Object} props
 * @param {React.Component} props.icon - lucide-react icon component
 * @param {string} props.label - Metric label
 * @param {string|number} props.value - Metric value (can be ratio like "3/3")
 * @param {'success'|'warning'|'error'|'neutral'} props.status - Status for icon color (default: 'success')
 */
export function KeyMetricCard({ icon: Icon, label, value, status = 'success' }) {
  const statusColors = {
    success: tokens.colors.status.online,
    warning: tokens.colors.status.warning,
    error: tokens.colors.status.error,
    neutral: tokens.colors.text.tertiary,
  };

  const containerStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing.lg,
  };

  const iconContainerStyles = {
    width: '48px',
    height: '48px',
    borderRadius: tokens.borderRadius.md,
    backgroundColor: `${statusColors[status]}20`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: statusColors[status],
    flexShrink: 0,
    border: `1px solid ${statusColors[status]}40`,
    boxShadow: `0 0 20px ${statusColors[status]}30`,
  };

  const contentStyles = {
    flex: 1,
    minWidth: 0,
  };

  const labelStyles = {
    fontSize: tokens.typography.fontSize.sm,
    color: tokens.colors.text.secondary,
    marginBottom: '2px',
  };

  const valueStyles = {
    fontSize: tokens.typography.fontSize['2xl'],
    fontWeight: tokens.typography.fontWeight.bold,
    color: tokens.colors.text.primary,
  };

  return (
    <Card padding="lg" hover={true}>
      <div style={containerStyles}>
        <div style={iconContainerStyles}>
          {Icon && <Icon size={24} />}
        </div>
        <div style={contentStyles}>
          <div style={labelStyles}>{label}</div>
          <div style={valueStyles}>{value}</div>
        </div>
      </div>
    </Card>
  );
}
