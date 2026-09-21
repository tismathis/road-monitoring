import { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Car, Bus, User, Video, Download } from 'lucide-react';

import { ConsoleLayout } from '../layouts/ConsoleLayout';
import { ParkingStatsPanel } from '../components/parking/ParkingStatsPanel';
import { useGenericCameraData, useCameraList } from '../hooks/useGenericCameraData';
import { getAuthStreamUrl } from '../utils/authFetch';
import { exportCameraDataToExcel, exportHistoryToCSV } from '../utils/exportCameraData';
import { useTranslation } from '../i18n/LanguageContext';
import { Button } from '../components/console-ui/button';
import { StatTile } from '../components/console-ui/panel';
import { GbBarChart, GbLineChart } from '../components/console-ui/charts';
import { GbLoading } from '../components/console-ui/loading';

export function LiveCameraPage() {
  const { t } = useTranslation();
  const { cameraId = 'traffic_main_gaborone' } = useParams();
  const [heatmapOn, setHeatmapOn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const imgRef = useRef(null);
  const canvasRef = useRef(null);

  const cameras = useCameraList(10000);
  const currentCamera = cameras.find((cam) => cam.id === cameraId);
  const isParkingCamera = currentCamera?.type === 'parking';

  const stats = useGenericCameraData(cameraId, 'stats', 3000);
  const history = useGenericCameraData(cameraId, 'history', 3000);
  const allHeatmapPoints = useGenericCameraData(cameraId, 'heatmap-points', 1000);
  const heatmapPoints = heatmapOn ? allHeatmapPoints : [];
  const kpis = useGenericCameraData(cameraId, 'kpis', 3000);

  useEffect(() => {
    if (Object.keys(stats).length > 0) setIsLoading(false);
  }, [stats]);

  // Heatmap canvas draw — preserved exactly
  useEffect(() => {
    if (!heatmapOn || !canvasRef.current || !imgRef.current) return;
    const canvas = canvasRef.current;
    const img = imgRef.current;
    canvas.width = img.clientWidth;
    canvas.height = img.clientHeight;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'lighter';

    heatmapPoints.forEach((p) => {
      const x = p.x * canvas.width;
      const y = p.y * canvas.height;
      const rx = Math.max(p.w * canvas.width, 20) / 2.5;
      const ry = Math.max(p.h * canvas.height, 20) / 2.5;
      const radius = Math.max(rx, ry);

      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, 'rgba(255, 0, 0, 0.22)');
      gradient.addColorStop(0.3, 'rgba(255, 165, 0, 0.16)');
      gradient.addColorStop(0.55, 'rgba(255, 255, 0, 0.10)');
      gradient.addColorStop(0.75, 'rgba(0, 255, 100, 0.06)');
      gradient.addColorStop(1, 'rgba(0, 100, 255, 0)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.globalCompositeOperation = 'source-over';
  }, [heatmapPoints, heatmapOn]);

  const totalObjects = Object.values(stats).reduce((a, b) => a + b, 0);
  const barData = Object.entries(stats).map(([name, count]) => ({ name: t(`object.${name}`), count }));

  const iconMap = { car: Car, bus: Bus, person: User };

  const handleExportExcel = () => {
    try {
      exportCameraDataToExcel(stats, history, heatmapPoints);
    } catch (error) {
      console.error('Export failed:', error);
      alert(t('export.failed'));
    }
  };

  const handleExportCSV = () => {
    try {
      exportHistoryToCSV(history);
    } catch (error) {
      console.error('CSV export failed:', error);
      alert(t('export.csvFailed'));
    }
  };

  return (
    <ConsoleLayout title={t('camera.title')}>
      <div className="mx-auto flex max-w-[1440px] flex-col gap-6">
        {isLoading && (
          <div className="flex items-center justify-center gap-3 rounded-[8px] border border-gb-primary/30 bg-gb-primary/8 p-4">
            <GbLoading size={28} />
            <span className="text-[13px] text-gb-primary">{t('camera.loading')}</span>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_1fr]">
          {/* LEFT: video */}
          <div className="rounded-[8px] border border-gb-border bg-gb-card p-5">
            <div className="relative overflow-hidden rounded-[6px] bg-black">
              <img
                ref={imgRef}
                src={getAuthStreamUrl(`http://127.0.0.1:8000/cameras/${cameraId}/stream`)}
                className="block w-full"
                alt={t('camera.alt')}
                onLoad={() => setImageError(false)}
                onError={() => setImageError(true)}
              />
              {imageError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/85 p-6 text-center">
                  <span className="text-[13px] text-gb-foreground">{t('camera.unavailable')}</span>
                  <span className="text-[11px] text-gb-muted-foreground">{t('camera.backend')}</span>
                </div>
              )}
              {heatmapOn && <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" />}
            </div>

            <div className="mt-4 flex flex-col gap-3">
              <Button variant={heatmapOn ? 'destructive' : 'default'} onClick={() => setHeatmapOn(!heatmapOn)} className="w-full">
                {heatmapOn ? t('camera.hideHeatmap') : t('camera.showHeatmap')}
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" onClick={handleExportExcel}>
                  <Download size={14} />
                  Excel
                </Button>
                <Button variant="outline" size="sm" onClick={handleExportCSV}>
                  <Download size={14} />
                  CSV
                </Button>
              </div>
            </div>

            <p className="mt-4 text-[11.5px] leading-relaxed text-gb-muted-foreground">
              {t('camera.note')}
              {heatmapOn && t('camera.heatmapNote')}
            </p>
          </div>

          {/* RIGHT: stats */}
          <div>
            {isParkingCamera ? (
              <ParkingStatsPanel kpis={kpis} stats={stats} />
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <StatTile value={totalObjects} label={t('camera.total')} icon={Video} />
                {Object.entries(stats).map(([cls, count]) => (
                  <StatTile key={cls} value={count} label={t(`object.${cls}`)} icon={iconMap[cls] || Video} />
                ))}
              </div>
            )}
          </div>
        </div>

        {!isParkingCamera && (
          <>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <StatTile value={kpis.flow_rate || 0} label="Flow Rate (veh/min)" icon={Car} />
              <StatTile value={kpis.occupancy_level || 'N/A'} label="Occupancy Level" icon={Video} />
              <StatTile value={kpis.average_dwell_time?.toFixed(1) || '0.0'} label="Avg Dwell Time (s)" icon={User} />
            </div>

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
              <div className="rounded-[8px] border border-gb-border bg-gb-card p-5">
                <GbBarChart data={barData} dataKey="count" xKey="name" title={t('camera.detectedByType')} height={230} />
              </div>
              <div className="rounded-[8px] border border-gb-border bg-gb-card p-5">
                <GbLineChart
                  data={history}
                  lines={[
                    { dataKey: 'car', color: 'var(--gb-success)', name: t('object.car') },
                    { dataKey: 'bus', color: 'var(--gb-warning)', name: t('object.bus') },
                    { dataKey: 'person', color: 'var(--gb-primary)', name: t('object.person') },
                  ]}
                  xKey="time"
                  title={t('camera.trafficOverTime')}
                  height={230}
                />
              </div>
            </div>

            <div className="rounded-[8px] border border-gb-border bg-gb-card p-5">
              <GbLineChart
                data={history}
                lines={[{ dataKey: 'flow_rate', color: 'var(--gb-primary)', name: 'Flow Rate (veh/min)' }]}
                xKey="time"
                title="Traffic Flow Rate Over Time"
                height={230}
                showLegend={false}
              />
            </div>
          </>
        )}
      </div>
    </ConsoleLayout>
  );
}
