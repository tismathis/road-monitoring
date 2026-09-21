import { MapContainer, TileLayer, GeoJSON, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import { CameraMarker } from './CameraMarker';
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
 * @param {boolean} props.showLegend - Whether to show legend (default: true)
 * @param {boolean} props.zoomControl - Whether to render Leaflet's own zoom control (default: false; the console renders its own GIS-style control cluster instead)
 */
export function MapView({
  center = [-24.6539, 25.9010],
  zoom = 15,
  roads,
  points,
  crashes,
  cameraPosition = [-24.6539, 25.9010],  // DEPRECATED: Use cameras list instead
  showLegend = true,
  zoomControl = false,
}) {
  const { t } = useTranslation();

  // Live camera registry from the backend (position, online state, live counts)
  const cameras = useCameraList(10000);

  const crashPointStyle = (feature) => {
    const severity = feature.properties.severity;
    let color = tokens.colors.severity.minor;
    if (severity === 'fatal') color = tokens.colors.severity.fatal;
    else if (severity === 'serious_injury') color = tokens.colors.severity.serious;
    return {
      radius: 6,
      fillColor: color,
      color: 'rgba(11,15,18,0.6)',
      weight: 1.5,
      fillOpacity: 0.9,
      className: 'crash-marker',
    };
  };

  const roadStyle = {
    color: tokens.colors.infosys.primary, // #007CC3
    weight: 2.5,
    opacity: 0.55,
    lineCap: 'round',
    lineJoin: 'round',
  };

  const pointStyle = {
    radius: 3.5,
    fillColor: tokens.colors.infosys.primary,
    color: 'rgba(11,15,18,0.6)',
    weight: 1,
    fillOpacity: 0.85,
    className: 'signal-point',
  };

  return (
    <div style={{ position: 'relative', height: '100%', width: '100%' }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          url={DEFAULT_MAP_STYLE.url}
          attribution={DEFAULT_MAP_STYLE.attribution}
          subdomains={DEFAULT_MAP_STYLE.subdomains}
          maxZoom={DEFAULT_MAP_STYLE.maxZoom}
        />

        {roads && <GeoJSON data={roads} style={roadStyle} />}

        {points && (
          <GeoJSON
            data={points}
            pointToLayer={(feature, latlng) => L.circleMarker(latlng, pointStyle)}
          />
        )}

        {crashes && (
          <GeoJSON
            data={crashes}
            pointToLayer={(feature, latlng) => L.circleMarker(latlng, crashPointStyle(feature))}
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

        {cameras.length > 0 ? (
          cameras.map((camera) => (
            <CameraMarker
              key={camera.id}
              position={camera.position}
              cameraId={camera.id}
              cameraName={camera.name}
              cameraType={camera.type}
              isOnline={camera.is_online}
            />
          ))
        ) : (
          <CameraMarker
            position={cameraPosition}
            cameraId="traffic_main_gaborone"
            cameraName="Traffic Camera"
            cameraType="traffic"
            isOnline
          />
        )}

        {zoomControl && <ZoomControl position="bottomright" />}
      </MapContainer>

      {showLegend && <MapLegend />}

      <style>{`
        @keyframes pulse-marker {
          0%, 100% { transform: scale(1); opacity: 0.9; }
          50% { transform: scale(1.15); opacity: 1; }
        }
        .crash-marker {
          animation: pulse-marker 2.2s ease-in-out infinite;
        }
        .signal-point {
          transition: transform 0.2s ease;
        }
        .signal-point:hover {
          transform: scale(1.25);
        }
      `}</style>
    </div>
  );
}
