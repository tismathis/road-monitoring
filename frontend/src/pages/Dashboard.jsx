import { Car, Gauge, Users, AlertTriangle, Video, AlertCircle, MapPin } from 'lucide-react';

import { ConsoleLayout } from '../layouts/ConsoleLayout';
import { useCameraStats } from '../hooks/useCameraStats';
import { mockIncidents, mockSparklineData, mockKeyMetrics } from '../utils/mockData';
import { useTranslation } from '../i18n/LanguageContext';
import { StatTile, SectionHeader } from '../components/console-ui/panel';
import { IncidentPanel } from '../components/console-ui/incident-panel';

export function Dashboard() {
  const { t } = useTranslation();
  const cameraStats = useCameraStats(3000);

  const vehicleCount = (cameraStats.car || 0) + (cameraStats.bus || 0);
  const pedestrianCount = cameraStats.person || 0;

  return (
    <ConsoleLayout title={t('nav.dashboard')}>
      <div className="mx-auto flex max-w-[1440px] flex-col gap-8">
        <div>
          <SectionHeader title={t('dashboard.title')} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatTile
              icon={Video}
              label={t('dashboard.cameras')}
              value={`${mockKeyMetrics.camerasConnected.current}/${mockKeyMetrics.camerasConnected.total}`}
            />
            <StatTile
              icon={AlertCircle}
              label={t('dashboard.alerts')}
              value={mockKeyMetrics.alerts24h}
              valueClassName="text-gb-warning"
            />
            <StatTile icon={MapPin} label={t('dashboard.zones')} value={mockKeyMetrics.zonesMonitored} />
          </div>
        </div>

        <div>
          <SectionHeader title={t('dashboard.realtime')} />
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatTile
              value={vehicleCount}
              label={t('dashboard.vehicles')}
              icon={Car}
              trend={{ direction: 'up', percentage: 12.5 }}
              sparklineData={mockSparklineData.vehicles}
            />
            <StatTile
              value={45}
              label={t('dashboard.speed')}
              suffix="km/h"
              icon={Gauge}
              trend={{ direction: 'neutral', percentage: 0 }}
              sparklineData={mockSparklineData.speed}
            />
            <StatTile
              value={pedestrianCount}
              label={t('dashboard.pedestrians')}
              icon={Users}
              trend={{ direction: 'down', percentage: 5.2 }}
              sparklineData={mockSparklineData.pedestrians}
            />
            <StatTile
              value={mockIncidents.length}
              label={t('dashboard.activeIncidents')}
              icon={AlertTriangle}
              trend={{ direction: 'neutral', percentage: 0 }}
              sparklineData={mockSparklineData.incidents}
            />
          </div>
        </div>

        <div>
          <SectionHeader title={t('dashboard.recentIncidents')} tone="destructive" />
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {mockIncidents.slice(0, 4).map((incident) => (
              <IncidentPanel key={incident.id} incident={incident} />
            ))}
          </div>
        </div>
      </div>
    </ConsoleLayout>
  );
}
