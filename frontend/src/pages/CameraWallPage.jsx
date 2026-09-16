import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { SystemHealthStrip } from '../components/system/SystemHealthStrip';
import { AlertsPanel } from '../components/alerts/AlertsPanel';
import { useCameraList } from '../hooks/useGenericCameraData';
import { getAuthStreamUrl } from '../utils/authFetch';
import { tokens } from '../styles/tokens';
import { Video, MapPin } from 'lucide-react';

/**
 * CameraWallPage - Command center camera grid
 * Light theme, operational density, information-first layout
 * NOT identical cards everywhere - using spatial zones instead
 */
export function CameraWallPage() {
  const cameras = useCameraList(5000); // Poll every 5 seconds
  const navigate = useNavigate();

  const containerStyles = {
    maxWidth: tokens.layout.maxContentWidth,
    margin: '0 auto',
    width: '100%',
  };

  const headingStyles = {
    fontFamily: tokens.typography.fontFamily.heading, // Inter
    fontSize: tokens.typography.fontSize['3xl'],
    fontWeight: tokens.typography.fontWeight.semibold,
    color: tokens.colors.text.primary,
    marginBottom: tokens.spacing.lg,
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing.md,
  };

  // Compact status bar - inline, NO card wrapper (from design plan)
  const statusBarStyles = {
    padding: `${tokens.spacing.md} 0`,
    marginBottom: tokens.spacing.lg,
    fontSize: tokens.typography.fontSize.sm,
    color: tokens.colors.text.secondary,
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing.xl,
  };

  // Camera grid with operational density (16px gaps)
  const gridStyles = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: tokens.layout.cameraGridGap, // 16px
  };

  const tileStyles = {
    cursor: 'pointer',
    transition: `background-color ${tokens.transitions.fast}, border-color ${tokens.transitions.fast}`,
    position: 'relative',
  };

  const previewStyles = {
    width: '100%',
    height: '180px',
    objectFit: 'cover',
    borderRadius: `${tokens.borderRadius.md} ${tokens.borderRadius.md} 0 0`,
    marginBottom: tokens.spacing.sm,
    background: '#F5F5F5', // Light gray placeholder
  };

  const infoRowStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: tokens.spacing.sm,
  };

  const nameStyles = {
    fontFamily: tokens.typography.fontFamily.heading,
    fontSize: tokens.typography.fontSize.lg,
    fontWeight: tokens.typography.fontWeight.semibold,
    color: tokens.colors.text.primary,
    marginBottom: tokens.spacing.xs,
  };

  const locationStyles = {
    fontSize: tokens.typography.fontSize.sm,
    color: tokens.colors.text.secondary, // Asphalt gray
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing.xs,
  };

  // Compact stat rows - left-aligned, NOT cards (from design plan)
  const statsRowStyles = {
    display: 'flex',
    gap: tokens.spacing.sm,
    marginTop: tokens.spacing.sm,
    flexWrap: 'wrap',
  };

  const handleTileClick = (camera) => {
    navigate(`/camera/${camera.id}`);
  };

  return (
    <div style={containerStyles}>
      {/* Page heading */}
      <h1 style={headingStyles}>
        <Video size={28} color={tokens.colors.infosys.primary} />
        Camera Monitoring
      </h1>

      {/* System Health Strip - inline status bar, NOT a card */}
      <div style={statusBarStyles}>
        <SystemHealthStrip />
      </div>

      {/* Main layout: Camera grid + Alerts panel */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 320px',
        gap: tokens.spacing.xl,
      }}>
        {/* Left: Camera grid */}
        <div>
          {cameras.length === 0 && (
            <Card padding="xl" variant="grouped">
              <div style={{
                textAlign: 'center',
                color: tokens.colors.text.secondary,
                padding: tokens.spacing.xl,
              }}>
                <Video size={48} style={{ opacity: 0.3, marginBottom: tokens.spacing.md }} />
                <div style={{ fontSize: tokens.typography.fontSize.lg, marginBottom: tokens.spacing.sm }}>
                  No cameras available
                </div>
                <div style={{ fontSize: tokens.typography.fontSize.sm }}>
                  Check backend configuration and ensure cameras are running.
                </div>
              </div>
            </Card>
          )}

          <div style={gridStyles}>
            {cameras.map((camera) => (
              <Card
                key={camera.id}
                padding="md" // Compact padding for density
                hover={true}
                style={tileStyles}
                onClick={() => handleTileClick(camera)}
              >
                {/* Live preview */}
                <img
                  src={getAuthStreamUrl(camera.thumbnail_url)}
                  alt={camera.name}
                  style={previewStyles}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />

                {/* Info row with name and status badge */}
                <div style={infoRowStyles}>
                  <div style={{ flex: 1 }}>
                    <div style={nameStyles}>{camera.name}</div>
                    <div style={locationStyles}>
                      <MapPin size={12} />
                      {camera.location}
                    </div>
                  </div>
                  <Badge
                    variant={camera.is_online ? 'online' : 'offline'}
                    size="sm"
                  >
                    {camera.is_online ? 'Online' : 'Offline'}
                  </Badge>
                </div>

                {/* Live count badges - compact, info badges */}
                {camera.stats_preview && Object.keys(camera.stats_preview).length > 0 && (
                  <div style={statsRowStyles}>
                    {Object.entries(camera.stats_preview).map(([key, val]) => (
                      <Badge key={key} variant="info" size="sm">
                        {key}: {val}
                      </Badge>
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>

        {/* Right: Alerts panel */}
        <AlertsPanel />
      </div>
    </div>
  );
}
