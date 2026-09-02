import { tokens } from '../../styles/tokens';

/**
 * Badge component for status and severity indicators
 * Apple-style dark mode with subtle borders and glow
 * @param {Object} props
 * @param {'fatal'|'serious'|'minor'|'info'|'online'|'offline'|'dispatched'|'notified'|'inProgress'|'warning'|'error'} props.variant - Badge variant
 * @param {React.ReactNode} props.children - Badge text
 * @param {'sm'|'md'|'lg'} props.size - Badge size (default: 'md')
 */
export function Badge({ variant = 'info', children, size = 'md' }) {
  const variantColors = {
    // Severity variants (brighter for dark mode)
    fatal: {
      bg: `${tokens.colors.severity.fatal}30`,
      text: tokens.colors.severity.fatal,
      border: `${tokens.colors.severity.fatal}60`,
    },
    serious: {
      bg: `${tokens.colors.severity.serious}30`,
      text: tokens.colors.severity.serious,
      border: `${tokens.colors.severity.serious}60`,
    },
    minor: {
      bg: `${tokens.colors.severity.minor}30`,
      text: tokens.colors.severity.minor,
      border: `${tokens.colors.severity.minor}60`,
    },
    info: {
      bg: `${tokens.colors.severity.info}30`,
      text: tokens.colors.severity.info,
      border: `${tokens.colors.severity.info}60`,
    },

    // Status variants
    online: {
      bg: `${tokens.colors.status.online}30`,
      text: tokens.colors.status.online,
      border: `${tokens.colors.status.online}60`,
    },
    offline: {
      bg: `${tokens.colors.status.offline}30`,
      text: tokens.colors.status.offline,
      border: `${tokens.colors.status.offline}60`,
    },
    dispatched: {
      bg: `${tokens.colors.status.dispatched}30`,
      text: tokens.colors.status.dispatched,
      border: `${tokens.colors.status.dispatched}60`,
    },
    notified: {
      bg: `${tokens.colors.status.notified}30`,
      text: tokens.colors.status.notified,
      border: `${tokens.colors.status.notified}60`,
    },
    inProgress: {
      bg: `${tokens.colors.status.inProgress}30`,
      text: tokens.colors.status.inProgress,
      border: `${tokens.colors.status.inProgress}60`,
    },
    warning: {
      bg: `${tokens.colors.status.warning}30`,
      text: tokens.colors.status.warning,
      border: `${tokens.colors.status.warning}60`,
    },
    error: {
      bg: `${tokens.colors.status.error}30`,
      text: tokens.colors.status.error,
      border: `${tokens.colors.status.error}60`,
    },
  };

  const sizeStyles = {
    sm: {
      fontSize: tokens.typography.fontSize.xs,
      padding: `2px ${tokens.spacing.sm}`,
      borderRadius: tokens.borderRadius.sm,
    },
    md: {
      fontSize: tokens.typography.fontSize.sm,
      padding: `4px ${tokens.spacing.md}`,
      borderRadius: tokens.borderRadius.md,
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
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    ...sizeStyles[size],
  };

  return (
    <span style={styles}>
      {children}
    </span>
  );
}
