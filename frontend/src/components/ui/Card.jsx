import { tokens } from '../../styles/tokens';

/**
 * Base Card component with frosted glass effect and rounded corners
 * Apple-style dark mode design
 * @param {Object} props
 * @param {React.ReactNode} props.children - Card content
 * @param {string} props.className - Additional CSS classes
 * @param {'xs'|'sm'|'md'|'lg'|'xl'|'2xl'} props.padding - Padding size (default: 'lg')
 * @param {'sm'|'md'|'lg'|'xl'} props.shadow - Shadow size (default: 'md')
 * @param {'default'|'bordered'|'flat'} props.variant - Card variant (default: 'default')
 * @param {Object} props.style - Additional inline styles
 * @param {boolean} props.hover - Enable hover lift effect (default: false)
 */
export function Card({
  children,
  className = '',
  padding = 'lg',
  shadow = 'md',
  variant = 'default',
  style = {},
  hover = false,
  ...props
}) {
  const baseStyles = {
    background: 'rgba(31, 31, 36, 0.6)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderRadius: tokens.borderRadius.lg,
    padding: tokens.spacing[padding],
    border: `1px solid ${tokens.colors.border.default}`,
    transition: `all ${tokens.transitions.normal}`,
  };

  const variantStyles = {
    default: {
      boxShadow: tokens.shadows[shadow],
    },
    bordered: {
      border: `1px solid ${tokens.colors.border.default}`,
      boxShadow: tokens.shadows.sm,
    },
    flat: {
      border: 'none',
      boxShadow: 'none',
      background: 'rgba(31, 31, 36, 0.4)',
    },
  };

  const combinedStyles = {
    ...baseStyles,
    ...variantStyles[variant],
    ...style,
  };

  const hoverClass = hover ? 'card-hover' : '';

  return (
    <>
      <div
        className={`card ${hoverClass} ${className}`}
        style={combinedStyles}
        {...props}
      >
        {children}
      </div>

      <style>{`
        .card-hover:hover {
          transform: translateY(-2px);
          box-shadow: ${tokens.shadows.lg};
          border-color: ${tokens.colors.border.hover};
          transition: all ${tokens.transitions.normal};
        }
      `}</style>
    </>
  );
}
