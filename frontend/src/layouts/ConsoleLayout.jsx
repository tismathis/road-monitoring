import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Map as MapIcon,
  AlertTriangle,
  Video,
  Grid3x3,
  LineChart,
  Network,
  Box,
  Settings,
  LogOut,
  Languages,
} from 'lucide-react';

import { useCameraList } from '../hooks/useGenericCameraData';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../i18n/LanguageContext';

import { Button } from '../components/console-ui/button';
import { Badge } from '../components/console-ui/badge';
import { Avatar, AvatarFallback } from '../components/console-ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../components/console-ui/tooltip';
import { NemopointMark } from '../components/console-ui/nemopoint-mark';

const NAV_GROUPS = [
  {
    tick: false,
    items: [
      { id: 'dashboard', icon: LayoutDashboard, labelKey: 'nav.dashboard', short: 'Dash', route: '/dashboard' },
      { id: 'map', icon: MapIcon, labelKey: 'nav.map', short: 'Map', route: '/map' },
    ],
  },
  {
    tick: true,
    items: [
      { id: 'incidents', icon: AlertTriangle, labelKey: 'nav.events', short: 'Alerts', route: '/incidents' },
      { id: 'camera-wall', icon: Grid3x3, labelKey: 'nav.cameraWall', short: 'Wall', route: '/camera-wall' },
      { id: 'camera', icon: Video, labelKey: 'nav.camera', short: 'Live', route: '/camera' },
    ],
  },
  {
    tick: false,
    items: [
      { id: 'graph', icon: Network, labelKey: 'nav.graph2d', short: 'Graph', route: '/graph' },
      { id: 'graph3d', icon: Box, labelKey: 'nav.graph3d', short: '3D', route: '/graph3d' },
      { id: 'stats', icon: LineChart, labelKey: 'nav.statistics', short: 'Stats', route: '/stats' },
    ],
  },
];

function useLiveClock(locale) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now.toLocaleTimeString(locale, { hour12: false });
}

/**
 * ConsoleLayout — the shared dark command-console shell (icon rail + top
 * status bar) established on the Live Map page, now shared by every
 * authenticated route so the whole app reads as one system instead of a
 * light CRUD app with one dark surface bolted on.
 */
export function ConsoleLayout({ title, zone = 'Gaborone CBD', noPadding = false, children }) {
  const { t, language, setLanguage, locale } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const cameras = useCameraList(15000);
  const clock = useLiveClock(locale);

  const onlineCameras = cameras.filter((c) => c.is_online).length;
  const totalCameras = cameras.length;
  const allOnline = totalCameras > 0 && onlineCameras === totalCameras;

  return (
    <TooltipProvider delayDuration={200}>
      <div className="gb-console flex h-screen w-screen overflow-hidden text-[14px]">
        {/* ICON RAIL */}
        <aside className="gb-grid-texture flex w-[76px] flex-none flex-col items-center gap-1 border-r border-gb-border bg-gb-surface py-4">
          <NavLink to="/dashboard" className="mb-5 flex flex-col items-center gap-1.5">
            <span className="flex size-9 items-center justify-center rounded-[7px] bg-gb-primary/10">
              <NemopointMark size={26} />
            </span>
            <span className="text-[8.5px] font-semibold uppercase tracking-[0.08em] text-gb-muted-foreground/70">
              Watch
            </span>
          </NavLink>

          {NAV_GROUPS.map((group, i) => (
            <div key={i} className={group.tick ? 'gb-route-tick w-full py-2.5' : 'contents'}>
              <div className="flex flex-col items-center gap-1.5">
                {group.items.map((item) => (
                  <NavLink
                    key={item.id}
                    to={item.route}
                    aria-label={t(item.labelKey)}
                    title={t(item.labelKey)}
                    className={({ isActive }) =>
                      `flex w-16 flex-col items-center gap-1 rounded-[7px] py-1.5 transition-colors ${
                        isActive
                          ? 'bg-gb-primary/12 text-gb-primary'
                          : 'text-gb-muted-foreground hover:bg-gb-accent hover:text-gb-foreground'
                      }`
                    }
                  >
                    <item.icon size={19} strokeWidth={2} />
                    <span className="text-[9px] font-semibold uppercase tracking-[0.06em]">{item.short}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}

          <div className="mt-auto flex flex-col items-center gap-1.5">
            <NavLink
              to="/settings"
              title={t('nav.settings')}
              className={({ isActive }) =>
                `flex w-16 flex-col items-center gap-1 rounded-[7px] py-1.5 transition-colors ${
                  isActive
                    ? 'bg-gb-primary/12 text-gb-primary'
                    : 'text-gb-muted-foreground hover:bg-gb-accent hover:text-gb-foreground'
                }`
              }
            >
              <Settings size={19} strokeWidth={2} />
              <span className="text-[9px] font-semibold uppercase tracking-[0.06em]">Setup</span>
            </NavLink>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          {/* TOP STATUS BAR */}
          <header className="flex h-12 flex-none items-center gap-3 border-b border-gb-border bg-gb-surface px-4">
            <span className="text-[13px] text-gb-muted-foreground">{zone}</span>
            <span className="text-gb-border">/</span>
            <span className="text-[13px] font-medium text-gb-foreground">{title}</span>

            <Badge variant="success" className="ml-2 gap-1.5">
              <span className="relative flex size-1.5">
                <span className="gb-radar-ring absolute inset-0 rounded-full border border-gb-success" />
                <span className="size-1.5 rounded-full bg-gb-success" />
              </span>
              {t('console.live')}
            </Badge>

            <div className="ml-auto flex items-center gap-5">
              <div className="flex items-center gap-1.5 text-gb-muted-foreground">
                <span className={`size-1.5 rounded-full ${allOnline ? 'bg-gb-success' : 'bg-gb-warning'}`} />
                <span className="text-[12px]">
                  {allOnline
                    ? t('console.systemNormal')
                    : totalCameras > 0
                    ? `${totalCameras - onlineCameras} ${t('console.offline').toLowerCase()}`
                    : t('console.systemNormal')}
                </span>
              </div>

              <span className="gb-num text-[12px] text-gb-muted-foreground">{clock}</span>

              <button
                type="button"
                onClick={() => setLanguage(language === 'en' ? 'fr' : 'en')}
                className="flex items-center gap-1.5 rounded-[4px] border border-gb-border px-2 py-1 text-[11px] text-gb-muted-foreground hover:text-gb-foreground"
                aria-label={t('language.label')}
              >
                <Languages size={12} />
                {language.toUpperCase()}
              </button>

              <div className="flex items-center gap-2 border-l border-gb-border pl-4">
                <Avatar size="sm">
                  <AvatarFallback>
                    {(user?.full_name || user?.username || '?').slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="leading-tight">
                  <div className="text-[12px] font-medium text-gb-foreground">
                    {user?.full_name || user?.username || t('console.operator')}
                  </div>
                  <div className="text-[10px] capitalize text-gb-muted-foreground">
                    {user?.role || t('console.operator')}
                  </div>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => {
                        logout();
                        navigate('/login');
                      }}
                      aria-label={t('console.logout')}
                    >
                      <LogOut size={15} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">{t('console.logout')}</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </header>

          {/* PAGE CONTENT */}
          <main className={noPadding ? 'flex min-h-0 flex-1' : 'min-h-0 flex-1 overflow-y-auto p-6'}>
            {children}
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
