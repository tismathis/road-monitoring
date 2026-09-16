import { tokens } from '../../styles/tokens';

/**
 * Badge component - Status and severity indicators
 * Light theme with functional color coding (road safety conventions)
 * NO ALL-CAPS labels unless appropriate for the content
 * @param {Object} props
 * @param {'fatal'|'serious'|'minor'|'info'|'online'|'offline'|'warning'|'error'|'available'} props.variant - Badge variant
 * @param {React.ReactNode} props.children - Badge text
 * @param {'sm'|'md'|'lg'} props.size - Badge size (default: 'md')
 */
export function Badge({ variant = 'info', children, size = 'md' }) {
  const variantColors = {
    // Severity variants
    fatal: {
      bg: '#FEE2E2', // Light red background
      text: tokens.colors.alert.critical,
      border: tokens.colors.alert.critical,
    },
    serious: {
      bg: '#FEF3C7', // Light yellow/amber background
      text: tokens.colors.alert.moderateOrange,
      border: tokens.colors.alert.moderateOrange,
    },
    minor: {
      bg: '#FEF9C3', // Very light yellow
      text: '#CA8A04',
      border: '#CA8A04',
    },
    info: {
      bg: tokens.colors.infosys.tint, // #F0F8FC - Infosys Blue tint
      text: tokens.colors.infosys.dark, // #005A8F
      border: tokens.colors.infosys.primary,
    },

    // Status variants (road-inspired colors)
    online: {
      bg: '#D1FAE5', // Light green
      text: tokens.colors.status.online,
      border: tokens.colors.status.online,
    },
    available: {
      bg: '#D1FAE5', // Light green
      text: tokens.colors.status.available,
      border: tokens.colors.status.available,
    },
    offline: {
      bg: '#F3F4F6', // Light gray
      text: tokens.colors.status.offline,
      border: tokens.colors.status.offline,
    },
    warning: {
      bg: '#FEF3C7', // Light amber
      text: tokens.colors.alert.amber,
      border: tokens.colors.alert.amber,
    },
    error: {
      bg: '#FEE2E2', // Light red
      text: tokens.colors.alert.critical,
      border: tokens.colors.alert.critical,
    },
  };

  const sizeStyles = {
    sm: {
      fontSize: tokens.typography.fontSize.xs,
      padding: `${tokens.spacing.xs} ${tokens.spacing.sm}`,
      borderRadius: tokens.borderRadius.sm,
    },
    md: {
      fontSize: tokens.typography.fontSize.sm,
      padding: `${tokens.spacing.xs} ${tokens.spacing.md}`,
      borderRadius: tokens.borderRadius.sm,
    },
    lg: {
      fontSize: tokens.typography.fontSize.base,
      padding: `${tokens.spacing.sm} ${tokens.spacing.lg}`,
      borderRadius: tokens.borderRadius.md,
    },
  };

  const colors = variantColors[variant] || variantColors.info;

  const styles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
    color: colors.text,
    border: `1px solid ${colors.border}`,
    fontWeight: tokens.typography.fontWeight.medium,
    ...sizeStyles[size],
  };

  return (
    <span style={styles}>
      {children}
    </span>
  );
}
