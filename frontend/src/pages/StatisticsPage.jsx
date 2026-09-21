import { AlertTriangle, Skull } from 'lucide-react';

import { ConsoleLayout } from '../layouts/ConsoleLayout';
import { useStatsData } from '../hooks/useStatsData';
import { useTranslation } from '../i18n/LanguageContext';
import { StatTile } from '../components/console-ui/panel';
import { GbBarChart, GbLineChart, GbPieChart } from '../components/console-ui/charts';
import { GbLoading } from '../components/console-ui/loading';

export function StatisticsPage() {
  const { t } = useTranslation();
  const { byYear, bySeverity, totalCrashes, totalFatalities, loading } = useStatsData();
  const localizedSeverityData = bySeverity.map((row) => ({ ...row, severity: t(`severity.${row.severity}`) }));

  return (
    <ConsoleLayout title={t('stats.title')}>
      {loading ? (
        <div className="flex h-full items-center justify-center">
          <GbLoading label={t('stats.loading')} />
        </div>
      ) : (
        <div className="mx-auto flex max-w-[1440px] flex-col gap-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <StatTile value={totalCrashes} label={t('stats.totalCrashes')} icon={AlertTriangle} />
            <StatTile
              value={totalFatalities}
              label={t('stats.totalDeaths')}
              icon={Skull}
              valueClassName="text-gb-destructive"
            />
          </div>

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            <div className="rounded-[8px] border border-gb-border bg-gb-card p-5">
              <GbBarChart data={byYear} dataKey="total" xKey="year" title={t('stats.crashesByYear')} height={280} />
            </div>
            <div className="rounded-[8px] border border-gb-border bg-gb-card p-5">
              <GbLineChart
                data={byYear}
                lines={[{ dataKey: 'fatalities', color: 'var(--gb-destructive)', name: t('stats.deaths') }]}
                xKey="year"
                title={t('stats.deathTrend')}
                height={280}
                showLegend={false}
              />
            </div>
            <div className="rounded-[8px] border border-gb-border bg-gb-card p-5 xl:col-span-2">
              <GbPieChart
                data={localizedSeverityData}
                dataKey="total"
                nameKey="severity"
                title={t('stats.severityDistribution')}
                colors={['var(--gb-destructive)', 'var(--gb-warning)', '#8B7FD9']}
                height={300}
              />
            </div>
          </div>
        </div>
      )}
    </ConsoleLayout>
  );
}
