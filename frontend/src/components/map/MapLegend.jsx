import { tokens } from '../../styles/tokens';
import { useTranslation } from '../../i18n/LanguageContext';

/**
 * MapLegend component - displays crash severity legend
 * Apple-style frosted glass for dark mode
 */
export function MapLegend() {
  const { t } = useTranslation();
  const legendStyles = {
    position: 'absolute',
    bottom: '30px',
    right: '10px',
    zIndex: 1000,
    background: 'rgba(26, 26, 31, 0.9)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    padding: tokens.spacing.lg,
    borderRadius: tokens.borderRadius.lg,
    boxShadow: tokens.shadows.xl,
    fontSize: tokens.typography.fontSize.sm,
    border: `1px solid ${tokens.colors.neutral.border}`,
    minWidth: '180px',
  };

  const titleStyles = {
    fontWeight: tokens.typography.fontWeight.semibold,
    marginBottom: tokens.spacing.sm,
    color: tokens.colors.text.primary,
  };

  const itemStyles = {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '4px',
  };

  const dotStyles = (color) => ({
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    backgroundColor: color,
    display: 'inline-block',
    marginRight: tokens.spacing.sm,
    border: '2px solid rgba(0, 0, 0, 0.3)',
    boxShadow: `0 0 8px ${color}40`,
  });

  const labelStyles = {
    color: tokens.colors.text.secondary,
  };

  return (
    <div style={legendStyles}>
      <div style={titleStyles}>{t('map.legend')}</div>
      <div style={itemStyles}>
        <span style={dotStyles(tokens.colors.severity.fatal)}></span>
        <span style={labelStyles}>{t('map.fatal')}</span>
      </div>
      <div style={itemStyles}>
        <span style={dotStyles(tokens.colors.severity.serious)}></span>
        <span style={labelStyles}>{t('map.serious')}</span>
      </div>
      <div style={itemStyles}>
        <span style={dotStyles(tokens.colors.severity.minor)}></span>
        <span style={labelStyles}>{t('map.minor')}</span>
      </div>
      <div style={itemStyles}>
        <span style={dotStyles(tokens.colors.text.tertiary)}></span>
        <span style={labelStyles}>{t('map.signal')}</span>
      </div>
    </div>
  );
}
