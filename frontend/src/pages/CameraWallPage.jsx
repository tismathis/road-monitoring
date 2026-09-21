import { useNavigate } from 'react-router-dom';
import { Video, MapPin, Camera as CameraIcon, AlertTriangle, Clock } from 'lucide-react';

import { ConsoleLayout } from '../layouts/ConsoleLayout';
import { useCameraList } from '../hooks/useGenericCameraData';
import { getAuthStreamUrl } from '../utils/authFetch';
import { useTranslation } from '../i18n/LanguageContext';
import { Badge } from '../components/console-ui/badge';
import { SectionHeader } from '../components/console-ui/panel';
import { GbLoading } from '../components/console-ui/loading';
import { NemopointMark } from '../components/console-ui/nemopoint-mark';

// Nemopoint mark styling on each camera tile — tweak these to adjust the look.
const TILE_MARK_INSET = 'inset-0'; // gap from the tile's edges; inset-0 = fills the whole tile
const TILE_MARK_OPACITY = 'opacity-[0.22]';

export function CameraWallPage() {
  const { t } = useTranslation();
  const cameras = useCameraList(5000);
  const navigate = useNavigate();

  const onlineCount = cameras.filter((c) => c.is_online).length;
  const offlineCount = cameras.length - onlineCount;

  return (
    <ConsoleLayout title="Camera Wall">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-5">
        {/* inline system health strip — not a card, matches the console's restraint */}
        <div className="flex items-center gap-6 rounded-[8px] border border-gb-border bg-gb-card px-4 py-3 text-[12.5px] text-gb-muted-foreground">
          <div className="flex items-center gap-2">
            <CameraIcon size={15} className="text-gb-success" />
            <span>
              <strong className="gb-num text-gb-foreground">{onlineCount}</strong> {t('console.live').toLowerCase()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <AlertTriangle size={15} className="text-gb-muted-foreground" />
            <span>
              <strong className="gb-num text-gb-foreground">{offlineCount}</strong> {t('console.offline').toLowerCase()}
            </span>
          </div>
          <Badge variant="success" className="ml-auto">
            {t('console.systemNormal')}
          </Badge>
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_300px]">
          {/* LEFT: camera grid */}
          <div>
            {cameras.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 rounded-[8px] border border-gb-border bg-gb-card py-20">
                <GbLoading />
                <div className="text-[13px] text-gb-muted-foreground">No cameras available</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {cameras.map((camera) => (
                  <button
                    key={camera.id}
                    type="button"
                    onClick={() => navigate(`/camera/${camera.id}`)}
                    className="group flex flex-col overflow-hidden rounded-[8px] border border-gb-border bg-gb-card text-left transition-colors hover:border-gb-primary/40"
                  >
                    <div className="relative aspect-video bg-gb-background-2">
                      {/* Nemopoint mark plays as the tile's live preview — behind the real
                          thumbnail, so it reads through whenever the feed frame is slow to
                          arrive or unavailable, rather than leaving a blank box. */}
                      <div className={`absolute ${TILE_MARK_INSET} flex items-center justify-center ${TILE_MARK_OPACITY}`}>
                        <NemopointMark size="fill" loop grey className="shrink-0" />
                      </div>
                      <img
                        src={getAuthStreamUrl(camera.thumbnail_url)}
                        alt={camera.name}
                        className="relative h-full w-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                      <div className="absolute left-2 top-2 flex items-center gap-1.5 rounded-[4px] bg-black/60 px-1.5 py-0.5">
                        <span className={`size-1.5 rounded-full ${camera.is_online ? 'bg-gb-success' : 'bg-gb-muted-foreground'}`} />
                        <span className={`text-[9px] font-bold uppercase tracking-wide ${camera.is_online ? 'text-gb-success' : 'text-gb-muted-foreground'}`}>
                          {camera.is_online ? t('console.live') : t('console.offline')}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-start justify-between gap-2 p-3">
                      <div className="min-w-0">
                        <div className="truncate text-[13px] font-semibold text-gb-foreground">{camera.name}</div>
                        <div className="mt-0.5 flex items-center gap-1 truncate text-[11px] text-gb-muted-foreground">
                          <MapPin size={11} />
                          {camera.location}
                        </div>
                      </div>
                    </div>
                    {camera.stats_preview && Object.keys(camera.stats_preview).length > 0 && (
                      <div className="flex flex-wrap gap-1.5 px-3 pb-3">
                        {Object.entries(camera.stats_preview).map(([key, val]) => (
                          <Badge key={key} variant="default" className="gb-num">
                            {key}: {val}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: alerts panel */}
          <div className="rounded-[8px] border border-gb-border bg-gb-card p-5">
            <SectionHeader title="Active Alerts" tone="warning" />
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <Clock size={30} className="text-gb-muted-foreground/40" />
              <div className="text-[13px] font-medium text-gb-foreground">No active alerts</div>
              <div className="text-[11.5px] text-gb-muted-foreground">Crash detection coming soon</div>
            </div>
          </div>
        </div>
      </div>
    </ConsoleLayout>
  );
}
