import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { tokens } from '../styles/tokens';
import { Lock, MapPin } from 'lucide-react';

/**
 * LoginPage - Light-themed authentication page
 * Professional Infosys Blue branding, clean and operational
 * First impression of the monitoring system
 */
export function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(username, password);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error || 'Login failed');
      setLoading(false);
    }
  };

  const containerStyles = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: tokens.colors.background.base, // #FAFAF9
    padding: tokens.spacing.xl,
  };

  const cardStyles = {
    width: '100%',
    maxWidth: '420px',
    backgroundColor: tokens.colors.background.elevated, // White
    borderRadius: tokens.borderRadius.lg,
    padding: tokens.spacing['3xl'],
    border: `1px solid ${tokens.colors.neutral.border}`, // #E5E7EB
    boxShadow: tokens.shadows.xl,
  };

  const headerStyles = {
    textAlign: 'center',
    marginBottom: tokens.spacing['3xl'],
  };

  const iconContainerStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '72px',
    height: '72px',
    borderRadius: tokens.borderRadius.full,
    backgroundColor: tokens.colors.infosys.tint, // #F0F8FC - subtle Infosys Blue tint
    border: `2px solid ${tokens.colors.infosys.primary}`,
    marginBottom: tokens.spacing.lg,
  };

  const titleStyles = {
    fontFamily: tokens.typography.fontFamily.heading,
    fontSize: tokens.typography.fontSize['3xl'],
    fontWeight: tokens.typography.fontWeight.semibold,
    color: tokens.colors.text.primary,
    marginBottom: tokens.spacing.sm,
  };

  const subtitleStyles = {
    fontSize: tokens.typography.fontSize.base,
    color: tokens.colors.text.secondary, // Asphalt gray
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacing.xs,
  };

  const formStyles = {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing.lg,
  };

  const labelStyles = {
    fontSize: tokens.typography.fontSize.sm,
    fontWeight: tokens.typography.fontWeight.medium,
    color: tokens.colors.text.primary,
    marginBottom: tokens.spacing.xs,
    display: 'block',
  };

  const inputStyles = {
    width: '100%',
    padding: `${tokens.spacing.md} ${tokens.spacing.lg}`,
    backgroundColor: tokens.colors.background.base, // #FAFAF9
    border: `1px solid ${tokens.colors.neutral.border}`, // #E5E7EB
    borderRadius: tokens.borderRadius.md,
    fontSize: tokens.typography.fontSize.base,
    color: tokens.colors.text.primary,
    outline: 'none',
    transition: 'border-color 0.15s, box-shadow 0.15s',
    fontFamily: tokens.typography.fontFamily.sans,
  };

  const inputFocusStyles = {
    borderColor: tokens.colors.infosys.primary, // #007CC3
    boxShadow: `0 0 0 3px ${tokens.colors.infosys.light}`, // #E5F3F9
  };

  const buttonStyles = {
    width: '100%',
    padding: `${tokens.spacing.md} ${tokens.spacing.xl}`,
    backgroundColor: tokens.colors.infosys.primary, // #007CC3 - Infosys Blue
    color: '#FFFFFF',
    border: 'none',
    borderRadius: tokens.borderRadius.md,
    fontSize: tokens.typography.fontSize.base,
    fontWeight: tokens.typography.fontWeight.semibold,
    cursor: loading ? 'not-allowed' : 'pointer',
    opacity: loading ? 0.6 : 1,
    transition: 'background-color 0.15s, opacity 0.15s',
    fontFamily: tokens.typography.fontFamily.heading,
  };

  const errorStyles = {
    padding: tokens.spacing.md,
    backgroundColor: '#FEE2E2', // Light red background
    border: `1px solid ${tokens.colors.alert.critical}`,
    borderRadius: tokens.borderRadius.md,
    color: tokens.colors.alert.critical,
    fontSize: tokens.typography.fontSize.sm,
    textAlign: 'center',
    marginBottom: tokens.spacing.lg,
  };

  const brandingStyles = {
    marginTop: tokens.spacing.xl,
    paddingTop: tokens.spacing.lg,
    borderTop: `1px solid ${tokens.colors.neutral.border}`,
    textAlign: 'center',
    fontSize: tokens.typography.fontSize.xs,
    color: tokens.colors.text.tertiary,
  };

  return (
    <div style={containerStyles}>
      <div style={cardStyles}>
        <div style={headerStyles}>
          <div style={iconContainerStyles}>
            <Lock size={36} color={tokens.colors.infosys.primary} strokeWidth={2} />
          </div>
          <h1 style={titleStyles}>RoadWatch</h1>
          <p style={subtitleStyles}>
            <MapPin size={16} />
            Gaborone Road Monitoring
          </p>
        </div>

        {error && (
          <div style={errorStyles}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={formStyles}>
          <div>
            <label htmlFor="username" style={labelStyles}>
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading}
              style={inputStyles}
              onFocus={(e) => {
                Object.assign(e.target.style, inputFocusStyles);
              }}
              onBlur={(e) => {
                e.target.style.borderColor = tokens.colors.neutral.border;
                e.target.style.boxShadow = 'none';
              }}
              placeholder="Enter username"
            />
          </div>

          <div>
            <label htmlFor="password" style={labelStyles}>
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              style={inputStyles}
              onFocus={(e) => {
                Object.assign(e.target.style, inputFocusStyles);
              }}
              onBlur={(e) => {
                e.target.style.borderColor = tokens.colors.neutral.border;
                e.target.style.boxShadow = 'none';
              }}
              placeholder="Enter password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={buttonStyles}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = tokens.colors.infosys.dark; // #005A8F
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = tokens.colors.infosys.primary;
              }
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={brandingStyles}>
          Infosys InStep Internship Project
        </div>
      </div>
    </div>
  );
}
