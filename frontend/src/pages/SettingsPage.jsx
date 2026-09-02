import { Card } from '../components/ui/Card';
import { tokens } from '../styles/tokens';
import { useTranslation } from '../i18n/LanguageContext';

/**
 * SettingsPage - placeholder for future settings
 */
export function SettingsPage() {
  const { t } = useTranslation();
  const containerStyles = {
    maxWidth: '800px',
    margin: '0 auto',
  };

  const headingStyles = {
    fontSize: tokens.typography.fontSize['3xl'],
    fontWeight: tokens.typography.fontWeight.semibold,
    color: tokens.colors.neutral[900],
    marginBottom: tokens.spacing.xl,
  };

  const textStyles = {
    fontSize: tokens.typography.fontSize.base,
    color: tokens.colors.neutral[500],
    lineHeight: tokens.lineHeight.relaxed,
  };

  return (
    <div style={containerStyles}>
      <h1 style={headingStyles}>{t('settings.title')}</h1>
      <Card padding="2xl">
        <p style={textStyles}>
          {t('settings.soon')}
        </p>
        <p style={{ ...textStyles, marginTop: tokens.spacing.lg }}>
          {t('settings.description')}
        </p>
      </Card>
    </div>
  );
}
