import { useTranslation } from '../../i18n/LanguageContext';
import { Badge } from './badge';
import { DetailRow } from './panel';

const SEVERITY_VARIANT = { fatal: 'destructive', serious: 'warning', minor: 'warning' };
const SEVERITY_BAR = { fatal: 'bg-gb-destructive', serious: 'bg-gb-warning', minor: 'bg-gb-warning' };
const STATUS_VARIANT = { dispatched: 'destructive', inProgress: 'warning', notified: 'default' };

/**
 * IncidentPanel — the console's incident detail card, shared by the
 * Dashboard and Incidents pages. Reproduces the original IncidentCard's
 * data (severity, urgency bar, time/location, key-value details, notified
 * services) in the dark console idiom.
 */
export function IncidentPanel({ incident }) {
  const { t } = useTranslation();
  const { severity, urgency, timestamp, location, details, notifiedServices } = incident;

  return (
    <div className="rounded-[8px] border border-gb-border bg-gb-card p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <h3 className="flex-1 text-[15px] font-semibold text-gb-foreground">
          {t(`incident.title.${incident.id}`)}
        </h3>
        <Badge variant={SEVERITY_VARIANT[severity] || 'default'}>{t(`severity.${severity}`)}</Badge>
      </div>

      {urgency !== undefined && (
        <div className="mb-4">
          <div className="mb-1.5 flex justify-between text-[11px] text-gb-muted-foreground">
            <span>{t('incident.urgency')}</span>
            <span className="gb-num">{urgency}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-gb-background-2">
            <div
              className={`h-full rounded-full ${SEVERITY_BAR[severity] || 'bg-gb-primary'}`}
              style={{ width: `${urgency}%` }}
            />
          </div>
        </div>
      )}

      <div className="mb-1">
        {timestamp && <DetailRow label={t('incident.time')} value={<span className="gb-num">{timestamp}</span>} />}
        {location && <DetailRow label={t('incident.location')} value={location} />}
        {details &&
          Object.entries(details).map(([key, value]) => (
            <DetailRow key={key} label={t(`detail.${key}`)} value={t(`value.${value}`)} />
          ))}
      </div>

      {notifiedServices && notifiedServices.length > 0 && (
        <div className="mt-4 border-t border-gb-border pt-3">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-gb-muted-foreground">
            {t('incident.services')}
          </div>
          <div className="flex flex-col gap-2">
            {notifiedServices.map((service, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-[12.5px] text-gb-muted-foreground">{t(`service.${service.name}`)}</span>
                <Badge variant={STATUS_VARIANT[service.status] || 'default'}>{t(`status.${service.status}`)}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
