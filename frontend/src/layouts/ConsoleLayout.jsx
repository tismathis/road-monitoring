import { useEffect, useMemo, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
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
import BranchedMenu from '../components/console-ui/BranchedMenu';

const NAV_ICON_SIZE = 16;

function buildNavBranches(t) {
  return [
    {
      label: t('nav.groupControlPanel'),
      children: [
        { value: '/dashboard', label: t('nav.dashboard'), icon: <LayoutDashboard size={NAV_ICON_SIZE} /> },
        { value: '/map', label: t('nav.map'), icon: <MapIcon size={NAV_ICON_SIZE} /> },
        { value: '/camera-wall', label: t('nav.cameraWall'), icon: <Grid3x3 size={NAV_ICON_SIZE} /> },
        { value: '/camera', label: t('nav.camera'), icon: <Video size={NAV_ICON_SIZE} /> },
      ],
    },
    {
      label: t('nav.groupUrgent'),
      children: [
        { value: '/incidents', label: t('nav.events'), icon: <AlertTriangle size={NAV_ICON_SIZE} /> },
        { value: '/graph', label: t('nav.graph2d'), icon: <Network size={NAV_ICON_SIZE} /> },
        { value: '/graph3d', label: t('nav.graph3d'), icon: <Box size={NAV_ICON_SIZE} /> },
      ],
    },
    {
      label: t('nav.groupStats'),
      children: [
        { value: '/stats', label: t('nav.statistics'), icon: <LineChart size={NAV_ICON_SIZE} /> },
      ],
    },
  ];
}

/** Longest matching item value for the current path (handles sub-routes like /camera/:id). */
function findActiveValue(branches, pathname) {
  const values = branches.flatMap((b) => b.children.map((c) => c.value));
  return (
    values
      .filter((v) => pathname === v || pathname.startsWith(`${v}/`))
      .sort((a, b) => b.length - a.length)[0] ?? ''
  );
}

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
  const location = useLocation();
  const cameras = useCameraList(15000);
  const clock = useLiveClock(locale);

  const onlineCameras = cameras.filter((c) => c.is_online).length;
  const totalCameras = cameras.length;
  const allOnline = totalCameras > 0 && onlineCameras === totalCameras;

  const navBranches = useMemo(() => buildNavBranches(t), [t]);
  const activeValue = useMemo(() => findActiveValue(navBranches, location.pathname), [navBranches, location.pathname]);
  const settingsActive = location.pathname === '/settings';

  return (
    <TooltipProvider delayDuration={200}>
      <div className="gb-console flex h-screen w-screen overflow-hidden text-[14px]">
        {/* NAV RAIL */}
        <aside className="gb-grid-texture flex w-[240px] flex-none flex-col gap-4 overflow-y-auto border-r border-gb-border bg-gb-surface px-4 py-4">
          <NavLink to="/dashboard" className="flex items-center gap-2.5 px-1">
            <span className="flex size-9 flex-none items-center justify-center rounded-[7px] bg-gb-primary/10">
              <NemopointMark size={26} />
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-gb-muted-foreground/70">
              Watch
            </span>
          </NavLink>

          <BranchedMenu
            items={navBranches}
            defaultOpen={[0, 1, 2]}
            defaultActive={activeValue}
            onSelect={(value) => navigate(value)}
            color="var(--gb-foreground)"
            accentColor="var(--gb-primary)"
            lineColor="var(--gb-border)"
            width={208}
            rowHeight={34}
            indent={36}
            trunk={12}
            radius={9}
            lineWidth={1.5}
            fontSize={13}
            drawDuration={400}
            foldDuration={300}
          />

          <NavLink
            to="/settings"
            className={`mt-auto flex items-center gap-2 rounded-[7px] px-2.5 py-2 text-[13px] transition-colors ${
              settingsActive
                ? 'bg-gb-primary/12 text-gb-primary'
                : 'text-gb-muted-foreground hover:bg-gb-accent hover:text-gb-foreground'
            }`}
          >
            <Settings size={16} />
            {t('nav.settings')}
          </NavLink>
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
