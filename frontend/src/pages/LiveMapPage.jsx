import { useMemo, useState } from 'react';
import { AlertTriangle, Car, Camera as CameraIcon, Check, Gauge, SquareParking } from 'lucide-react';

import { ConsoleLayout } from '../layouts/ConsoleLayout';
import { MapView } from '../components/map/MapView';
import { useRoadData } from '../hooks/useRoadData';
import { useCrashData } from '../hooks/useCrashData';
import { useCameraList, useGenericCameraData } from '../hooks/useGenericCameraData';
import { useTranslation } from '../i18n/LanguageContext';
import { mockIncidents } from '../utils/mockData';

import { Badge } from '../components/console-ui/badge';
import { Separator } from '../components/console-ui/separator';
import { ScrollArea } from '../components/console-ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger } from '../components/console-ui/tooltip';
import { GbLoading } from '../components/console-ui/loading';

const CAMERA_LOCATION = [-24.6539, 25.9010];
const TRAFFIC_CAMERA_ID = 'traffic_main_gaborone';
const PARKING_CAMERA_ID = 'parking_gaborone_lot1';

export function LiveMapPage() {
  const { t } = useTranslation();

  const { roads, points, loading: roadsLoading } = useRoadData();
  const { crashes, loading: crashesLoading } = useCrashData();
  const cameras = useCameraList(10000);
  const trafficKpis = useGenericCameraData(TRAFFIC_CAMERA_ID, 'kpis', 15000);
  const parkingKpis = useGenericCameraData(PARKING_CAMERA_ID, 'kpis', 15000);

  const vehicleCount = useMemo(() => {
    const traffic = cameras.filter((c) => c.type === 'traffic');
    if (traffic.length === 0) return null;
    return traffic.reduce((sum, c) => {
      const preview = c.stats_preview || {};
      return sum + (preview.car || 0) + (preview.bus || 0) + (preview.truck || 0);
    }, 0);
  }, [cameras]);

  const onlineCameras = cameras.filter((c) => c.is_online).length;
  const totalCameras = cameras.length;

  const flowLabel = { Low: t('console.flowLow'), Moderate: t('console.flowModerate'), Heavy: t('console.flowHeavy') }[
    trafficKpis?.occupancy_level
  ];
  const flowTone = { Low: 'text-gb-success', Moderate: 'text-gb-warning', Heavy: 'text-gb-destructive' }[
    trafficKpis?.occupancy_level
  ];

  const parkingRate =
    typeof parkingKpis?.occupancy_rate === 'number' ? Math.round(parkingKpis.occupancy_rate) : null;

  const incidents = useMemo(() => [...mockIncidents].sort((a, b) => b.urgency - a.urgency), []);
  const [acked, setAcked] = useState(() => new Set());
  const toggleAck = (id) =>
    setAcked((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const isLoading = roadsLoading || crashesLoading;

  return (
      <ConsoleLayout title={t('nav.map')} noPadding>
        <div className="flex min-h-0 flex-1">
          <div className="relative flex-1 bg-gb-background-2">
            {isLoading ? (
              <div className="flex h-full items-center justify-center">
                <GbLoading label={t('map.loading')} />
              </div>
            ) : (
              <MapView
                center={CAMERA_LOCATION}
                zoom={15}
                roads={roads}
                points={points}
                crashes={crashes}
                cameraPosition={CAMERA_LOCATION}
                showLegend
                zoomControl
              />
            )}
            <div className="pointer-events-none absolute bottom-4 left-4 text-[10px] text-gb-muted-foreground">
              {t('console.scale')} 1:5,000 · N ↑
            </div>
          </div>

          {/* RIGHT DOCK */}
          <aside className="flex w-[336px] flex-none flex-col border-l border-gb-border bg-gb-surface">
            <ScrollArea className="flex-1">
              <div className="flex items-center gap-2 px-5 pb-3 pt-5">
                <span className="h-3 w-[3px] rounded-full bg-gb-primary" />
                <span className="text-[11.5px] font-semibold uppercase tracking-[0.08em] text-gb-foreground/80">
                  {t('console.networkStatus')}
                </span>
              </div>

              <div className="flex flex-col px-2">
                <KpiRow icon={Car} label={t('console.vehicleCount')} value={vehicleCount ?? '—'} />
                <Separator />
                <KpiRow
                  icon={Gauge}
                  label={t('console.trafficFlow')}
                  value={flowLabel || '—'}
                  valueClassName={flowTone}
                  iconClassName={flowTone}
                />
                <Separator />
                <KpiRow
                  icon={SquareParking}
                  label={t('console.parkingOcc')}
                  value={parkingRate !== null ? `${parkingRate}%` : '—'}
                />
                <Separator />
                <KpiRow
                  icon={CameraIcon}
                  label={t('console.activeCameras')}
                  value={totalCameras > 0 ? `${onlineCameras}/${totalCameras}` : '—'}
                />
                <Separator />
                <KpiRow
                  icon={AlertTriangle}
                  label={t('console.incidents')}
                  value={incidents.length}
                  valueClassName={incidents.length > 0 ? 'text-gb-destructive' : undefined}
                  iconClassName={incidents.length > 0 ? 'text-gb-destructive' : undefined}
                />
              </div>

              <Separator className="mt-2" />

              <div className="flex items-center gap-2 px-5 pb-3 pt-5">
                <span className="h-3 w-[3px] rounded-full bg-gb-destructive" />
                <span className="flex-1 text-[11.5px] font-semibold uppercase tracking-[0.08em] text-gb-foreground/80">
                  {t('console.incidents')}
                </span>
                <Badge variant="destructive" className="px-2 py-0.5 text-[11px]">
                  {incidents.length}
                </Badge>
              </div>

              <div className="flex flex-col pb-6">
                {incidents.map((incident) => {
                  const isCritical = incident.severity === 'fatal' || incident.severity === 'serious';
                  const isAcked = acked.has(incident.id);
                  return (
                    <div key={incident.id} className="border-t border-gb-border px-5 py-4">
                      <div className="mb-1.5 flex items-start gap-2.5">
                        <span
                          className={`mt-1.5 size-2 shrink-0 rounded-full ${
                            isCritical ? 'bg-gb-destructive' : 'bg-gb-warning'
                          }`}
                        />
                        <span
                          className={`flex-1 text-[13.5px] font-semibold leading-snug ${
                            isAcked ? 'text-gb-muted-foreground line-through' : 'text-gb-foreground'
                          }`}
                        >
                          {t(`incident.title.${incident.id}`)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pl-[18px]">
                        <div className="min-w-0">
                          <div className="truncate text-[12px] text-gb-muted-foreground">{incident.location}</div>
                          <div className="gb-num text-[11px] text-gb-muted-foreground/70">{incident.timestamp}</div>
                        </div>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              onClick={() => toggleAck(incident.id)}
                              aria-label={t('console.acknowledge')}
                              aria-pressed={isAcked}
                              className={`flex size-8 shrink-0 items-center justify-center rounded-[6px] border transition-colors ${
                                isAcked
                                  ? 'border-gb-success/50 bg-gb-success/12 text-gb-success'
                                  : 'border-gb-border text-gb-muted-foreground hover:border-gb-primary/50 hover:text-gb-primary'
                              }`}
                            >
                              <Check size={15} strokeWidth={2.5} />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="left">{t('console.acknowledge')}</TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </aside>
        </div>
      </ConsoleLayout>
  );
}

function KpiRow({ icon: Icon, label, value, valueClassName = '', iconClassName = '' }) {
  return (
    <div className="flex items-center gap-3 rounded-[8px] px-3 py-3 transition-colors hover:bg-gb-accent/60">
      <div
        className={`flex size-8 shrink-0 items-center justify-center rounded-[7px] bg-gb-background-2 text-gb-muted-foreground ${iconClassName}`}
      >
        <Icon size={16} strokeWidth={2} />
      </div>
      <span className="flex-1 text-[12.5px] text-gb-muted-foreground">{label}</span>
      <span className={`gb-num text-[21px] font-semibold leading-none text-gb-foreground ${valueClassName}`}>
        {value}
      </span>
    </div>
  );
}
