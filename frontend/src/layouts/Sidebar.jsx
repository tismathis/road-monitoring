import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Map,
  AlertTriangle,
  Video,
  LineChart,
  Network,
  Box,
  Settings
} from 'lucide-react';
import { tokens } from '../styles/tokens';
import { useTranslation } from '../i18n/LanguageContext';

// Grouped menu structure (Apple/iOS Settings style)
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
    background: 'rgba(26, 26, 31, 0.8)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderRight: `1px solid ${tokens.colors.border.default}`,
    display: 'flex',
    flexDirection: 'column',
    padding: tokens.spacing.xl,
    paddingTop: tokens.spacing['2xl'],
    boxShadow: tokens.shadows.lg,
  };

  const logoStyles = {
    fontSize: tokens.typography.fontSize['2xl'],
    fontWeight: tokens.typography.fontWeight.bold,
    color: tokens.colors.primary[500],
    marginBottom: tokens.spacing['3xl'],
    textAlign: 'center',
    letterSpacing: '-0.02em',
  };

  const navStyles = {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing.sm,
  };

  const groupHeaderStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing.sm,
    padding: `${tokens.spacing.sm} ${tokens.spacing.md}`,
    marginTop: tokens.spacing.xl,
    marginBottom: tokens.spacing.sm,
    fontSize: tokens.typography.fontSize.xs,
    fontWeight: tokens.typography.fontWeight.semibold,
    color: tokens.colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  };

  const getLinkStyles = (isActive) => ({
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing.md,
    padding: `${tokens.spacing.md} ${tokens.spacing.lg}`,
    borderRadius: tokens.borderRadius.md,
    textDecoration: 'none',
    fontSize: tokens.typography.fontSize.sm,
    fontWeight: isActive ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.medium,
    color: isActive ? tokens.colors.text.primary : tokens.colors.text.secondary,
    backgroundColor: isActive
      ? 'rgba(16, 185, 129, 0.15)'
      : 'transparent',
    borderLeft: isActive
      ? `3px solid ${tokens.colors.primary[500]}`
      : '3px solid transparent',
    boxShadow: isActive
      ? '0 0 20px rgba(16, 185, 129, 0.2)'
      : 'none',
    transform: isActive ? 'translateX(4px)' : 'translateX(0)',
    transition: `all ${tokens.transitions.normal}`,
  });

  return (
    <aside style={sidebarStyles}>
      <div style={logoStyles}>RoadWatch</div>

      <nav style={navStyles}>
        {menuGroups.map((group) => (
          <div key={group.id}>
            {/* Group header with icon */}
            <div style={groupHeaderStyles}>
              <group.icon size={14} />
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
                      size={20}
                      color={isActive
                        ? tokens.colors.primary[500]
                        : tokens.colors.text.tertiary
                      }
                    />
                    <span>{t(item.labelKey)}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <style>{`
        .sidebar-link:not(.active):hover {
          background-color: ${tokens.colors.glass.light};
          transform: translateX(2px);
          transition: all ${tokens.transitions.normal};
        }
      `}</style>
    </aside>
  );
}
