import { Card } from '../ui/Card';
import { tokens } from '../../styles/tokens';
import { useTranslation } from '../../i18n/LanguageContext';

/**
 * MapControlCard component - zone selection and location info overlay
 * Apple-style dark mode with frosted glass
 * @param {Object} props
 * @param {string} props.selectedZone - Currently selected zone
 * @param {string} props.subZone - Sub-zone name
 * @param {Array<number>} props.coordinates - [lat, lng]
 * @param {Function} props.onZoneChange - Callback when zone changes
 * @param {Array<string>} props.availableZones - Array of available zone names
 */
export function MapControlCard({
  selectedZone,
  subZone,
  coordinates,
  onZoneChange,
  availableZones = []
}) {
  const { t } = useTranslation();
  const labelStyles = {
    fontSize: tokens.typography.fontSize.xs,
    color: tokens.colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '4px',
  };

  const valueStyles = {
    fontSize: tokens.typography.fontSize.sm,
    color: tokens.colors.text.primary,
    fontWeight: tokens.typography.fontWeight.medium,
    marginBottom: tokens.spacing.md,
  };

  const selectStyles = {
    width: '100%',
    padding: tokens.spacing.sm,
    border: `1px solid ${tokens.colors.neutral.border}`,
    borderRadius: tokens.borderRadius.md,
    fontSize: tokens.typography.fontSize.sm,
    fontFamily: tokens.typography.fontFamily.sans,
    color: tokens.colors.text.primary,
    backgroundColor: 'rgba(31, 31, 36, 0.8)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    cursor: 'pointer',
    marginBottom: tokens.spacing.md,
    transition: `all ${tokens.transitions.normal}`,
  };

  const coordinatesStyles = {
    fontSize: tokens.typography.fontSize.xs,
    color: tokens.colors.text.secondary,
    fontFamily: tokens.typography.fontFamily.mono,
  };

  return (
    <Card padding="md" shadow="lg" style={{ minWidth: '220px' }}>
      <div style={labelStyles}>{t('map.monitoredZone')}</div>
      {availableZones.length > 0 ? (
        <>
          <select
            style={selectStyles}
            value={selectedZone}
            onChange={(e) => onZoneChange && onZoneChange(e.target.value)}
            className="map-control-select"
          >
            {availableZones.map(zone => (
              <option key={zone} value={zone}>{zone}</option>
            ))}
          </select>

          <style>{`
            .map-control-select:hover {
              border-color: ${tokens.colors.infosys.primary};
            }

            .map-control-select option {
              background-color: #1F1F24;
              color: ${tokens.colors.text.primary};
            }
          `}</style>
        </>
      ) : (
        <div style={valueStyles}>{selectedZone}</div>
      )}

      {subZone && (
        <>
          <div style={labelStyles}>{t('map.subzone')}</div>
          <div style={valueStyles}>{subZone}</div>
        </>
      )}

      {coordinates && coordinates.length === 2 && (
        <>
          <div style={labelStyles}>{t('map.coordinates')}</div>
          <div style={coordinatesStyles}>
            {coordinates[0].toFixed(4)}, {coordinates[1].toFixed(4)}
          </div>
        </>
      )}
    </Card>
  );
}
