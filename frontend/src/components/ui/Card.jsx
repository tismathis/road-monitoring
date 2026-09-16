import { tokens } from '../../styles/tokens';

/**
 * Base Card component - Clean light theme design
 * Infosys Blue on Light - Operational density
 * @param {Object} props
 * @param {React.ReactNode} props.children - Card content
 * @param {string} props.className - Additional CSS classes
 * @param {'xs'|'sm'|'md'|'lg'|'xl'|'2xl'} props.padding - Padding size (default: 'lg')
 * @param {'default'|'grouped'|'flat'|'alert'} props.variant - Card variant (default: 'default')
 * @param {Object} props.style - Additional inline styles
 * @param {boolean} props.hover - Enable subtle hover effect (default: false)
 * @param {Function} props.onClick - Click handler
 */
export function Card({
  children,
  className = '',
  padding = 'lg',
  variant = 'default',
  style = {},
  hover = false,
  onClick,
  ...props
}) {
  const baseStyles = {
    background: tokens.colors.background.elevated, // White
    borderRadius: tokens.borderRadius.md, // 8px consistent
    padding: tokens.spacing[padding],
    border: tokens.borders.default, // 1px solid #E5E7EB
    transition: `background-color ${tokens.transitions.fast}, border-color ${tokens.transitions.fast}`,
    boxShadow: tokens.shadows.sm, // Subtle shadow
  };

  const variantStyles = {
    default: {
      // Standard white card
    },
    grouped: {
      // Subtle blue tint for grouped content
      background: tokens.colors.background.grouped, // #F0F8FC
      border: 'none',
      boxShadow: 'none',
    },
    flat: {
      // No border, no shadow - just background
      border: 'none',
      boxShadow: 'none',
    },
    alert: {
      // Alert state with amber border
      border: tokens.borders.alert, // 2px solid #D97706
      background: tokens.patterns.alertStripes + ', ' + tokens.colors.background.elevated,
    },
  };

  const combinedStyles = {
    ...baseStyles,
    ...variantStyles[variant],
    ...style,
  };

  // Subtle hover effect (NOT lift-and-shadow from avoid list)
  const hoverClass = hover ? 'card-hover' : '';
  const clickableClass = onClick ? 'card-clickable' : '';

  return (
    <>
      <div
        className={`card ${hoverClass} ${clickableClass} ${className}`}
        style={combinedStyles}
        onClick={onClick}
        {...props}
      >
        {children}
      </div>

      <style>{`
        .card-hover:hover {
          /* Subtle background change on hover - NO lift, NO shadow change */
          background-color: ${tokens.colors.background.hover};
          border-color: ${tokens.colors.neutral.borderEmphasis};
        }

        .card-clickable {
          cursor: pointer;
        }
      `}</style>
    </>
  );
}
