import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { tokens } from '../../styles/tokens';
import { useTranslation } from '../../i18n/LanguageContext';

/**
 * IncidentCard component - displays detailed incident/event information
 * @param {Object} props
 * @param {Object} props.incident - Incident data object
 * @param {string} props.incident.title - Incident title
 * @param {'fatal'|'serious'|'minor'} props.incident.severity - Severity level
 * @param {number} props.incident.urgency - Urgency level (0-100)
 * @param {string} props.incident.timestamp - Timestamp
 * @param {string} props.incident.location - Location description
 * @param {Object} props.incident.details - Key-value pairs of details
 * @param {Array} props.incident.notifiedServices - Array of { name, status }
 */
export function IncidentCard({ incident }) {
  const { t } = useTranslation();
  const {
    severity,
    urgency,
    timestamp,
    location,
    details,
    notifiedServices
  } = incident;

  const headerStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: tokens.spacing.lg,
    gap: tokens.spacing.md,
  };

  const titleStyles = {
    fontSize: tokens.typography.fontSize.lg,
    fontWeight: tokens.typography.fontWeight.semibold,
    color: tokens.colors.text.primary,
    margin: 0,
    flex: 1,
  };

  const urgencyContainerStyles = {
    marginBottom: tokens.spacing.lg,
  };

  const urgencyLabelStyles = {
    fontSize: tokens.typography.fontSize.xs,
    color: tokens.colors.text.secondary,
    marginBottom: '4px',
    display: 'flex',
    justifyContent: 'space-between',
  };

  const urgencyBarBackgroundStyles = {
    height: '8px',
    backgroundColor: tokens.colors.background.grouped, // #F0F8FC - light blue tint
    borderRadius: tokens.borderRadius.full,
    overflow: 'hidden',
  };

  const urgencyBarFillStyles = {
    height: '100%',
    backgroundColor: severity === 'fatal'
      ? tokens.colors.severity.fatal
      : severity === 'serious'
        ? tokens.colors.severity.serious
        : tokens.colors.severity.minor,
    borderRadius: tokens.borderRadius.full,
    width: `${urgency}%`,
    transition: 'width 0.3s ease',
  };

  const detailsStyles = {
    marginBottom: tokens.spacing.lg,
  };

  const detailItemStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    padding: `${tokens.spacing.sm} 0`,
    borderBottom: `1px solid ${tokens.colors.neutral.border}`, // #E5E7EB
  };

  const detailLabelStyles = {
    fontSize: tokens.typography.fontSize.sm,
    color: tokens.colors.text.secondary,
  };

  const detailValueStyles = {
    fontSize: tokens.typography.fontSize.sm,
    color: tokens.colors.text.primary,
    fontWeight: tokens.typography.fontWeight.medium,
  };

  const servicesHeaderStyles = {
    fontSize: tokens.typography.fontSize.sm,
    fontWeight: tokens.typography.fontWeight.semibold,
    color: tokens.colors.text.primary,
    marginBottom: tokens.spacing.sm,
  };

  const servicesListStyles = {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing.sm,
  };

  const serviceItemStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  const serviceNameStyles = {
    fontSize: tokens.typography.fontSize.sm,
    color: tokens.colors.text.secondary,
  };

  return (
    <Card>
      <div style={headerStyles}>
        <h3 style={titleStyles}>{t(`incident.title.${incident.id}`)}</h3>
        <Badge variant={severity} size="sm">{t(`severity.${severity}`)}</Badge>
      </div>

      {urgency !== undefined && (
        <div style={urgencyContainerStyles}>
          <div style={urgencyLabelStyles}>
            <span>{t('incident.urgency')}</span>
            <span>{urgency}%</span>
          </div>
          <div style={urgencyBarBackgroundStyles}>
            <div style={urgencyBarFillStyles} />
          </div>
        </div>
      )}

      {(timestamp || location) && (
        <div style={detailsStyles}>
          {timestamp && (
            <div style={detailItemStyles}>
              <span style={detailLabelStyles}>{t('incident.time')}</span>
              <span style={detailValueStyles}>{timestamp}</span>
            </div>
          )}
          {location && (
            <div style={detailItemStyles}>
              <span style={detailLabelStyles}>{t('incident.location')}</span>
              <span style={detailValueStyles}>{location}</span>
            </div>
          )}
        </div>
      )}

      {details && Object.keys(details).length > 0 && (
        <div style={detailsStyles}>
          {Object.entries(details).map(([key, value]) => (
            <div key={key} style={detailItemStyles}>
              <span style={detailLabelStyles}>{t(`detail.${key}`)}</span>
              <span style={detailValueStyles}>{t(`value.${value}`)}</span>
            </div>
          ))}
        </div>
      )}

      {notifiedServices && notifiedServices.length > 0 && (
        <div>
          <div style={servicesHeaderStyles}>{t('incident.services')}</div>
          <div style={servicesListStyles}>
            {notifiedServices.map((service, index) => (
              <div key={index} style={serviceItemStyles}>
                <span style={serviceNameStyles}>{t(`service.${service.name}`)}</span>
                <Badge variant={service.status} size="sm">{t(`status.${service.status}`)}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
