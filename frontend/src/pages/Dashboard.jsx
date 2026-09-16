import { StatCard } from '../components/stats/StatCard';
import { KeyMetricCard } from '../components/stats/KeyMetricCard';
import { IncidentCard } from '../components/stats/IncidentCard';
import { useCameraStats } from '../hooks/useCameraStats';
import { mockIncidents, mockSparklineData, mockKeyMetrics } from '../utils/mockData';
import { tokens } from '../styles/tokens';
import { Car, Gauge, Users, AlertTriangle, Video, AlertCircle, MapPin } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';

/**
 * Dashboard - Overview page with key metrics and recent incidents
 * Light theme with Infosys Blue branding
 */
export function Dashboard() {
  const { t } = useTranslation();
  // Get real camera stats
  const cameraStats = useCameraStats(3000);

  // Calculate real vehicle count
  const vehicleCount = (cameraStats.car || 0) + (cameraStats.bus || 0);
  const pedestrianCount = cameraStats.person || 0;

  const containerStyles = {
    maxWidth: tokens.layout.maxContentWidth,
    margin: '0 auto',
  };

  const headingStyles = {
    fontFamily: tokens.typography.fontFamily.heading,
    fontSize: tokens.typography.fontSize['3xl'],
    fontWeight: tokens.typography.fontWeight.semibold,
    color: tokens.colors.text.primary,
    marginBottom: tokens.spacing.xl,
  };

  const sectionTitleStyles = {
    fontFamily: tokens.typography.fontFamily.heading,
    fontSize: tokens.typography.fontSize.xl,
    fontWeight: tokens.typography.fontWeight.semibold,
    color: tokens.colors.text.primary,
    marginBottom: tokens.spacing.lg,
    marginTop: tokens.spacing['2xl'],
  };

  const keyMetricsGridStyles = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: tokens.spacing.lg,
    marginBottom: tokens.spacing['2xl'],
  };

  const statCardsGridStyles = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: tokens.spacing.lg,
    marginBottom: tokens.spacing['2xl'],
  };

  const incidentsGridStyles = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: tokens.spacing.lg,
  };

  return (
    <div style={containerStyles}>
      <h1 style={headingStyles}>{t('dashboard.title')}</h1>

      {/* Key Metrics Row */}
      <div style={keyMetricsGridStyles}>
        <KeyMetricCard
          icon={Video}
          label={t('dashboard.cameras')}
          value={`${mockKeyMetrics.camerasConnected.current}/${mockKeyMetrics.camerasConnected.total}`}
          status="success"
        />
        <KeyMetricCard
          icon={AlertCircle}
          label={t('dashboard.alerts')}
          value={mockKeyMetrics.alerts24h}
          status="warning"
        />
        <KeyMetricCard
          icon={MapPin}
          label={t('dashboard.zones')}
          value={mockKeyMetrics.zonesMonitored}
          status="success"
        />
      </div>

      {/* Main Statistics Cards */}
      <h2 style={sectionTitleStyles}>{t('dashboard.realtime')}</h2>
      <div style={statCardsGridStyles}>
        <StatCard
          value={vehicleCount}
          label={t('dashboard.vehicles')}
          icon={Car}
          trend={{ direction: 'up', percentage: 12.5 }}
          sparklineData={mockSparklineData.vehicles}
        />
        <StatCard
          value={45}
          label={t('dashboard.speed')}
          suffix="km/h"
          icon={Gauge}
          trend={{ direction: 'neutral', percentage: 0 }}
          sparklineData={mockSparklineData.speed}
        />
        <StatCard
          value={pedestrianCount}
          label={t('dashboard.pedestrians')}
          icon={Users}
          trend={{ direction: 'down', percentage: 5.2 }}
          sparklineData={mockSparklineData.pedestrians}
        />
        <StatCard
          value={mockIncidents.length}
          label={t('dashboard.activeIncidents')}
          icon={AlertTriangle}
          trend={{ direction: 'neutral', percentage: 0 }}
          sparklineData={mockSparklineData.incidents}
        />
      </div>

      {/* Recent Incidents Section */}
      <h2 style={sectionTitleStyles}>{t('dashboard.recentIncidents')}</h2>
      <div style={incidentsGridStyles}>
        {mockIncidents.slice(0, 4).map(incident => (
          <IncidentCard key={incident.id} incident={incident} />
        ))}
      </div>
    </div>
  );
}
