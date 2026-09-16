import { useState } from 'react';
import { tokens } from '../../styles/tokens';

/**
 * Button component - Clean light theme design
 * Infosys Blue primary actions, subtle hover (NO scale, NO glow)
 * @param {Object} props
 * @param {'primary'|'secondary'|'ghost'|'danger'} props.variant - Button variant (default: 'primary')
 * @param {'sm'|'md'|'lg'} props.size - Button size (default: 'md')
 * @param {React.ReactNode} props.icon - Optional icon component (lucide-react)
 * @param {React.ReactNode} props.children - Button text
 * @param {Function} props.onClick - Click handler
 * @param {boolean} props.disabled - Disabled state
 * @param {boolean} props.fullWidth - Full width button
 */
export function Button({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  children,
  onClick,
  disabled = false,
  fullWidth = false,
  ...props
}) {
  const variantStyles = {
    primary: {
      backgroundColor: tokens.colors.infosys.primary, // #007CC3
      color: '#FFFFFF',
      border: 'none',
    },
    primaryHover: {
      backgroundColor: tokens.colors.infosys.dark, // #005A8F - slightly darker
    },
    secondary: {
      backgroundColor: tokens.colors.background.elevated, // White
      color: tokens.colors.text.primary,
      border: tokens.borders.default,
    },
    secondaryHover: {
      backgroundColor: tokens.colors.background.hover, // #E5F3F9
      borderColor: tokens.colors.infosys.primary,
    },
    ghost: {
      backgroundColor: 'transparent',
      color: tokens.colors.text.secondary,
      border: 'none',
    },
    ghostHover: {
      backgroundColor: tokens.colors.background.grouped, // #F0F8FC
    },
    danger: {
      backgroundColor: tokens.colors.alert.critical, // #DC2626
      color: '#FFFFFF',
      border: 'none',
    },
    dangerHover: {
      backgroundColor: '#B91C1C', // Slightly darker red
    },
  };

  const sizeStyles = {
    sm: {
      fontSize: tokens.typography.fontSize.sm,
      padding: `${tokens.spacing.sm} ${tokens.spacing.md}`,
      borderRadius: tokens.borderRadius.md,
    },
    md: {
      fontSize: tokens.typography.fontSize.base,
      padding: `${tokens.spacing.md} ${tokens.spacing.lg}`,
      borderRadius: tokens.borderRadius.md,
    },
    lg: {
      fontSize: tokens.typography.fontSize.lg,
      padding: `${tokens.spacing.lg} ${tokens.spacing.xl}`,
      borderRadius: tokens.borderRadius.md,
    },
  };

  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacing.sm,
    fontWeight: tokens.typography.fontWeight.medium,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: `background-color ${tokens.transitions.fast}, border-color ${tokens.transitions.fast}`,
    opacity: disabled ? 0.5 : 1,
    width: fullWidth ? '100%' : 'auto',
    ...variantStyles[variant],
    ...sizeStyles[size],
  };

  const [isHovered, setIsHovered] = useState(false);

  const hoverStyles = !disabled && isHovered ? variantStyles[`${variant}Hover`] : {};

  return (
    <button
      style={{ ...baseStyles, ...hoverStyles }}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      {Icon && <Icon size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20} />}
      {children}
    </button>
  );
}
