import { Badge } from '../ui/Badge';
import { tokens } from '../../styles/tokens';
import { Camera, AlertCircle } from 'lucide-react';
import { useCameraList } from '../../hooks/useGenericCameraData';

/**
 * SystemHealthStrip - Inline system status (NOT a card)
 * Shows camera online/offline counts and system status
 * Design plan: inline text with status badge, no card wrapper
 */
export function SystemHealthStrip() {
  const cameras = useCameraList(5000);

  const onlineCount = cameras.filter(c => c.is_online).length;
  const offlineCount = cameras.length - onlineCount;

  const containerStyles = {
    display: 'flex',
    gap: tokens.spacing.xl,
    alignItems: 'center',
    fontSize: tokens.typography.fontSize.sm,
    color: tokens.colors.text.secondary,
  };

  const itemStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing.sm,
  };

  return (
    <div style={containerStyles}>
      <div style={itemStyles}>
        <Camera size={16} color={tokens.colors.status.online} />
        <span>
          <strong style={{ color: tokens.colors.text.primary, fontVariantNumeric: 'tabular-nums' }}>
            {onlineCount}
          </strong>{' '}
          cameras online
        </span>
      </div>

      <div style={itemStyles}>
        <AlertCircle size={16} color={tokens.colors.status.offline} />
        <span>
          <strong style={{ color: tokens.colors.text.primary, fontVariantNumeric: 'tabular-nums' }}>
            {offlineCount}
          </strong>{' '}
          offline
        </span>
      </div>

      <div style={{ marginLeft: 'auto' }}>
        <Badge variant="online" size="sm">
          System Active
        </Badge>
      </div>
    </div>
  );
}
