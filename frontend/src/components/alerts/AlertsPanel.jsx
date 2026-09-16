import { Card } from '../ui/Card';
import { tokens } from '../../styles/tokens';
import { AlertTriangle, Clock } from 'lucide-react';

/**
 * AlertsPanel - Sticky side panel for crash signals and active alerts
 * Placeholder for future crash detection implementation
 * Light theme with clean, operational aesthetic
 */
export function AlertsPanel() {
  const alerts = []; // TODO: Fetch from /cameras/{id}/crash-signal endpoints

  const containerStyles = {
    position: 'sticky',
    top: tokens.spacing.xl,
    maxHeight: '80vh',
    overflowY: 'auto',
  };

  const headingStyles = {
    fontFamily: tokens.typography.fontFamily.heading,
    fontSize: tokens.typography.fontSize.lg,
    fontWeight: tokens.typography.fontWeight.semibold,
    color: tokens.colors.text.primary,
    marginBottom: tokens.spacing.md,
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing.sm,
  };

  const emptyStyles = {
    textAlign: 'center',
    padding: tokens.spacing.xl,
    color: tokens.colors.text.tertiary,
    fontSize: tokens.typography.fontSize.sm,
  };

  const iconContainerStyles = {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: tokens.spacing.md,
    opacity: 0.2,
  };

  return (
    <div style={containerStyles}>
      <Card padding="lg">
        <div style={headingStyles}>
          <AlertTriangle size={18} color={tokens.colors.alert.amber} />
          Active Alerts
        </div>

        {alerts.length === 0 ? (
          <div style={emptyStyles}>
            <div style={iconContainerStyles}>
              <Clock size={40} color={tokens.colors.text.tertiary} />
            </div>
            <div style={{
              fontSize: tokens.typography.fontSize.base,
              color: tokens.colors.text.secondary,
              marginBottom: tokens.spacing.sm,
              fontWeight: tokens.typography.fontWeight.medium,
            }}>
              No active alerts
            </div>
            <div style={{
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.text.tertiary,
            }}>
              Crash detection coming soon
            </div>
          </div>
        ) : (
          <div>
            {/* TODO: Render alert cards when crash detection is implemented */}
            {/* Each alert would have: severity dot, camera name, timestamp, location */}
            {alerts.map((alert, index) => (
              <div key={index}>
                {/* Alert card structure */}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
