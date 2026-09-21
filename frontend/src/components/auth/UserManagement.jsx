import { useState, useEffect } from 'react';
import { UserPlus, UserCheck, UserX } from 'lucide-react';

import { endpoints } from '../../utils/api';
import { authGet, authPost, authPatch } from '../../utils/authFetch';
import { Button } from '../console-ui/button';
import { Badge } from '../console-ui/badge';
import { Input } from '../console-ui/input';
import { SectionHeader } from '../console-ui/panel';
import { GbLoading } from '../console-ui/loading';

const ROLE_BADGE = { admin: 'destructive', operator: 'success', viewer: 'default' };

/**
 * UserManagement — admin-only user CRUD, wired to the real backend
 * (/auth/register, /auth/users). Reskinned to the console's dark idiom;
 * behavior unchanged.
 */
export function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    full_name: '',
    role: 'viewer',
  });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await authGet(endpoints.users);
      setUsers(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching users:', err);
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);
    try {
      await authPost(endpoints.register, formData);
      setFormData({ username: '', email: '', password: '', full_name: '', role: 'viewer' });
      setShowCreateForm(false);
      await fetchUsers();
    } catch (err) {
      setFormError(err.message || 'Failed to create user');
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleActive = async (userId, currentStatus) => {
    try {
      await authPatch(endpoints.userById(userId), { is_active: !currentStatus });
      await fetchUsers();
    } catch (err) {
      console.error('Error updating user:', err);
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    try {
      await authPatch(endpoints.userById(userId), { role: newRole });
      await fetchUsers();
    } catch (err) {
      console.error('Error updating user role:', err);
    }
  };

  const selectClass =
    'h-9 rounded-[6px] border border-gb-input bg-gb-background-2 px-2.5 text-[12.5px] text-gb-foreground outline-none focus-visible:border-gb-ring';

  if (loading) {
    return (
      <div className="rounded-[8px] border border-gb-border bg-gb-card p-10">
        <GbLoading label="Loading users…" />
      </div>
    );
  }

  return (
    <div className="rounded-[8px] border border-gb-border bg-gb-card p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <SectionHeader title="User Management" />
        <Button variant={showCreateForm ? 'outline' : 'default'} size="sm" onClick={() => setShowCreateForm(!showCreateForm)}>
          <UserPlus size={14} />
          {showCreateForm ? 'Cancel' : 'Create User'}
        </Button>
      </div>

      {showCreateForm && (
        <form onSubmit={handleCreateUser} className="mb-5 rounded-[8px] border border-gb-border bg-gb-background-2 p-4">
          {formError && (
            <div className="mb-3 rounded-[6px] border border-gb-destructive/40 bg-gb-destructive/10 px-3 py-2 text-[12.5px] text-gb-destructive">
              {formError}
            </div>
          )}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-[12px] text-gb-muted-foreground">
              Username *
              <Input
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
                placeholder="john.doe"
              />
            </label>
            <label className="flex flex-col gap-1 text-[12px] text-gb-muted-foreground">
              Email *
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                placeholder="john@gaborone.bw"
              />
            </label>
            <label className="flex flex-col gap-1 text-[12px] text-gb-muted-foreground">
              Password *
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={8}
                placeholder="Min 8 characters"
              />
            </label>
            <label className="flex flex-col gap-1 text-[12px] text-gb-muted-foreground">
              Full Name
              <Input
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="John Doe"
              />
            </label>
            <label className="flex flex-col gap-1 text-[12px] text-gb-muted-foreground sm:col-span-2">
              Role *
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                required
                className={selectClass}
              >
                <option value="viewer">Viewer</option>
                <option value="operator">Operator</option>
                <option value="admin">Admin</option>
              </select>
            </label>
          </div>

          <Button type="submit" disabled={formLoading} className="mt-4 w-full">
            {formLoading ? 'Creating…' : 'Create User'}
          </Button>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr>
              {['Username', 'Email', 'Full Name', 'Role', 'Status', 'Actions'].map((h) => (
                <th key={h} className="border-b border-gb-border px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-gb-muted-foreground">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td className="border-b border-gb-border px-3 py-3 text-[13px] text-gb-foreground">{u.username}</td>
                <td className="border-b border-gb-border px-3 py-3 text-[13px] text-gb-muted-foreground">{u.email}</td>
                <td className="border-b border-gb-border px-3 py-3 text-[13px] text-gb-muted-foreground">{u.full_name || '—'}</td>
                <td className="border-b border-gb-border px-3 py-3">
                  <select
                    value={u.role}
                    onChange={(e) => handleChangeRole(u.id, e.target.value)}
                    className={`${selectClass} h-8 text-[11.5px]`}
                  >
                    <option value="viewer">Viewer</option>
                    <option value="operator">Operator</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="border-b border-gb-border px-3 py-3">
                  <Badge variant={u.is_active ? 'success' : ROLE_BADGE[u.role] || 'default'}>
                    {u.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </td>
                <td className="border-b border-gb-border px-3 py-3">
                  <Button
                    variant={u.is_active ? 'destructive' : 'outline'}
                    size="sm"
                    onClick={() => handleToggleActive(u.id, u.is_active)}
                  >
                    {u.is_active ? <UserX size={13} /> : <UserCheck size={13} />}
                    {u.is_active ? 'Deactivate' : 'Activate'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
