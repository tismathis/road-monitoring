import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Map,
  AlertTriangle,
  Video,
  Grid3x3,
  LineChart,
  Network,
  Box,
  Settings
} from 'lucide-react';
import { tokens } from '../styles/tokens';
import { useTranslation } from '../i18n/LanguageContext';

// Grouped menu structure - operational monitoring sections
const menuGroups = [
  {
    id: 'overview',
    labelKey: 'nav.monitoring',
    icon: LayoutDashboard,
    items: [
      { id: 'dashboard', icon: LayoutDashboard, labelKey: 'nav.dashboard', route: '/dashboard' },
      { id: 'map', icon: Map, labelKey: 'nav.map', route: '/map' },
    ]
  },
  {
    id: 'incidents',
    labelKey: 'nav.incidents',
    icon: AlertTriangle,
    items: [
      { id: 'incidents', icon: AlertTriangle, labelKey: 'nav.events', route: '/incidents' },
      { id: 'camera-wall', icon: Grid3x3, labelKey: 'nav.cameraWall', route: '/camera-wall' },
      { id: 'camera', icon: Video, labelKey: 'nav.camera', route: '/camera' },
    ]
  },
  {
    id: 'analytics',
    labelKey: 'nav.analytics',
    icon: LineChart,
    items: [
      { id: 'graph', icon: Network, labelKey: 'nav.graph2d', route: '/graph' },
      { id: 'graph3d', icon: Box, labelKey: 'nav.graph3d', route: '/graph3d' },
      { id: 'stats', icon: LineChart, labelKey: 'nav.statistics', route: '/stats' },
    ]
  },
  {
    id: 'system',
    labelKey: 'nav.system',
    icon: Settings,
    items: [
      { id: 'settings', icon: Settings, labelKey: 'nav.settings', route: '/settings' },
    ]
  },
];

export function Sidebar() {
  const { t } = useTranslation();

  const sidebarStyles = {
    width: tokens.layout.sidebarWidth,
    height: '100vh',
    background: tokens.colors.background.elevated, // White
    borderRight: `1px solid ${tokens.colors.neutral.border}`, // #E5E7EB
    display: 'flex',
    flexDirection: 'column',
    padding: tokens.spacing.lg,
    paddingTop: tokens.spacing.xl,
    boxShadow: tokens.shadows.sm, // Subtle shadow
  };

  const logoStyles = {
    fontFamily: tokens.typography.fontFamily.heading, // Inter
    fontSize: tokens.typography.fontSize['2xl'],
    fontWeight: tokens.typography.fontWeight.semibold,
    color: tokens.colors.infosys.primary, // #007CC3 - Infosys Blue
    marginBottom: tokens.spacing['2xl'],
    paddingLeft: tokens.spacing.md,
    letterSpacing: '-0.01em',
  };

  const navStyles = {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing.xs,
  };

  const groupHeaderStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing.sm,
    padding: `${tokens.spacing.sm} ${tokens.spacing.md}`,
    marginTop: tokens.spacing.lg,
    marginBottom: tokens.spacing.xs,
    fontSize: tokens.typography.fontSize.xs,
    fontWeight: tokens.typography.fontWeight.semibold,
    color: tokens.colors.text.tertiary, // #6B7280
    // NO textTransform: 'uppercase' - avoid generic ALL-CAPS eyebrow labels
  };

  const getLinkStyles = (isActive) => ({
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing.md,
    padding: `${tokens.spacing.sm} ${tokens.spacing.md}`,
    borderRadius: tokens.borderRadius.md,
    textDecoration: 'none',
    fontSize: tokens.typography.fontSize.sm,
    fontWeight: isActive ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.normal,
    color: isActive ? tokens.colors.infosys.dark : tokens.colors.text.secondary, // #005A8F vs #4A5568
    backgroundColor: isActive
      ? tokens.colors.infosys.light // #E5F3F9 - subtle blue tint
      : 'transparent',
    borderLeft: isActive
      ? `2px solid ${tokens.colors.infosys.primary}` // #007CC3 - Infosys Blue indicator
      : '2px solid transparent',
    // NO glow, NO transform - just simple color changes
    transition: `background-color ${tokens.transitions.fast}, border-color ${tokens.transitions.fast}`,
  });

  return (
    <aside style={sidebarStyles}>
      {/* Logo/Brand */}
      <div style={logoStyles}>
        Gaborone RoadWatch
      </div>

      {/* Navigation groups */}
      <nav style={navStyles}>
        {menuGroups.map((group) => (
          <div key={group.id}>
            {/* Group header with icon */}
            <div style={groupHeaderStyles}>
              <group.icon size={12} />
              <span>{t(group.labelKey)}</span>
            </div>

            {/* Group items */}
            {group.items.map(item => (
              <NavLink
                key={item.id}
                to={item.route}
                style={({ isActive }) => getLinkStyles(isActive)}
                className="sidebar-link"
              >
                {({ isActive }) => (
                  <>
                    <item.icon
                      size={18}
                      color={isActive
                        ? tokens.colors.infosys.primary // #007CC3
                        : tokens.colors.text.tertiary // #6B7280
                      }
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                    <span>{t(item.labelKey)}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Hover styles - subtle background change only */}
      <style>{`
        .sidebar-link:not(.active):hover {
          background-color: ${tokens.colors.background.grouped}; /* #F0F8FC - very subtle */
          transition: background-color ${tokens.transitions.fast};
        }
      `}</style>
    </aside>
  );
}
