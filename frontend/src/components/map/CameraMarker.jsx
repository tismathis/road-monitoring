import { Marker, Popup } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import { Video } from 'lucide-react';
import { tokens } from '../../styles/tokens';
import { useTranslation } from '../../i18n/LanguageContext';

/**
 * CameraMarker component - marker for live camera with direct navigation
 *
 * PART 2 ENHANCEMENT: Deep-link navigation
 * - Clicking the marker navigates DIRECTLY to the camera dashboard (/camera/{cameraId})
 * - No intermediate popup - one click to access full analytics
 * - Consistent UX across traffic and parking cameras
 *
 * @param {Object} props
 * @param {Array<number>} props.position - [lat, lng]
 * @param {string} props.cameraId - Camera ID for navigation (e.g., "traffic_main_gaborone")
 * @param {string} props.cameraName - Display name (e.g., "Gaborone Main Traffic")
 * @param {string} props.cameraType - Camera type: "traffic" or "parking"
 */
export function CameraMarker({ position, cameraId = "traffic_main_gaborone", cameraName, cameraType = "traffic" }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Color-code by camera type
  const markerColor = cameraType === "parking" ? tokens.colors.chart.tertiary : tokens.colors.infosys.primary;
  const shadowColor = cameraType === "parking" ? 'rgba(59, 130, 246, 0.4)' : 'rgba(34, 197, 94, 0.4)';

  // Créer un icône custom avec lucide-react
  const cameraIcon = L.divIcon({
    className: 'custom-camera-icon',
    html: renderToStaticMarkup(
      <div style={{
        backgroundColor: markerColor,
        borderRadius: '50%',
        width: '48px',
        height: '48px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: `3px solid ${tokens.colors.background.elevated}`,
        boxShadow: `0 4px 12px ${shadowColor}`,
        animation: 'camera-pulse 2s ease-in-out infinite',
        cursor: 'pointer',
      }}>
        <Video size={24} color="#ffffff" />
      </div>
    ),
    iconSize: [48, 48],
    iconAnchor: [24, 24],
    popupAnchor: [0, -24],
  });

  // Direct navigation on marker click
  const handleMarkerClick = () => {
    navigate(`/camera/${cameraId}`);
  };

  return (
    <>
      <Marker
        position={position}
        icon={cameraIcon}
        eventHandlers={{
          click: handleMarkerClick,
        }}
      >
        {/* Optional tooltip on hover */}
        <Popup>
          <div style={{ textAlign: 'center', fontSize: tokens.typography.fontSize.sm }}>
            <strong>{cameraName || t('map.cameraTitle')}</strong>
            <div style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.text.secondary, marginTop: '4px' }}>
              Click to view {cameraType} analytics
            </div>
          </div>
        </Popup>
      </Marker>

    {/* Styles CSS pour l'animation */}
    <style>{`
      @keyframes camera-pulse {
        0%, 100% {
          transform: scale(1);
          box-shadow: 0 4px 12px rgba(34, 197, 94, 0.4);
        }
        50% {
          transform: scale(1.1);
          box-shadow: 0 6px 20px rgba(34, 197, 94, 0.6);
        }
      }

      .custom-camera-icon {
        background: transparent !important;
        border: none !important;
      }
    `}</style>
    </>
  );
}
