// Design System Tokens
// Apple-style dark mode with green accent (road safety theme)

export const tokens = {
  colors: {
    // Dark background system (Apple-style near-black)
    background: {
      primary: '#111114',      // Main app background
      secondary: '#1A1A1F',    // Elevated surfaces
      tertiary: '#1F1F24',     // Card backgrounds
      elevated: '#252529',     // Floating elements
    },

    // Primary green palette (adjusted for dark mode visibility)
    primary: {
      50: '#ECFDF5',
      100: '#D1FAE5',
      400: '#34D399',
      500: '#10B981',    // Main green accent (brighter for dark mode)
      600: '#059669',
      700: '#047857',
    },

    // Text colors optimized for dark backgrounds
    text: {
      primary: '#FFFFFF',      // Headings, emphasis
      secondary: '#A1A1AA',    // Body text (zinc-400)
      tertiary: '#71717A',     // Muted text (zinc-500)
      disabled: '#52525B',     // Disabled states (zinc-600)
    },

    // Borders for frosted glass cards
    border: {
      default: 'rgba(255, 255, 255, 0.1)',
      hover: 'rgba(255, 255, 255, 0.2)',
      active: 'rgba(255, 255, 255, 0.3)',
    },

    // Glass overlay backgrounds
    glass: {
      light: 'rgba(255, 255, 255, 0.05)',
      medium: 'rgba(255, 255, 255, 0.08)',
      heavy: 'rgba(255, 255, 255, 0.12)',
    },

    // Neutral grays (legacy - keeping for backward compatibility)
    neutral: {
      0: '#ffffff',
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#e5e5e5',
      300: '#d4d4d4',
      500: '#737373',
      700: '#404040',
      900: '#171717',
    },

    // Severity colors (brighter for dark mode)
    severity: {
      fatal: '#EF4444',        // Brighter red
      serious: '#FB923C',      // Brighter orange
      minor: '#FCD34D',        // Brighter yellow
      info: '#60A5FA',         // Brighter blue
    },

    // Status colors (adjusted for dark mode)
    status: {
      online: '#10B981',       // Green (matches primary)
      offline: '#6B7280',
      warning: '#F59E0B',
      error: '#EF4444',
      dispatched: '#60A5FA',
      notified: '#F59E0B',
      inProgress: '#10B981',
    },

    // Chart colors (professional palette)
    chart: {
      primary: '#10B981',      // Green
      secondary: '#60A5FA',    // Blue
      tertiary: '#F59E0B',     // Amber
      quaternary: '#8b5cf6',   // Purple
      quinary: '#ec4899',      // Pink
    },
  },

  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    '2xl': '32px',
    '3xl': '48px',
    '4xl': '64px',
  },

  borderRadius: {
    sm: '8px',
    md: '12px',
    lg: '16px',      // Primary card radius
    xl: '20px',      // Large cards, modals
    '2xl': '24px',
    full: '9999px',
  },

  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3), 0 1px 3px 0 rgba(0, 0, 0, 0.15)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.3)',
    glow: '0 0 20px rgba(16, 185, 129, 0.3)',        // Green glow for primary accent
    glowHover: '0 0 30px rgba(16, 185, 129, 0.5)',   // Stronger glow on hover
  },

  typography: {
    fontFamily: {
      sans: "-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', 'Roboto', sans-serif",
      mono: "'SF Mono', 'Monaco', 'Cascadia Code', monospace",
    },
    fontSize: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '30px',
      '4xl': '36px',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },

  layout: {
    sidebarWidth: '240px',
    topBarHeight: '64px',
    maxContentWidth: '1440px',
  },

  // Smooth micro-interactions (200-250ms ease-out)
  transitions: {
    fast: '150ms ease-out',
    normal: '200ms ease-out',
    slow: '250ms ease-out',
    spring: '300ms cubic-bezier(0.34, 1.56, 0.64, 1)', // Bouncy Apple feel
  },

  // Frosted glass backdrop-filter values
  effects: {
    glass: 'backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);',
    glassLight: 'backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);',
    glassHeavy: 'backdrop-filter: blur(40px); -webkit-backdrop-filter: blur(40px);',
  },
};
