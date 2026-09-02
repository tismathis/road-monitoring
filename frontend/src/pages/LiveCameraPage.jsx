import { useState, useRef, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatCard } from '../components/stats/StatCard';
import { BarChartCard } from '../components/charts/BarChartCard';
import { LineChartCard } from '../components/charts/LineChartCard';
import { useCameraStats } from '../hooks/useCameraStats';
import { useCameraHistory } from '../hooks/useCameraHistory';
import { useHeatmapPoints } from '../hooks/useHeatmapPoints';
import { endpoints } from '../utils/api';
import { tokens } from '../styles/tokens';
import { Car, Bus, User, Video, Download } from 'lucide-react';
import { exportCameraDataToExcel, exportHistoryToCSV } from '../utils/exportCameraData';
import { useTranslation } from '../i18n/LanguageContext';

/**
 * LiveCameraPage - Real-time camera analytics with MJPEG stream and heatmap
 */
export function LiveCameraPage() {
  const { t } = useTranslation();
  const [heatmapOn, setHeatmapOn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const imgRef = useRef(null);
  const canvasRef = useRef(null);

  // Use our custom hooks for data fetching
  const stats = useCameraStats(3000); // Poll every 3 seconds
  const history = useCameraHistory(3000);
  const heatmapPoints = useHeatmapPoints(heatmapOn, 1000); // Poll every 1 second when enabled

  // Check when data starts arriving
  useEffect(() => {
    if (Object.keys(stats).length > 0) {
      setIsLoading(false);
    }
  }, [stats]);

  // Draw heatmap on canvas - PRESERVE EXACT LOGIC
  useEffect(() => {
    if (!heatmapOn || !canvasRef.current || !imgRef.current) return;
    const canvas = canvasRef.current;
    const img = imgRef.current;
    canvas.width = img.clientWidth;
    canvas.height = img.clientHeight;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'lighter';

    heatmapPoints.forEach(p => {
      const x = p.x * canvas.width;
      const y = p.y * canvas.height;
      const rx = Math.max(p.w * canvas.width, 20) / 2.5;
      const ry = Math.max(p.h * canvas.height, 20) / 2.5;
      const radius = Math.max(rx, ry);

      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0,    'rgba(255, 0, 0, 0.22)');
      gradient.addColorStop(0.3,  'rgba(255, 165, 0, 0.16)');
      gradient.addColorStop(0.55, 'rgba(255, 255, 0, 0.10)');
      gradient.addColorStop(0.75, 'rgba(0, 255, 100, 0.06)');
      gradient.addColorStop(1,    'rgba(0, 100, 255, 0)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.globalCompositeOperation = 'source-over';
  }, [heatmapPoints, heatmapOn]);

  // Calculate totals and chart data
  const totalObjects = Object.values(stats).reduce((a, b) => a + b, 0);
  const barData = Object.entries(stats).map(([name, count]) => ({ name: t(`object.${name}`), count }));

  // Icon mapping for stat cards
  const iconMap = {
    car: Car,
    bus: Bus,
    person: User,
  };

  const containerStyles = {
    maxWidth: tokens.layout.maxContentWidth,
    margin: '0 auto',
    width: '100%',
  };

  const headingStyles = {
    fontSize: tokens.typography.fontSize['3xl'],
    fontWeight: tokens.typography.fontWeight.semibold,
    color: tokens.colors.text.primary,
    marginBottom: tokens.spacing.xl,
  };

  // Export handlers
  const handleExportExcel = () => {
    try {
      const filename = exportCameraDataToExcel(stats, history, heatmapPoints);
      console.log(`Exported to: ${filename}`);
    } catch (error) {
      console.error('Export failed:', error);
      alert(t('export.failed'));
    }
  };

  const handleExportCSV = () => {
    try {
      const filename = exportHistoryToCSV(history);
      console.log(`Exported history to: ${filename}`);
    } catch (error) {
      console.error('CSV export failed:', error);
      alert(t('export.csvFailed'));
    }
  };

  const mainGridStyles = {
    display: 'grid',
    gridTemplateColumns: '1.2fr 1fr',
    gap: tokens.spacing.xl,
    marginBottom: tokens.spacing.xl,
  };

  const videoContainerStyles = {
    position: 'relative',
  };

  const imgStyles = {
    width: '100%',
    borderRadius: tokens.borderRadius.lg,
    background: '#000',
    display: 'block',
  };

  const canvasStyles = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    borderRadius: tokens.borderRadius.lg,
  };

  const noteStyles = {
    fontSize: tokens.typography.fontSize.xs,
    color: tokens.colors.text.secondary,
    marginTop: tokens.spacing.md,
    lineHeight: tokens.typography.lineHeight.relaxed,
  };

  const statGridStyles = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: tokens.spacing.md,
  };

  // Debug: log stats to see if data is coming
  console.log('Camera stats:', stats);
  console.log('Camera history:', history);

  return (
    <div style={containerStyles}>
      <h1 style={headingStyles}>
        <Video size={32} style={{ display: 'inline', marginRight: tokens.spacing.md, verticalAlign: 'middle' }} />
        {t('camera.title')}
      </h1>

      {/* Loading indicator */}
      {isLoading && (
        <div style={{
          padding: tokens.spacing.xl,
          backgroundColor: 'rgba(16, 185, 129, 0.15)',
          borderRadius: tokens.borderRadius.md,
          marginBottom: tokens.spacing.lg,
          textAlign: 'center',
          color: tokens.colors.primary[500],
          fontSize: tokens.typography.fontSize.base,
          border: `1px solid ${tokens.colors.primary[500]}40`
        }}>
          🔄 {t('camera.loading')}
        </div>
      )}

      {/* Debug info */}
      <div style={{
        padding: tokens.spacing.md,
        backgroundColor: 'rgba(31, 31, 36, 0.6)',
        borderRadius: tokens.borderRadius.md,
        marginBottom: tokens.spacing.lg,
        fontSize: tokens.typography.fontSize.sm,
        color: tokens.colors.text.secondary,
        border: `1px solid ${tokens.colors.border.default}`
      }}>
        <strong style={{ color: tokens.colors.text.primary }}>{t('camera.debug')}</strong> {t('camera.statsLoaded')} {Object.keys(stats).length > 0 ? t('common.yes') : t('common.noWaiting')}
        {' | '}
        {t('camera.history')} {history.length} {t('camera.points')}
        {' | '}
        {t('camera.totalObjects')} {totalObjects}
      </div>

      <div style={mainGridStyles}>
        {/* Left column: Video feed */}
        <div>
          <Card padding="lg">
            <div style={videoContainerStyles}>
              <img
                ref={imgRef}
                src={endpoints.cameraStream}
                style={imgStyles}
                alt={t('camera.alt')}
                onLoad={() => setImageError(false)}
                onError={() => setImageError(true)}
              />
              {imageError && (
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  padding: tokens.spacing.xl,
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  color: '#fff',
                  borderRadius: tokens.borderRadius.md,
                  textAlign: 'center',
                  fontSize: tokens.typography.fontSize.sm,
                  zIndex: 10
                }}>
                  ⚠️ {t('camera.unavailable')}<br/>
                  <small>{t('camera.backend')}</small>
                </div>
              )}
              {heatmapOn && (
                <canvas
                  ref={canvasRef}
                  style={canvasStyles}
                />
              )}
            </div>

            <div style={{ marginTop: tokens.spacing.lg, display: 'flex', flexDirection: 'column', gap: tokens.spacing.md }}>
              <Button
                variant={heatmapOn ? 'danger' : 'primary'}
                onClick={() => setHeatmapOn(!heatmapOn)}
                fullWidth
              >
                {heatmapOn ? t('camera.hideHeatmap') : t('camera.showHeatmap')}
              </Button>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.spacing.sm }}>
                <Button
                  variant="secondary"
                  icon={Download}
                  onClick={handleExportExcel}
                  size="sm"
                >
                  Excel
                </Button>
                <Button
                  variant="secondary"
                  icon={Download}
                  onClick={handleExportCSV}
                  size="sm"
                >
                  CSV
                </Button>
              </div>
            </div>

            <div style={noteStyles}>
              {t('camera.note')}
              {heatmapOn && t('camera.heatmapNote')}
            </div>
          </Card>
        </div>

        {/* Right column: Stats */}
        <div>
          <div style={statGridStyles}>
            <StatCard
              value={totalObjects}
              label={t('camera.total')}
              icon={Video}
            />
            {Object.entries(stats).map(([cls, count]) => (
              <StatCard
                key={cls}
                value={count}
                label={t(`object.${cls}`)}
                icon={iconMap[cls] || Video}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.spacing.xl }}>
        <BarChartCard
          data={barData}
          dataKey="count"
          xKey="name"
          title={t('camera.detectedByType')}
          color={tokens.colors.chart.secondary}
          height={250}
        />

        <LineChartCard
          data={history}
          lines={[
            { dataKey: 'car', color: tokens.colors.chart.secondary, name: t('object.car') },
            { dataKey: 'bus', color: tokens.colors.chart.tertiary, name: t('object.bus') },
            { dataKey: 'person', color: tokens.colors.chart.primary, name: t('object.person') }
          ]}
          xKey="time"
          title={t('camera.trafficOverTime')}
          height={250}
        />
      </div>
    </div>
  );
}
