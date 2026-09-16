import { useState } from 'react';
import { IncidentCard } from '../components/stats/IncidentCard';
import { Badge } from '../components/ui/Badge';
import { mockIncidents } from '../utils/mockData';
import { tokens } from '../styles/tokens';
import { Filter } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';

/**
 * IncidentsPage - List of incidents with filters
 */
export function IncidentsPage() {
  const { t } = useTranslation();
  const [severityFilter, setSeverityFilter] = useState('all');

  // Filter incidents by severity
  const filteredIncidents = severityFilter === 'all'
    ? mockIncidents
    : mockIncidents.filter(incident => incident.severity === severityFilter);

  const containerStyles = {
    maxWidth: tokens.layout.maxContentWidth,
    margin: '0 auto',
  };

  const headingStyles = {
    fontSize: tokens.typography.fontSize['3xl'],
    fontWeight: tokens.typography.fontWeight.semibold,
    color: tokens.colors.text.primary,
    marginBottom: tokens.spacing.xl,
  };

  const filterBarStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing.lg,
    padding: tokens.spacing.lg,
    backgroundColor: tokens.colors.background.elevated,
    borderRadius: tokens.borderRadius.lg,
    boxShadow: tokens.shadows.sm,
    marginBottom: tokens.spacing.xl,
  };

  const filterLabelStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing.sm,
    fontSize: tokens.typography.fontSize.sm,
    fontWeight: tokens.typography.fontWeight.medium,
    color: tokens.colors.text.primary,
  };

  const filterButtonStyles = (isActive) => ({
    padding: `${tokens.spacing.sm} ${tokens.spacing.lg}`,
    borderRadius: tokens.borderRadius.md,
    border: `1px solid ${isActive ? tokens.colors.infosys.primary : tokens.colors.neutral.border}`,
    backgroundColor: isActive ? tokens.colors.infosys.light : tokens.colors.background.elevated,
    color: isActive ? tokens.colors.infosys.dark : tokens.colors.text.primary,
    cursor: 'pointer',
    fontSize: tokens.typography.fontSize.sm,
    fontWeight: tokens.typography.fontWeight.medium,
    transition: 'all 0.2s ease',
  });

  const statsStyles = {
    fontSize: tokens.typography.fontSize.sm,
    color: tokens.colors.neutral[500],
    marginBottom: tokens.spacing.lg,
  };

  const incidentsGridStyles = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: tokens.spacing.lg,
  };

  const emptyStateStyles = {
    textAlign: 'center',
    padding: tokens.spacing['3xl'],
    color: tokens.colors.neutral[500],
    fontSize: tokens.typography.fontSize.lg,
  };

  return (
    <div style={containerStyles}>
      <h1 style={headingStyles}>{t('incidents.title')}</h1>

      {/* Filter Bar */}
      <div style={filterBarStyles}>
        <div style={filterLabelStyles}>
          <Filter size={16} />
          <span>{t('incidents.filter')}</span>
        </div>

        <button
          style={filterButtonStyles(severityFilter === 'all')}
          onClick={() => setSeverityFilter('all')}
        >
          {t('incidents.all')} ({mockIncidents.length})
        </button>

        <button
          style={filterButtonStyles(severityFilter === 'fatal')}
          onClick={() => setSeverityFilter('fatal')}
        >
          <Badge variant="fatal" size="sm">{t('severity.fatal')}</Badge>
          <span style={{ marginLeft: tokens.spacing.sm }}>
            ({mockIncidents.filter(i => i.severity === 'fatal').length})
          </span>
        </button>

        <button
          style={filterButtonStyles(severityFilter === 'serious')}
          onClick={() => setSeverityFilter('serious')}
        >
          <Badge variant="serious" size="sm">{t('severity.serious')}</Badge>
          <span style={{ marginLeft: tokens.spacing.sm }}>
            ({mockIncidents.filter(i => i.severity === 'serious').length})
          </span>
        </button>

        <button
          style={filterButtonStyles(severityFilter === 'minor')}
          onClick={() => setSeverityFilter('minor')}
        >
          <Badge variant="minor" size="sm">{t('severity.minor')}</Badge>
          <span style={{ marginLeft: tokens.spacing.sm }}>
            ({mockIncidents.filter(i => i.severity === 'minor').length})
          </span>
        </button>
      </div>

      {/* Stats */}
      <div style={statsStyles}>
        {t('incidents.showing', { count: filteredIncidents.length, plural: filteredIncidents.length > 1 ? 's' : '' })}
        {severityFilter !== 'all' && t('incidents.filtered', { severity: t(`severity.${severityFilter}`) })}
      </div>

      {/* Incidents Grid */}
      {filteredIncidents.length > 0 ? (
        <div style={incidentsGridStyles}>
          {filteredIncidents.map(incident => (
            <IncidentCard key={incident.id} incident={incident} />
          ))}
        </div>
      ) : (
        <div style={emptyStateStyles}>
          {t('incidents.empty')}
        </div>
      )}
    </div>
  );
}
