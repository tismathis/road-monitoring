import { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { tokens } from '../../styles/tokens';
import { endpoints } from '../../utils/api';
import { authGet, authPost, authPatch } from '../../utils/authFetch';
import { UserPlus, Edit, UserCheck, UserX } from 'lucide-react';

/**
 * UserManagement - Admin-only component for managing users
 * Create, list, and update users (role, active status)
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

  // Fetch users on mount
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

      // Reset form and refresh list
      setFormData({
        username: '',
        email: '',
        password: '',
        full_name: '',
        role: 'viewer',
      });
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
      await authPatch(endpoints.userById(userId), {
        is_active: !currentStatus,
      });
      await fetchUsers();
    } catch (err) {
      console.error('Error updating user:', err);
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    try {
      await authPatch(endpoints.userById(userId), {
        role: newRole,
      });
      await fetchUsers();
    } catch (err) {
      console.error('Error updating user role:', err);
    }
  };

  const titleStyles = {
    fontSize: tokens.typography.fontSize.xl,
    fontWeight: tokens.typography.fontWeight.semibold,
    color: tokens.colors.text.primary,
    marginBottom: tokens.spacing.md,
  };

  const tableStyles = {
    width: '100%',
    borderCollapse: 'collapse',
  };

  const thStyles = {
    padding: tokens.spacing.md,
    textAlign: 'left',
    fontSize: tokens.typography.fontSize.sm,
    fontWeight: tokens.typography.fontWeight.medium,
    color: tokens.colors.text.secondary,
    borderBottom: `1px solid ${tokens.colors.neutral.border}`,
  };

  const tdStyles = {
    padding: tokens.spacing.md,
    fontSize: tokens.typography.fontSize.sm,
    color: tokens.colors.text.primary,
    borderBottom: `1px solid ${tokens.colors.neutral.border}`,
  };

  const badgeStyles = (role) => ({
    display: 'inline-block',
    padding: `${tokens.spacing.xs} ${tokens.spacing.sm}`,
    borderRadius: tokens.borderRadius.md,
    fontSize: tokens.typography.fontSize.xs,
    fontWeight: tokens.typography.fontWeight.medium,
    backgroundColor:
      role === 'admin'
        ? 'rgba(239, 68, 68, 0.15)'
        : role === 'operator'
        ? 'rgba(16, 185, 129, 0.15)'
        : 'rgba(100, 116, 139, 0.15)',
    color:
      role === 'admin'
        ? '#ef4444'
        : role === 'operator'
        ? tokens.colors.infosys.primary
        : '#64748b',
  });

  const inputStyles = {
    width: '100%',
    padding: `${tokens.spacing.sm} ${tokens.spacing.md}`,
    backgroundColor: tokens.colors.background.primary,
    border: `1px solid ${tokens.colors.neutral.border}`,
    borderRadius: tokens.borderRadius.md,
    fontSize: tokens.typography.fontSize.sm,
    color: tokens.colors.text.primary,
    marginTop: tokens.spacing.xs,
  };

  const selectStyles = {
    ...inputStyles,
    cursor: 'pointer',
  };

  if (loading) {
    return (
      <Card>
        <p style={{ color: tokens.colors.text.secondary }}>Loading users...</p>
      </Card>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing.lg }}>
        <h2 style={titleStyles}>User Management</h2>
        <Button
          variant="primary"
          icon={UserPlus}
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? 'Cancel' : 'Create User'}
        </Button>
      </div>

      {showCreateForm && (
        <Card style={{ marginBottom: tokens.spacing.lg }}>
          <h3 style={{ ...titleStyles, fontSize: tokens.typography.fontSize.lg }}>Create New User</h3>

          {formError && (
            <div style={{
              padding: tokens.spacing.md,
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: tokens.borderRadius.md,
              color: '#ef4444',
              fontSize: tokens.typography.fontSize.sm,
              marginBottom: tokens.spacing.md,
            }}>
              {formError}
            </div>
          )}

          <form onSubmit={handleCreateUser}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.spacing.md, marginBottom: tokens.spacing.md }}>
              <div>
                <label style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.text.primary }}>
                  Username *
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                    style={inputStyles}
                    placeholder="john.doe"
                  />
                </label>
              </div>

              <div>
                <label style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.text.primary }}>
                  Email *
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    style={inputStyles}
                    placeholder="john@gaborone.bw"
                  />
                </label>
              </div>

              <div>
                <label style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.text.primary }}>
                  Password *
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    minLength={8}
                    style={inputStyles}
                    placeholder="Min 8 characters"
                  />
                </label>
              </div>

              <div>
                <label style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.text.primary }}>
                  Full Name
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    style={inputStyles}
                    placeholder="John Doe"
                  />
                </label>
              </div>

              <div>
                <label style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.text.primary }}>
                  Role *
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    required
                    style={selectStyles}
                  >
                    <option value="viewer">Viewer</option>
                    <option value="operator">Operator</option>
                    <option value="admin">Admin</option>
                  </select>
                </label>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              disabled={formLoading}
              fullWidth
            >
              {formLoading ? 'Creating...' : 'Create User'}
            </Button>
          </form>
        </Card>
      )}

      <Card>
        <table style={tableStyles}>
          <thead>
            <tr>
              <th style={thStyles}>Username</th>
              <th style={thStyles}>Email</th>
              <th style={thStyles}>Full Name</th>
              <th style={thStyles}>Role</th>
              <th style={thStyles}>Status</th>
              <th style={thStyles}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td style={tdStyles}>{user.username}</td>
                <td style={tdStyles}>{user.email}</td>
                <td style={tdStyles}>{user.full_name || '-'}</td>
                <td style={tdStyles}>
                  <select
                    value={user.role}
                    onChange={(e) => handleChangeRole(user.id, e.target.value)}
                    style={{ ...selectStyles, marginTop: 0, padding: `${tokens.spacing.xs} ${tokens.spacing.sm}`, fontSize: tokens.typography.fontSize.xs }}
                  >
                    <option value="viewer">Viewer</option>
                    <option value="operator">Operator</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td style={tdStyles}>
                  <span style={{
                    ...badgeStyles(user.role),
                    backgroundColor: user.is_active ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    color: user.is_active ? tokens.colors.infosys.primary : '#ef4444',
                  }}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td style={tdStyles}>
                  <Button
                    variant={user.is_active ? 'danger' : 'secondary'}
                    size="sm"
                    icon={user.is_active ? UserX : UserCheck}
                    onClick={() => handleToggleActive(user.id, user.is_active)}
                  >
                    {user.is_active ? 'Deactivate' : 'Activate'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
