import { Marker, Popup } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import { Video, SquareParking } from 'lucide-react';
import { useTranslation } from '../../i18n/LanguageContext';

/**
 * CameraMarker — restrained GIS-style node marker for a live camera or
 * parking sensor. Deep-links straight to that camera's dashboard.
 *
 * @param {Object} props
 * @param {Array<number>} props.position - [lat, lng]
 * @param {string} props.cameraId
 * @param {string} props.cameraName
 * @param {string} props.cameraType - "traffic" | "parking"
 * @param {boolean} props.isOnline
 */
export function CameraMarker({
  position,
  cameraId = 'traffic_main_gaborone',
  cameraName,
  cameraType = 'traffic',
  isOnline = true,
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const ringColor = isOnline ? '#007CC3' : '#7C93A1';
  const Icon = cameraType === 'parking' ? SquareParking : Video;

  const cameraIcon = L.divIcon({
    className: 'gb-camera-icon',
    html: renderToStaticMarkup(
      <div style={{ position: 'relative', width: 34, height: 34 }}>
        {isOnline && (
          <span
            className="gb-radar-ring"
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '9999px',
              border: `1.5px solid ${ringColor}`,
            }}
          />
        )}
        <div
          style={{
            position: 'absolute',
            inset: 6,
            borderRadius: '9999px',
            background: '#10161D',
            border: `1.5px solid ${ringColor}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <Icon size={13} color={ringColor} strokeWidth={2} />
        </div>
      </div>
    ),
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -17],
  });

  const handleMarkerClick = () => {
    navigate(`/camera/${cameraId}`);
  };

  return (
    <Marker position={position} icon={cameraIcon} eventHandlers={{ click: handleMarkerClick }}>
      <Popup>
        <div style={{ fontSize: 12, minWidth: 140 }}>
          <strong>{cameraName || t('map.cameraTitle')}</strong>
          <div style={{ fontSize: 11, color: '#7C93A1', marginTop: 4 }}>
            {isOnline ? t('console.live') : t('console.offline')} · {t('map.openAnalytics')}
          </div>
        </div>
      </Popup>
    </Marker>
  );
}
