import { Card } from '../ui/Card';
import { tokens } from '../../styles/tokens';

/**
 * KeyMetricCard component - Compact metric card with icon
 * Light theme, NO glow effects
 * @param {Object} props
 * @param {React.Component} props.icon - lucide-react icon component
 * @param {string} props.label - Metric label
 * @param {string|number} props.value - Metric value (can be ratio like "3/3")
 * @param {'success'|'warning'|'error'|'neutral'} props.status - Status for icon color (default: 'success')
 */
export function KeyMetricCard({ icon: Icon, label, value, status = 'success' }) {
  const statusColors = {
    success: tokens.colors.status.online,      // #059669 - Green
    warning: tokens.colors.alert.amber,        // #D97706 - Amber
    error: tokens.colors.alert.critical,       // #DC2626 - Red
    neutral: tokens.colors.infosys.primary,    // #007CC3 - Infosys Blue
  };

  const statusBackgrounds = {
    success: '#D1FAE5',   // Light green
    warning: '#FEF3C7',   // Light amber
    error: '#FEE2E2',     // Light red
    neutral: tokens.colors.infosys.tint, // #F0F8FC - Light blue
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
    backgroundColor: statusBackgrounds[status],
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: statusColors[status],
    flexShrink: 0,
    border: `1px solid ${statusColors[status]}`,
    // NO boxShadow glow - keep it clean
  };

  const contentStyles = {
    flex: 1,
    minWidth: 0,
  };

  const labelStyles = {
    fontSize: tokens.typography.fontSize.sm,
    color: tokens.colors.text.secondary, // Asphalt gray
    marginBottom: tokens.spacing.xs,
  };

  const valueStyles = {
    fontFamily: tokens.typography.fontFamily.heading,
    fontSize: tokens.typography.fontSize['2xl'],
    fontWeight: tokens.typography.fontWeight.semibold,
    color: tokens.colors.text.primary,
    fontVariantNumeric: 'tabular-nums',
  };

  return (
    <Card padding="lg" hover={false}>
      <div style={containerStyles}>
        <div style={iconContainerStyles}>
          {Icon && <Icon size={22} />}
        </div>
        <div style={contentStyles}>
          <div style={labelStyles}>{label}</div>
          <div style={valueStyles}>{value}</div>
        </div>
      </div>
    </Card>
  );
}
