import { Languages, User } from 'lucide-react';
import { tokens } from '../styles/tokens';
import { useTranslation } from '../i18n/LanguageContext';

/**
 * TopBar component - Clean light theme header
 * Shows zone info, status, timestamp, language, and user
 * @param {Object} props
 * @param {string} props.zoneName - Monitored zone name (default: "Gaborone CBD")
 * @param {boolean} props.isOnline - Online status (default: true)
 * @param {string} props.lastUpdate - Last update timestamp
 * @param {string} props.userName - User name
 */
export function TopBar({
  zoneName = "Gaborone CBD",
  isOnline = true,
  lastUpdate,
  userName
}) {
  const { language, locale, setLanguage, t } = useTranslation();

  const topBarStyles = {
    height: tokens.layout.topBarHeight,
    background: tokens.colors.background.elevated, // White
    borderBottom: `1px solid ${tokens.colors.neutral.border}`, // #E5E7EB
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `0 ${tokens.spacing.xl}`,
    boxShadow: tokens.shadows.sm,
  };

  const leftSectionStyles = {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  };

  const zoneTitleStyles = {
    fontFamily: tokens.typography.fontFamily.heading, // Inter
    fontSize: tokens.typography.fontSize.xl,
    fontWeight: tokens.typography.fontWeight.semibold,
    color: tokens.colors.text.primary,
    margin: 0,
  };

  const subLabelStyles = {
    fontSize: tokens.typography.fontSize.sm,
    color: tokens.colors.text.secondary, // Asphalt gray
  };

  const centerSectionStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing.xl,
  };

  // Status badge using road stripe design (from design plan)
  const statusBadgeStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing.sm,
    padding: `${tokens.spacing.sm} ${tokens.spacing.md}`,
    backgroundColor: isOnline ? '#D1FAE5' : '#F3F4F6', // Light green or gray
    borderRadius: tokens.borderRadius.sm,
    fontSize: tokens.typography.fontSize.sm,
    fontWeight: tokens.typography.fontWeight.medium,
    color: isOnline
      ? tokens.colors.status.online
      : tokens.colors.status.offline,
    border: `1px solid ${isOnline ? tokens.colors.status.online : tokens.colors.status.offline}`,
  };

  // Road stripe status indicator (design plan: horizontal bar = online, dashed = offline)
  const statusIndicatorStyles = {
    width: '20px',
    height: '2px',
    backgroundColor: isOnline ? tokens.colors.status.online : 'transparent',
    borderTop: isOnline ? 'none' : `2px dashed ${tokens.colors.status.offline}`,
  };

  const timestampStyles = {
    fontSize: tokens.typography.fontSize.sm,
    color: tokens.colors.text.tertiary,
    fontVariantNumeric: 'tabular-nums', // Align numbers
  };

  const userSectionStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing.md,
    padding: `${tokens.spacing.sm} ${tokens.spacing.md}`,
    borderRadius: tokens.borderRadius.md,
    cursor: 'pointer',
    transition: `background-color ${tokens.transitions.fast}`,
  };

  const userAvatarStyles = {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: tokens.colors.infosys.tint, // #F0F8FC
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: tokens.colors.infosys.primary, // #007CC3
    border: `1px solid ${tokens.colors.infosys.primary}`,
  };

  const userNameStyles = {
    fontSize: tokens.typography.fontSize.sm,
    fontWeight: tokens.typography.fontWeight.medium,
    color: tokens.colors.text.primary,
  };

  // Format timestamp
  const formattedTime = lastUpdate || new Date().toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <header style={topBarStyles}>
      {/* Left: Zone info */}
      <div style={leftSectionStyles}>
        <h1 style={zoneTitleStyles}>{zoneName}</h1>
        <div style={subLabelStyles}>{t('top.subtitle')}</div>
      </div>

      {/* Center: Status and timestamp */}
      <div style={centerSectionStyles}>
        <div style={statusBadgeStyles}>
          <div style={statusIndicatorStyles} />
          <span>{isOnline ? t('top.online') : t('top.offline')}</span>
        </div>
        <div style={timestampStyles}>
          {t('top.updated')}: {formattedTime}
        </div>
      </div>

      {/* Language selector */}
      <label style={{
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacing.sm,
        color: tokens.colors.text.secondary,
        fontSize: tokens.typography.fontSize.sm
      }}>
        <Languages size={16} aria-hidden="true" />
        <span>{t('language.label')}</span>
        <select
          value={language}
          onChange={(event) => setLanguage(event.target.value)}
          aria-label={t('language.label')}
          style={{
            background: tokens.colors.background.elevated,
            color: tokens.colors.text.primary,
            border: `1px solid ${tokens.colors.neutral.border}`,
            borderRadius: tokens.borderRadius.sm,
            padding: `${tokens.spacing.xs} ${tokens.spacing.sm}`,
            fontSize: tokens.typography.fontSize.sm,
            cursor: 'pointer',
          }}
        >
          <option value="en">{t('language.english')}</option>
          <option value="fr">{t('language.french')}</option>
        </select>
      </label>

      {/* Right: User info */}
      <div style={userSectionStyles} className="user-section">
        <div style={userAvatarStyles}>
          <User size={18} />
        </div>
        <div style={userNameStyles}>{userName || t('user.admin')}</div>
      </div>

      {/* Subtle hover effect - NO transform */}
      <style>{`
        .user-section:hover {
          background-color: ${tokens.colors.background.grouped};
        }
      `}</style>
    </header>
  );
}
