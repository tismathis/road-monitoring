import { useState } from 'react';
import { Filter } from 'lucide-react';

import { ConsoleLayout } from '../layouts/ConsoleLayout';
import { mockIncidents } from '../utils/mockData';
import { useTranslation } from '../i18n/LanguageContext';
import { IncidentPanel } from '../components/console-ui/incident-panel';

const FILTERS = [
  { key: 'all', dot: null },
  { key: 'fatal', dot: 'bg-gb-destructive' },
  { key: 'serious', dot: 'bg-gb-warning' },
  { key: 'minor', dot: 'bg-gb-warning' },
];

export function IncidentsPage() {
  const { t } = useTranslation();
  const [severityFilter, setSeverityFilter] = useState('all');

  const filteredIncidents =
    severityFilter === 'all' ? mockIncidents : mockIncidents.filter((i) => i.severity === severityFilter);

  return (
    <ConsoleLayout title={t('incidents.title')}>
      <div className="mx-auto flex max-w-[1440px] flex-col gap-5">
        <div className="flex flex-wrap items-center gap-2 rounded-[8px] border border-gb-border bg-gb-card p-3">
          <div className="flex items-center gap-2 px-2 text-[12px] text-gb-muted-foreground">
            <Filter size={14} />
            <span>{t('incidents.filter')}</span>
          </div>

          {FILTERS.map((f) => {
            const count = f.key === 'all' ? mockIncidents.length : mockIncidents.filter((i) => i.severity === f.key).length;
            const active = severityFilter === f.key;
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => setSeverityFilter(f.key)}
                className={`flex items-center gap-1.5 rounded-[6px] border px-3 py-1.5 text-[12.5px] font-medium transition-colors ${
                  active
                    ? 'border-gb-primary/60 bg-gb-primary/12 text-gb-primary'
                    : 'border-gb-border text-gb-muted-foreground hover:bg-gb-accent hover:text-gb-foreground'
                }`}
              >
                {f.dot && <span className={`size-1.5 rounded-full ${f.dot}`} />}
                {f.key === 'all' ? t('incidents.all') : t(`severity.${f.key}`)}
                <span className="gb-num text-gb-muted-foreground">({count})</span>
              </button>
            );
          })}
        </div>

        <div className="text-[12px] text-gb-muted-foreground">
          {t('incidents.showing', { count: filteredIncidents.length, plural: filteredIncidents.length > 1 ? 's' : '' })}
          {severityFilter !== 'all' && t('incidents.filtered', { severity: t(`severity.${severityFilter}`) })}
        </div>

        {filteredIncidents.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {filteredIncidents.map((incident) => (
              <IncidentPanel key={incident.id} incident={incident} />
            ))}
          </div>
        ) : (
          <div className="rounded-[8px] border border-gb-border bg-gb-card py-16 text-center text-[13px] text-gb-muted-foreground">
            {t('incidents.empty')}
          </div>
        )}
      </div>
    </ConsoleLayout>
  );
}
