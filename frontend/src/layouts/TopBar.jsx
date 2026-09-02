import { Languages, User } from 'lucide-react';
import { tokens } from '../styles/tokens';
import { useTranslation } from '../i18n/LanguageContext';

/**
 * TopBar component with zone info, status, timestamp, and user profile
 * Apple-style dark mode with frosted glass effect
 * @param {Object} props
 * @param {string} props.zoneName - Monitored zone name (default: "Gaborone CBD")
 * @param {boolean} props.isOnline - Online status (default: true)
 * @param {string} props.lastUpdate - Last update timestamp
 * @param {string} props.userName - User name (default: "Admin")
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
    background: 'rgba(26, 26, 31, 0.8)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderBottom: `1px solid ${tokens.colors.border.default}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `0 ${tokens.spacing['2xl']}`,
    boxShadow: tokens.shadows.sm,
  };

  const leftSectionStyles = {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  };

  const zoneTitleStyles = {
    fontSize: tokens.typography.fontSize['2xl'],
    fontWeight: tokens.typography.fontWeight.semibold,
    color: tokens.colors.text.primary,
    margin: 0,
    letterSpacing: '-0.02em',
  };

  const subLabelStyles = {
    fontSize: tokens.typography.fontSize.sm,
    color: tokens.colors.text.secondary,
  };

  const centerSectionStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing.xl,
  };

  const statusBadgeStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing.sm,
    padding: `${tokens.spacing.sm} ${tokens.spacing.lg}`,
    backgroundColor: isOnline
      ? 'rgba(16, 185, 129, 0.15)'
      : 'rgba(107, 114, 128, 0.15)',
    borderRadius: tokens.borderRadius.full,
    fontSize: tokens.typography.fontSize.sm,
    fontWeight: tokens.typography.fontWeight.medium,
    color: isOnline
      ? tokens.colors.status.online
      : tokens.colors.status.offline,
    border: `1px solid ${isOnline
      ? 'rgba(16, 185, 129, 0.3)'
      : 'rgba(107, 114, 128, 0.3)'}`,
    boxShadow: isOnline
      ? '0 0 15px rgba(16, 185, 129, 0.2)'
      : 'none',
  };

  const pulseStyles = {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: isOnline ? tokens.colors.status.online : tokens.colors.status.offline,
    animation: isOnline ? 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none',
  };

  const timestampStyles = {
    fontSize: tokens.typography.fontSize.sm,
    color: tokens.colors.text.secondary,
  };

  const userSectionStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing.md,
    padding: `${tokens.spacing.sm} ${tokens.spacing.lg}`,
    borderRadius: tokens.borderRadius.md,
    cursor: 'pointer',
    transition: `all ${tokens.transitions.normal}`,
    border: '1px solid transparent',
  };

  const userAvatarStyles = {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: tokens.colors.primary[500],
    border: '1px solid rgba(16, 185, 129, 0.3)',
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
      <div style={leftSectionStyles}>
        <h1 style={zoneTitleStyles}>{zoneName}</h1>
        <div style={subLabelStyles}>{t('top.subtitle')}</div>
      </div>

      <div style={centerSectionStyles}>
        <div style={statusBadgeStyles}>
          <div style={pulseStyles} />
          <span>{isOnline ? t('top.online') : t('top.offline')}</span>
        </div>
        <div style={timestampStyles}>
          {t('top.updated')}: {formattedTime}
        </div>
      </div>

      <label style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing.sm, color: tokens.colors.text.secondary, fontSize: tokens.typography.fontSize.sm }}>
        <Languages size={18} aria-hidden="true" />
        <span>{t('language.label')}</span>
        <select
          value={language}
          onChange={(event) => setLanguage(event.target.value)}
          aria-label={t('language.label')}
          style={{ background: 'rgba(31, 31, 36, 0.9)', color: tokens.colors.text.primary, border: `1px solid ${tokens.colors.border.default}`, borderRadius: tokens.borderRadius.md, padding: `${tokens.spacing.sm} ${tokens.spacing.md}`, cursor: 'pointer' }}
        >
          <option value="en">{t('language.english')}</option>
          <option value="fr">{t('language.french')}</option>
        </select>
      </label>

      <div style={userSectionStyles} className="user-section">
        <div style={userAvatarStyles}>
          <User size={20} />
        </div>
        <div style={userNameStyles}>{userName || t('user.admin')}</div>
      </div>

      <style>{`
        .user-section:hover {
          background-color: ${tokens.colors.glass.light};
          transform: translateY(-1px);
          border-color: ${tokens.colors.border.default};
          transition: all ${tokens.transitions.normal};
        }
      `}</style>
    </header>
  );
}
