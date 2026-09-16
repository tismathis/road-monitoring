import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { tokens } from '../../styles/tokens';
import { ShieldOff } from 'lucide-react';

/**
 * ProtectedRoute - Route wrapper with authentication and role-based access control
 *
 * Usage:
 *   <ProtectedRoute>
 *     <Dashboard />
 *   </ProtectedRoute>
 *
 *   <ProtectedRoute allowedRoles={['operator', 'admin']}>
 *     <LiveCameraPage />
 *   </ProtectedRoute>
 */
export function ProtectedRoute({ children, allowedRoles = null }) {
  const { isAuthenticated, hasRole, loading, user } = useAuth();

  // Show nothing while checking auth state
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: tokens.colors.background.base,
      }}>
        <div style={{
          color: tokens.colors.text.secondary,
          fontSize: tokens.typography.fontSize.lg,
        }}>
          Loading...
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  // Check role-based access if allowedRoles specified
  if (allowedRoles && !hasRole(allowedRoles)) {
    return <AccessDenied userRole={user?.role} requiredRoles={allowedRoles} />;
  }

  // User is authenticated and has required role
  return children;
}

/**
 * AccessDenied - Friendly error page for insufficient permissions
 */
function AccessDenied({ userRole, requiredRoles }) {
  const containerStyles = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.colors.background.base,
    padding: tokens.spacing.xl,
  };

  const cardStyles = {
    maxWidth: '500px',
    textAlign: 'center',
    backgroundColor: tokens.colors.background.elevated,
    borderRadius: tokens.borderRadius.xl,
    padding: tokens.spacing['2xl'],
    border: `1px solid ${tokens.colors.neutral.border}`,
  };

  const iconContainerStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '80px',
    height: '80px',
    borderRadius: tokens.borderRadius.full,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    marginBottom: tokens.spacing.lg,
  };

  const titleStyles = {
    fontSize: tokens.typography.fontSize['2xl'],
    fontWeight: tokens.typography.fontWeight.semibold,
    color: tokens.colors.text.primary,
    marginBottom: tokens.spacing.md,
  };

  const messageStyles = {
    fontSize: tokens.typography.fontSize.base,
    color: tokens.colors.text.secondary,
    marginBottom: tokens.spacing.lg,
    lineHeight: tokens.typography.lineHeight.relaxed,
  };

  const roleInfoStyles = {
    padding: tokens.spacing.md,
    backgroundColor: tokens.colors.background.base,
    borderRadius: tokens.borderRadius.md,
    border: `1px solid ${tokens.colors.neutral.border}`,
    fontSize: tokens.typography.fontSize.sm,
    color: tokens.colors.text.secondary,
  };

  const backButtonStyles = {
    marginTop: tokens.spacing.xl,
    padding: `${tokens.spacing.md} ${tokens.spacing.xl}`,
    backgroundColor: tokens.colors.infosys.primary,
    color: '#fff',
    border: 'none',
    borderRadius: tokens.borderRadius.md,
    fontSize: tokens.typography.fontSize.base,
    fontWeight: tokens.typography.fontWeight.medium,
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'inline-block',
  };

  return (
    <div style={containerStyles}>
      <div style={cardStyles}>
        <div style={iconContainerStyles}>
          <ShieldOff size={40} color="#ef4444" />
        </div>

        <h1 style={titleStyles}>Access Denied</h1>

        <p style={messageStyles}>
          You don't have permission to access this page. This area is restricted to users with specific roles.
        </p>

        <div style={roleInfoStyles}>
          <div style={{ marginBottom: tokens.spacing.sm }}>
            <strong style={{ color: tokens.colors.text.primary }}>Your role:</strong>{' '}
            <span style={{ color: tokens.colors.infosys.primary }}>{userRole}</span>
          </div>
          <div>
            <strong style={{ color: tokens.colors.text.primary }}>Required role:</strong>{' '}
            {requiredRoles.join(', ')}
          </div>
        </div>

        <a href="/dashboard" style={backButtonStyles}>
          Back to Dashboard
        </a>
      </div>
    </div>
  );
}
