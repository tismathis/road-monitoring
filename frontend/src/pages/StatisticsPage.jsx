import { StatCard } from '../components/stats/StatCard';
import { BarChartCard } from '../components/charts/BarChartCard';
import { LineChartCard } from '../components/charts/LineChartCard';
import { PieChartCard } from '../components/charts/PieChartCard';
import { useStatsData } from '../hooks/useStatsData';
import { tokens } from '../styles/tokens';
import { AlertTriangle, Skull } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';

const SEVERITY_COLORS = {
  fatal: tokens.colors.severity.fatal,
  serious_injury: tokens.colors.severity.serious,
  minor: tokens.colors.severity.minor
};

/**
 * StatisticsPage - Historical crash statistics dashboard
 */
export function StatisticsPage() {
  const { t } = useTranslation();
  const { byYear, bySeverity, totalCrashes, totalFatalities, loading } = useStatsData();
  const localizedSeverityData = bySeverity.map((row) => ({
    ...row,
    severity: t(`severity.${row.severity}`),
  }));

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        fontSize: tokens.typography.fontSize.lg,
        color: tokens.colors.neutral[500]
      }}>
        {t('stats.loading')}
      </div>
    );
  }

  const containerStyles = {
    maxWidth: tokens.layout.maxContentWidth,
    margin: '0 auto',
  };

  const headingStyles = {
    fontSize: tokens.typography.fontSize['3xl'],
    fontWeight: tokens.typography.fontWeight.semibold,
    color: tokens.colors.neutral[900],
    marginBottom: tokens.spacing.xl,
  };

  const gridStyles = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: tokens.spacing.xl,
    marginBottom: tokens.spacing.xl,
  };

  const chartGridStyles = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
    gap: tokens.spacing.xl,
  };

  return (
    <div style={containerStyles}>
      <h1 style={headingStyles}>{t('stats.title')}</h1>

      {/* Summary stat cards */}
      <div style={gridStyles}>
        <StatCard
          value={totalCrashes}
          label={t('stats.totalCrashes')}
          icon={AlertTriangle}
          trend={{ direction: 'neutral', percentage: 0 }}
        />
        <StatCard
          value={totalFatalities}
          label={t('stats.totalDeaths')}
          icon={Skull}
          trend={{ direction: 'down', percentage: 0 }}
        />
      </div>

      {/* Charts grid */}
      <div style={chartGridStyles}>
        {/* Crashes by year - bar chart */}
        <div style={{ gridColumn: 'span 2' }}>
          <BarChartCard
            data={byYear}
            dataKey="total"
            xKey="year"
            title={t('stats.crashesByYear')}
            color={tokens.colors.chart.secondary}
            height={300}
          />
        </div>

        {/* Fatalities trend - line chart */}
        <div style={{ gridColumn: 'span 2' }}>
          <LineChartCard
            data={byYear}
            lines={[
              { dataKey: 'fatalities', color: tokens.colors.severity.fatal, name: t('stats.deaths') }
            ]}
            xKey="year"
            title={t('stats.deathTrend')}
            height={300}
          />
        </div>

        {/* Severity distribution - pie chart */}
        <PieChartCard
          data={localizedSeverityData}
          dataKey="total"
          nameKey="severity"
          title={t('stats.severityDistribution')}
          colors={[
            SEVERITY_COLORS.fatal,
            SEVERITY_COLORS.serious_injury,
            SEVERITY_COLORS.minor
          ]}
          height={300}
        />
      </div>
    </div>
  );
}
