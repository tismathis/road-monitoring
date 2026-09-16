// Design System Tokens
// Infosys Blue on Light - Road Infrastructure Monitoring Theme
// Built for operational density and clarity, not marketing aesthetics

export const tokens = {
  colors: {
    // Light background system (subtle warm gray, not stark white)
    background: {
      base: '#FAFAF9',        // Main app background (very light warm gray)
      elevated: '#FFFFFF',    // Primary cards, modals
      grouped: '#F0F8FC',     // Subtle Infosys Blue tint for sectioning
      hover: '#E5F3F9',       // Hover/selected states (8-10% Blue tint)
    },

    // Infosys Blue tonal range (primary brand color)
    infosys: {
      primary: '#007CC3',     // Primary actions, active indicators, traffic flow
      dark: '#005A8F',        // Text on light backgrounds, headers, links
      light: '#E5F3F9',       // Backgrounds, hover states
      tint: '#F0F8FC',        // Subtle zone differentiation
    },

    // Neutrals (warm gray scale - infrastructure-grounded)
    neutral: {
      asphalt: '#4A5568',     // Secondary text, infrastructure labels (ties to road surfaces)
      border: '#E5E7EB',      // Dividers, inactive borders
      borderEmphasis: '#D1D5DB', // Active section borders
    },

    // Text colors for light theme
    text: {
      primary: '#1A1A1A',     // Body text, headings
      secondary: '#4A5568',   // Secondary text (asphalt gray - infrastructure feel)
      tertiary: '#6B7280',    // Metadata, timestamps (darkened from original #9CA3AF for contrast)
      disabled: '#9CA3AF',    // Disabled states
    },

    // Functional accents (drawn from road safety conventions)
    alert: {
      amber: '#D97706',       // Warnings, moderate alerts (road marking amber/yellow)
      critical: '#DC2626',    // Fatal crashes, critical states
      moderateOrange: '#F59E0B', // Moderate crash severity
    },

    status: {
      available: '#059669',   // Parking availability, success states (road green)
      online: '#059669',      // System online
      offline: '#6B7280',     // System offline
      warning: '#D97706',     // Warning state
      error: '#DC2626',       // Error state
    },

    // Chart colors (professional, functional)
    chart: {
      primary: '#007CC3',     // Infosys Blue for main metrics
      secondary: '#059669',   // Green for availability/success
      tertiary: '#3B82F6',    // Lighter blue for secondary metrics
      quaternary: '#8B5CF6',  // Purple
      amber: '#F59E0B',       // Amber for warnings
    },

    // Legacy severity (kept for backward compatibility)
    severity: {
      fatal: '#DC2626',
      serious: '#F59E0B',
      minor: '#FCD34D',
      info: '#3B82F6',
    },
  },

  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',      // Base unit for operational density
    xl: '24px',      // Max section padding
    '2xl': '32px',
    '3xl': '48px',
    '4xl': '64px',
  },

  borderRadius: {
    sm: '4px',
    md: '8px',       // Consistent across most elements
    lg: '12px',      // Large cards
    xl: '16px',
    full: '9999px',
  },

  shadows: {
    // Subtle shadows for light theme (not heavy drop shadows)
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    lg: '0 4px 6px 0 rgba(0, 0, 0, 0.07)',
    xl: '0 8px 12px 0 rgba(0, 0, 0, 0.08)',
    // No glow effects - keep it clean
    border: '0 0 0 1px rgba(0, 0, 0, 0.05)', // Subtle border shadow
  },

  typography: {
    fontFamily: {
      // Inter for headings (clarity, professionalism)
      heading: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      // System fonts for body (better rendering for dense data)
      sans: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      // No monospace for "techy" effect - use tabular-nums instead
      mono: "'SF Mono', 'Monaco', 'Consolas', monospace",
    },
    fontSize: {
      xs: '12px',
      sm: '14px',
      base: '14px',    // Base is 14px for information density
      lg: '16px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '28px',   // Page titles (not excessive)
      '4xl': '32px',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      // Only use 400, 500, 600 - no excessive weight mixing
    },
    lineHeight: {
      tight: 1.3,
      normal: 1.5,
      relaxed: 1.6,
    },
  },

  layout: {
    sidebarWidth: '240px',
    topBarHeight: '64px',
    maxContentWidth: '1440px',
    // Spacing for grids
    cameraGridGap: '16px',
    sectionPadding: '24px',
    chartPadding: '16px',
  },

  // Minimal transitions (operational tools favor instant feedback)
  transitions: {
    fast: '150ms ease-out',
    normal: '200ms ease-out',
    slow: '300ms ease-out',
    // No bouncy spring animations
  },

  // Borders (key to layout structure)
  borders: {
    default: '1px solid #E5E7EB',
    emphasis: '2px solid #007CC3',
    alert: '2px solid #D97706',
    subtle: '1px solid #F0F0F0',
  },

  // Alert animation (the ONE deliberate motion moment)
  animations: {
    alertPulse: `
      @keyframes alert-pulse {
        0%, 100% {
          border-color: #D97706;
          box-shadow: 0 0 0 0 rgba(217, 119, 6, 0.4);
        }
        50% {
          border-color: #D97706;
          box-shadow: 0 0 0 4px rgba(217, 119, 6, 0);
        }
      }
    `,
  },

  // Subtle background patterns (cartographic feel)
  patterns: {
    // Very subtle grid on main background
    gridSubtle: `
      linear-gradient(90deg, rgba(0,0,0,0.01) 1px, transparent 1px),
      linear-gradient(rgba(0,0,0,0.01) 1px, transparent 1px)
    `,
    gridSize: '40px 40px',

    // Parking lot grid (only for parking views)
    parkingGrid: `
      linear-gradient(rgba(74, 85, 104, 0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(74, 85, 104, 0.03) 1px, transparent 1px)
    `,
    parkingGridSize: '30px 30px',

    // Alert diagonal stripes
    alertStripes: `
      repeating-linear-gradient(
        45deg,
        transparent,
        transparent 6px,
        rgba(217, 119, 6, 0.1) 6px,
        rgba(217, 119, 6, 0.1) 12px
      )
    `,
  },

  // Status indicator symbols (road-infrastructure inspired)
  statusSymbols: {
    online: '─',      // Horizontal bar (road centerline)
    offline: '╌╌',    // Dashed bar
    alert: '⚠',       // Standard warning
  },
};
