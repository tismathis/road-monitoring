import { AlertTriangle, Skull, MapPinned, ExternalLink } from 'lucide-react';

import { ConsoleLayout } from '../layouts/ConsoleLayout';
import { useStatsData } from '../hooks/useStatsData';
import { useTranslation } from '../i18n/LanguageContext';
import { StatTile, SectionHeader } from '../components/console-ui/panel';
import { Badge } from '../components/console-ui/badge';
import { GbBarChart, GbLineChart, GbPieChart, GbStackedBarChart } from '../components/console-ui/charts';
import { GbLoading } from '../components/console-ui/loading';

const SOURCES = [
  {
    name: 'Statistics Botswana — Transport & Infrastructure Statistics Report 2021',
    detail: 'Primary source for the 2012–2021 national accident, casualty and fatality series (Tables 2.1, 2.3, 8, 9, 10). Underlying data collected by the Botswana Police Service Road Traffic Accident Unit.',
    url: 'https://statsbots.org.bw/sites/default/files/publications/Transport%20&%20Infrastructure%20Statistics%20Report%202021.pdf',
  },
  {
    name: 'WHO — Global Status Report on Road Safety 2023, Botswana country profile',
    detail: 'Independent cross-check for 2021 fatalities (413 — an exact match) and the source of the 2021 road-user and sex breakdowns.',
    url: 'https://cdn.who.int/media/docs/default-source/country-profiles/road-safety/road-safety-2023-bwa.pdf',
  },
  {
    name: 'Botswana Daily News — "BPS records over 16 000 road accidents"',
    detail: 'Source for the 2022–2024 extension. Figures given by BPS Assistant Superintendent Itumeleng Maruru at the MVA Fund Regional Case Management conference, 24 Nov 2024. Not an official statistical publication — treated as provisional. The 2024 figure covers 1 Jan–24 Nov 2024 only.',
    url: 'https://dailynews.gov.bw/news-detail/83280',
  },
];

const ROAD_USER_LABELS = {
  car_occupant: 'Car occupants',
  pedestrian: 'Pedestrians',
  other_unknown: 'Other / unknown',
  cyclist: 'Cyclists',
  motorcyclist: 'Motorcyclists',
};

export function StatisticsPage() {
  const { t } = useTranslation();
  const {
    byYear,
    verifiedByYear,
    bySeverity,
    roadUserFatalities,
    greaterGaborone,
    totalCrashes,
    totalFatalities,
    loading,
  } = useStatsData();

  const localizedSeverityData = bySeverity.map((row) => ({ ...row, severity: t(`severity.${row.severity}`) || row.severity }));
  const roadUserChartData = (roadUserFatalities?.shares || [])
    .filter((s) => s.percent > 0)
    .map((s) => ({ user_type: ROAD_USER_LABELS[s.user_type] || s.user_type, percent: s.percent }));

  const yearRange = verifiedByYear.length > 0
    ? `${verifiedByYear[0].year}–${verifiedByYear[verifiedByYear.length - 1].year}`
    : '';

  return (
    <ConsoleLayout title={t('stats.title')}>
      {loading ? (
        <div className="flex h-full items-center justify-center">
          <GbLoading label={t('stats.loading')} />
        </div>
      ) : (
        <div className="mx-auto flex max-w-[1440px] flex-col gap-6">
          <div className="flex items-start gap-2 rounded-[8px] border border-gb-primary/25 bg-gb-primary/8 px-4 py-3 text-[12px] text-gb-muted-foreground">
            <MapPinned size={15} className="mt-0.5 shrink-0 text-gb-primary" />
            <span>
              Real Botswana road-safety data — Statistics Botswana &amp; Botswana Police Service, {yearRange}.
              See <a href="#stats-sources" className="text-gb-primary underline-offset-2 hover:underline">Data Sources</a> below for full citations.
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <StatTile
              value={totalCrashes.toLocaleString()}
              label={`${t('stats.totalCrashes')} (${yearRange}, national)`}
              icon={AlertTriangle}
            />
            <StatTile
              value={totalFatalities.toLocaleString()}
              label={`${t('stats.totalDeaths')} (${yearRange}, national)`}
              icon={Skull}
              valueClassName="text-gb-destructive"
            />
          </div>

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            <div className="rounded-[8px] border border-gb-border bg-gb-card p-5">
              <GbBarChart
                data={byYear}
                dataKey="total"
                xKey="year"
                title={t('stats.crashesByYear')}
                height={280}
                getOpacity={(row) => (row.is_estimate ? 0.45 : 1)}
              />
              <p className="mt-3 text-[11px] text-gb-muted-foreground">
                Lighter bars ({byYear.filter((r) => r.is_estimate).map((r) => r.year).join(', ')}) are provisional,
                news-sourced figures, not official statistics. {byYear.some((r) => r.is_partial_year) && 'The final year covers part of the calendar year only.'}
              </p>
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
              <p className="mt-3 text-[11px] text-gb-muted-foreground">
                National fatalities, police-reported. {yearRange} figures are complete-year official statistics.
              </p>
            </div>
            <div className="rounded-[8px] border border-gb-border bg-gb-card p-5 xl:col-span-2">
              <GbStackedBarChart
                data={verifiedByYear}
                bars={[
                  { dataKey: 'fatalities', name: t('severity.fatal'), color: 'var(--gb-destructive)' },
                  { dataKey: 'serious_injuries', name: t('severity.serious_injury'), color: 'var(--gb-warning)' },
                  { dataKey: 'minor_injuries', name: t('severity.minor'), color: '#8B7FD9' },
                ]}
                xKey="year"
                title={`Casualties by Severity, by Year (${yearRange})`}
                height={300}
              />
            </div>
            <div className="rounded-[8px] border border-gb-border bg-gb-card p-5">
              <GbPieChart
                data={localizedSeverityData}
                dataKey="total"
                nameKey="severity"
                title={`${t('stats.severityDistribution')} — ${bySeverity[0]?.year ?? ''}`}
                colors={['var(--gb-destructive)', 'var(--gb-warning)', '#8B7FD9', 'var(--gb-muted-foreground)']}
                height={300}
              />
            </div>
            <div className="rounded-[8px] border border-gb-border bg-gb-card p-5">
              <GbPieChart
                data={roadUserChartData}
                dataKey="percent"
                nameKey="user_type"
                title={`Fatalities by Road User Type — ${roadUserFatalities?.year ?? ''}`}
                colors={['var(--gb-destructive)', 'var(--gb-primary)', 'var(--gb-warning)', '#8B7FD9']}
                height={300}
              />
            </div>
          </div>

          {greaterGaborone && (
            <div className="rounded-[8px] border border-gb-border bg-gb-card p-5">
              <SectionHeader title={`Greater Gaborone — ${greaterGaborone.year}`} tone="warning" />
              <p className="mb-4 text-[12.5px] leading-relaxed text-gb-muted-foreground">{greaterGaborone.note}</p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {greaterGaborone.districts.map((d) => (
                  <div key={d.district} className="rounded-[6px] border border-gb-border bg-gb-background-2 p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-[13px] font-semibold text-gb-foreground">{d.district}</span>
                      <Badge variant="warning">{d.percent_of_national}% of national</Badge>
                    </div>
                    <div className="gb-num text-2xl font-bold text-gb-foreground">{d.accidents.toLocaleString()}</div>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gb-surface-2">
                      <div
                        className="h-full rounded-full bg-gb-warning"
                        style={{ width: `${Math.min(100, d.percent_of_national * 2)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div id="stats-sources" className="rounded-[8px] border border-gb-border bg-gb-card p-5 scroll-mt-6">
            <SectionHeader title="Data Sources" />
            <div className="flex flex-col divide-y divide-gb-border">
              {SOURCES.map((s) => (
                <div key={s.name} className="flex flex-col gap-1 py-3 first:pt-0 last:pb-0">
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-gb-primary hover:underline"
                  >
                    {s.name}
                    <ExternalLink size={11} className="shrink-0" />
                  </a>
                  <span className="text-[11.5px] leading-relaxed text-gb-muted-foreground">{s.detail}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </ConsoleLayout>
  );
}
