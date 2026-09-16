import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { UserManagement } from '../components/auth/UserManagement';
import { useAuth } from '../contexts/AuthContext';
import { tokens } from '../styles/tokens';
import { useTranslation } from '../i18n/LanguageContext';
import { LogOut, Settings, User } from 'lucide-react';

/**
 * SettingsPage - User settings and admin user management
 */
export function SettingsPage() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const containerStyles = {
    maxWidth: '1200px',
    margin: '0 auto',
  };

  const headingStyles = {
    fontSize: tokens.typography.fontSize['3xl'],
    fontWeight: tokens.typography.fontWeight.semibold,
    color: tokens.colors.text.primary,
    marginBottom: tokens.spacing.xl,
  };

  const sectionTitleStyles = {
    fontSize: tokens.typography.fontSize.xl,
    fontWeight: tokens.typography.fontWeight.semibold,
    color: tokens.colors.text.primary,
    marginBottom: tokens.spacing.md,
  };

  const textStyles = {
    fontSize: tokens.typography.fontSize.base,
    color: tokens.colors.text.secondary,
    lineHeight: tokens.typography.lineHeight.relaxed,
  };

  const infoRowStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    padding: `${tokens.spacing.md} 0`,
    borderBottom: `1px solid ${tokens.colors.neutral.border}`,
  };

  const labelStyles = {
    fontSize: tokens.typography.fontSize.sm,
    color: tokens.colors.text.secondary,
  };

  const valueStyles = {
    fontSize: tokens.typography.fontSize.sm,
    fontWeight: tokens.typography.fontWeight.medium,
    color: tokens.colors.text.primary,
  };

  return (
    <div style={containerStyles}>
      <h1 style={headingStyles}>
        <Settings size={32} style={{ display: 'inline', marginRight: tokens.spacing.md, verticalAlign: 'middle' }} />
        {t('settings.title')}
      </h1>

      {/* Account Information */}
      <Card style={{ marginBottom: tokens.spacing.xl }}>
        <h2 style={sectionTitleStyles}>
          <User size={20} style={{ display: 'inline', marginRight: tokens.spacing.sm, verticalAlign: 'middle' }} />
          Account Information
        </h2>

        <div style={infoRowStyles}>
          <span style={labelStyles}>Username</span>
          <span style={valueStyles}>{user?.username}</span>
        </div>

        <div style={infoRowStyles}>
          <span style={labelStyles}>Email</span>
          <span style={valueStyles}>{user?.email}</span>
        </div>

        <div style={infoRowStyles}>
          <span style={labelStyles}>Full Name</span>
          <span style={valueStyles}>{user?.full_name || 'Not set'}</span>
        </div>

        <div style={infoRowStyles}>
          <span style={labelStyles}>Role</span>
          <span style={{
            ...valueStyles,
            padding: `${tokens.spacing.xs} ${tokens.spacing.sm}`,
            borderRadius: tokens.borderRadius.md,
            backgroundColor:
              user?.role === 'admin'
                ? 'rgba(239, 68, 68, 0.15)'
                : user?.role === 'operator'
                ? 'rgba(16, 185, 129, 0.15)'
                : 'rgba(100, 116, 139, 0.15)',
            color:
              user?.role === 'admin'
                ? '#ef4444'
                : user?.role === 'operator'
                ? tokens.colors.infosys.primary
                : '#64748b',
          }}>
            {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
          </span>
        </div>

        <div style={{ marginTop: tokens.spacing.lg }}>
          <Button
            variant="danger"
            icon={LogOut}
            onClick={handleLogout}
          >
            Sign Out
          </Button>
        </div>
      </Card>

      {/* Admin-only: User Management */}
      {user?.role === 'admin' && (
        <UserManagement />
      )}
    </div>
  );
}
