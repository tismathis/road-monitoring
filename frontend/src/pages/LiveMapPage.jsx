import { useState } from 'react';
import { MapView } from '../components/map/MapView';
import { MapControlCard } from '../components/stats/MapControlCard';
import { useRoadData } from '../hooks/useRoadData';
import { useCrashData } from '../hooks/useCrashData';
import { tokens } from '../styles/tokens';

// Import parking components
// ParkingMarker: The clickable icon on the map
// ParkingModal: The modal that shows the parking stream
import { ParkingModal } from '../components/parking/ParkingModal';
import { useTranslation } from '../i18n/LanguageContext';

/**
 * LOCATION CONFIGURATION
 *
 * These coordinates define where markers appear on the map
 * Format: [latitude, longitude]
 */
const CAMERA_LOCATION = [-24.6539, 25.9010];  // Traffic camera location

// Parking lot location - positioned slightly offset from camera
// In a real application, you would use the actual parking lot coordinates
const PARKING_LOCATION = [-24.6549, 25.9025];

/**
 * LiveMapPage - Interactive map with road network and crash history
 *
 * Features:
 * - Road network visualization
 * - Historical crash data
 * - Live traffic camera marker
 * - Live parking lot monitoring (NEW!)
 */
export function LiveMapPage() {
  const { t } = useTranslation();
  const { roads, points, loading: roadsLoading } = useRoadData();
  const { crashes, loading: crashesLoading } = useCrashData();

  /**
   * State for parking modal visibility
   *
   * isParkingModalOpen: boolean
   * - true: Modal is visible, showing parking stream
   * - false: Modal is hidden
   *
   * setIsParkingModalOpen: function to update the state
   */
  const [isParkingModalOpen, setIsParkingModalOpen] = useState(false);

  if (roadsLoading || crashesLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        fontSize: tokens.typography.fontSize.lg,
        color: tokens.colors.neutral[500]
      }}>
        {t('map.loading')}
      </div>
    );
  }

  const mapContainerStyles = {
    height: 'calc(100vh - var(--topbar-height) - 64px)', // Full height minus topbar and padding
    width: '100%',
    position: 'relative',
  };

  const controlCardStyles = {
    position: 'absolute',
    top: tokens.spacing.lg,
    left: tokens.spacing.lg,
    zIndex: 1000,
  };

  return (
    <div style={mapContainerStyles}>
      {/*
        MapView Component

        This is the main map container showing:
        - Roads network (from PostgreSQL)
        - Crash history points
        - Traffic camera marker
        - Parking lot marker (NEW!)
      */}
      <MapView
        center={CAMERA_LOCATION}
        zoom={15}
        roads={roads}
        points={points}
        crashes={crashes}
        cameraPosition={CAMERA_LOCATION}
        parkingPosition={PARKING_LOCATION}
        onParkingClick={() => setIsParkingModalOpen(true)}
        showLegend={true}
      />

      {/* Map control overlay card (top-left corner) */}
      <div style={controlCardStyles}>
        <MapControlCard
          selectedZone="Gaborone CBD"
          subZone={t('map.industrialZone')}
          coordinates={CAMERA_LOCATION}
          availableZones={[]}
        />
      </div>

      {/*
        ParkingModal Component

        This modal opens when user clicks the parking marker.

        How it works:
        1. User clicks parking marker on map
        2. onParkingClick callback fires
        3. setIsParkingModalOpen(true) opens the modal
        4. Modal fetches and displays:
           - Live MJPEG stream from /parking/stream
           - Real-time stats from /parking/stats
        5. User closes modal → setIsParkingModalOpen(false)
      */}
      <ParkingModal
        isOpen={isParkingModalOpen}
        onClose={() => setIsParkingModalOpen(false)}
      />
    </div>
  );
}
