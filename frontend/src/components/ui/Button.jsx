import { useState } from 'react';
import { tokens } from '../../styles/tokens';

/**
 * Button component with Apple-style micro-interactions
 * Dark mode optimized with scale and glow effects
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
      backgroundColor: tokens.colors.primary[500],
      color: '#ffffff',
      border: `1px solid ${tokens.colors.primary[500]}`,
    },
    primaryHover: {
      backgroundColor: tokens.colors.primary[400],
      transform: 'scale(1.02)',
      boxShadow: tokens.shadows.glow,
    },
    primaryActive: {
      transform: 'scale(0.98)',
    },
    secondary: {
      backgroundColor: 'rgba(31, 31, 36, 0.8)',
      color: tokens.colors.text.primary,
      border: `1px solid ${tokens.colors.border.default}`,
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
    },
    secondaryHover: {
      backgroundColor: 'rgba(31, 31, 36, 0.9)',
      borderColor: tokens.colors.border.hover,
      transform: 'scale(1.02)',
    },
    secondaryActive: {
      transform: 'scale(0.98)',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: tokens.colors.text.secondary,
      border: 'none',
    },
    ghostHover: {
      backgroundColor: tokens.colors.glass.light,
      transform: 'scale(1.02)',
    },
    ghostActive: {
      transform: 'scale(0.98)',
    },
    danger: {
      backgroundColor: tokens.colors.severity.fatal,
      color: '#ffffff',
      border: `1px solid ${tokens.colors.severity.fatal}`,
    },
    dangerHover: {
      backgroundColor: '#dc2626',
      transform: 'scale(1.02)',
      boxShadow: '0 0 20px rgba(239, 68, 68, 0.3)',
    },
    dangerActive: {
      transform: 'scale(0.98)',
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
      borderRadius: tokens.borderRadius.lg,
    },
  };

  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacing.sm,
    fontWeight: tokens.typography.fontWeight.medium,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: `all ${tokens.transitions.normal}`,
    opacity: disabled ? 0.6 : 1,
    width: fullWidth ? '100%' : 'auto',
    ...variantStyles[variant],
    ...sizeStyles[size],
  };

  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const hoverStyles = !disabled && isHovered ? variantStyles[`${variant}Hover`] : {};
  const activeStyles = !disabled && isActive ? variantStyles[`${variant}Active`] : {};

  return (
    <button
      style={{ ...baseStyles, ...hoverStyles, ...activeStyles }}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsActive(false);
      }}
      onMouseDown={() => setIsActive(true)}
      onMouseUp={() => setIsActive(false)}
      {...props}
    >
      {Icon && <Icon size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20} />}
      {children}
    </button>
  );
}
