import { MapContainer, TileLayer, GeoJSON, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import { CameraMarker } from './CameraMarker';
import { ParkingMarker } from './ParkingMarker';
import { MapLegend } from './MapLegend';
import { useCameraList } from '../../hooks/useGenericCameraData';
import { tokens } from '../../styles/tokens';
import { DEFAULT_MAP_STYLE } from '../../utils/mapStyles';
import { useTranslation } from '../../i18n/LanguageContext';

/**
 * MapView component - Leaflet map with road network and crash data
 * @param {Object} props
 * @param {Array<number>} props.center - Map center [lat, lng]
 * @param {number} props.zoom - Initial zoom level
 * @param {Object} props.roads - GeoJSON roads data
 * @param {Object} props.points - GeoJSON points data
 * @param {Object} props.crashes - GeoJSON crash data
 * @param {Array<number>} props.cameraPosition - Camera marker position [lat, lng]
 * @param {Array<number>} props.parkingPosition - Parking marker position [lat, lng] (optional)
 * @param {Function} props.onParkingClick - Callback when parking marker is clicked (optional)
 * @param {boolean} props.showLegend - Whether to show legend (default: true)
 */
export function MapView({
  center = [-24.6539, 25.9010],
  zoom = 15,
  roads,
  points,
  crashes,
  cameraPosition = [-24.6539, 25.9010],  // DEPRECATED: Use cameras list instead
  parkingPosition,                        // DEPRECATED: Use cameras list instead
  onParkingClick,                         // DEPRECATED: Direct navigation now
  showLegend = true
}) {
  const { t } = useTranslation();

  // PART 2: Fetch dynamic camera list from backend
  const cameras = useCameraList(10000); // Poll every 10 seconds

  // Debug: Log camera data
  console.log('[MapView] Cameras from backend:', cameras);
  // Crash point styling - IMPROVED with glow effect
  const crashPointStyle = (feature) => {
    const severity = feature.properties.severity;
    let color = tokens.colors.severity.minor;
    if (severity === 'fatal') color = tokens.colors.severity.fatal;
    else if (severity === 'serious_injury') color = tokens.colors.severity.serious;
    return {
      radius: 8,
      fillColor: color,
      color: '#ffffff',
      weight: 2,
      fillOpacity: 0.85,
      className: 'crash-marker' // Pour les animations CSS
    };
  };

  // Road styling - Infosys Blue
  const roadStyle = {
    color: tokens.colors.infosys.primary, // #007CC3
    weight: 4,
    opacity: 0.7,
    lineCap: 'round',
    lineJoin: 'round'
  };

  // Point styling (signals/crossings)
  const pointStyle = {
    radius: 5,
    fillColor: tokens.colors.infosys.primary, // #007CC3
    color: '#ffffff',
    weight: 2,
    fillOpacity: 0.8,
    className: 'signal-point'
  };

  return (
    <div style={{ position: 'relative', height: '100%', width: '100%' }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{
          height: '100%',
          width: '100%',
          borderRadius: tokens.borderRadius.lg,
          boxShadow: tokens.shadows.lg
        }}
        zoomControl={false} // On va repositionner les contrôles
      >
        {/* Style de carte configuré dans utils/mapStyles.js */}
        <TileLayer
          url={DEFAULT_MAP_STYLE.url}
          attribution={DEFAULT_MAP_STYLE.attribution}
          subdomains={DEFAULT_MAP_STYLE.subdomains}
          maxZoom={DEFAULT_MAP_STYLE.maxZoom}
        />

        {/* Road network */}
        {roads && <GeoJSON data={roads} style={roadStyle} />}

        {/* Traffic signals / crossings */}
        {points && (
          <GeoJSON
            data={points}
            pointToLayer={(feature, latlng) =>
              L.circleMarker(latlng, pointStyle)
            }
          />
        )}

        {/* Crash history */}
        {crashes && (
          <GeoJSON
            data={crashes}
            pointToLayer={(feature, latlng) =>
              L.circleMarker(latlng, crashPointStyle(feature))
            }
            onEachFeature={(feature, layer) => {
              const p = feature.properties;
              layer.bindPopup(
                `<b>${t(`severity.${p.severity}`)}</b><br/>` +
                `${t('map.year')}: ${p.year}<br/>` +
                `${t('map.deaths')}: ${p.fatalities}<br/>` +
                `${t('map.source')}: ${p.source}`
              );
            }}
          />
        )}

        {/* Camera markers - PART 2: Deep-link navigation with fallback */}
        {cameras.length > 0 ? (
          // Dynamic markers from backend camera registry
          cameras.map((camera) => (
            <CameraMarker
              key={camera.id}
              position={camera.position}
              cameraId={camera.id}
              cameraName={camera.name}
              cameraType={camera.type}
            />
          ))
        ) : (
          // Fallback to hardcoded positions if cameras list is empty/loading
          <>
            <CameraMarker
              position={cameraPosition}
              cameraId="traffic_main_gaborone"
              cameraName="Traffic Camera"
              cameraType="traffic"
            />
            {parkingPosition && (
              <CameraMarker
                position={parkingPosition}
                cameraId="parking_gaborone_lot1"
                cameraName="Parking Lot"
                cameraType="parking"
              />
            )}
          </>
        )}

        {/* Zoom controls repositionnés en bas à droite */}
        <ZoomControl position="bottomright" />
      </MapContainer>

      {/* Legend overlay */}
      {showLegend && <MapLegend />}

      {/* Styles CSS pour animations */}
      <style>{`
        /* Animation pulse pour les marqueurs d'accidents */
        @keyframes pulse-marker {
          0%, 100% {
            transform: scale(1);
            opacity: 0.85;
          }
          50% {
            transform: scale(1.1);
            opacity: 1;
          }
        }

        .crash-marker {
          animation: pulse-marker 2s ease-in-out infinite;
          filter: drop-shadow(0 0 8px rgba(239, 68, 68, 0.5));
        }

        .signal-point {
          filter: drop-shadow(0 0 4px rgba(34, 197, 94, 0.4));
          transition: all 0.3s ease;
        }

        .signal-point:hover {
          transform: scale(1.3);
        }

        /* Style des popups */
        .leaflet-popup-content-wrapper {
          border-radius: ${tokens.borderRadius.lg};
          box-shadow: ${tokens.shadows.xl};
          border: none;
          padding: 0;
        }

        .leaflet-popup-content {
          margin: ${tokens.spacing.lg};
          font-family: ${tokens.typography.fontFamily.sans};
          font-size: ${tokens.typography.fontSize.sm};
          line-height: ${tokens.typography.lineHeight.normal};
        }

        .leaflet-popup-content b {
          color: ${tokens.colors.infosys.dark}; // #005A8F
          font-weight: ${tokens.typography.fontWeight.semibold};
        }

        /* Style des contrôles de zoom - Light theme */
        .leaflet-control-zoom {
          border: none !important;
          box-shadow: ${tokens.shadows.md};
        }

        .leaflet-control-zoom a {
          background-color: ${tokens.colors.background.elevated} !important; // White
          color: ${tokens.colors.text.primary} !important; // #1A1A1A
          border: 1px solid ${tokens.colors.neutral.border} !important; // #E5E7EB
          border-radius: ${tokens.borderRadius.sm} !important;
          width: 36px !important;
          height: 36px !important;
          line-height: 36px !important;
          font-size: 20px !important;
          transition: all 0.2s ease !important;
        }

        .leaflet-control-zoom a:hover {
          background-color: ${tokens.colors.background.hover} !important; // #E5F3F9
          color: ${tokens.colors.infosys.primary} !important; // #007CC3
          border-color: ${tokens.colors.infosys.primary} !important; // #007CC3
        }

        .leaflet-control-zoom a:first-child {
          margin-bottom: 4px;
        }

        /* Attribution plus discrète */
        .leaflet-control-attribution {
          background-color: rgba(255, 255, 255, 0.9) !important;
          padding: 4px 8px !important;
          font-size: 10px !important;
          border-radius: ${tokens.borderRadius.sm};
          box-shadow: ${tokens.shadows.sm};
        }
      `}</style>
    </div>
  );
}
