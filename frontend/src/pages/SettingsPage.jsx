import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';

import { ConsoleLayout } from '../layouts/ConsoleLayout';
import { UserManagement } from '../components/auth/UserManagement';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../i18n/LanguageContext';
import { Button } from '../components/console-ui/button';
import { Badge } from '../components/console-ui/badge';
import { DetailRow, SectionHeader } from '../components/console-ui/panel';

const ROLE_BADGE = { admin: 'destructive', operator: 'success', viewer: 'default' };

export function SettingsPage() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <ConsoleLayout title={t('settings.title')}>
      <div className="mx-auto flex max-w-[1200px] flex-col gap-6">
        <div className="rounded-[8px] border border-gb-border bg-gb-card p-5">
          <SectionHeader title="Account Information" />

          <DetailRow label="Username" value={user?.username} />
          <DetailRow label="Email" value={user?.email} />
          <DetailRow label="Full Name" value={user?.full_name || 'Not set'} />
          <DetailRow
            label="Role"
            value={
              <Badge variant={ROLE_BADGE[user?.role] || 'default'} className="capitalize">
                {user?.role}
              </Badge>
            }
          />

          <div className="mt-5">
            <Button variant="destructive" onClick={handleLogout}>
              <LogOut size={15} />
              Sign Out
            </Button>
          </div>
        </div>

        {user?.role === 'admin' && <UserManagement />}
      </div>
    </ConsoleLayout>
  );
}
