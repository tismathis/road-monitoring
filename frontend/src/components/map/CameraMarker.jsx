import { Marker, Popup } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import { Video } from 'lucide-react';
import { tokens } from '../../styles/tokens';
import { useTranslation } from '../../i18n/LanguageContext';

/**
 * CameraMarker component - marker for live camera with popup
 * @param {Object} props
 * @param {Array<number>} props.position - [lat, lng]
 */
export function CameraMarker({ position }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Créer un icône custom avec lucide-react
  const cameraIcon = L.divIcon({
    className: 'custom-camera-icon',
    html: renderToStaticMarkup(
      <div style={{
        backgroundColor: tokens.colors.primary[500],
        borderRadius: '50%',
        width: '48px',
        height: '48px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: `3px solid ${tokens.colors.neutral[0]}`,
        boxShadow: '0 4px 12px rgba(34, 197, 94, 0.4)',
        animation: 'camera-pulse 2s ease-in-out infinite',
      }}>
        <Video size={24} color="#ffffff" />
      </div>
    ),
    iconSize: [48, 48],
    iconAnchor: [24, 24],
    popupAnchor: [0, -24],
  });

  const popupContentStyles = {
    textAlign: 'center',
  };

  const titleStyles = {
    marginBottom: tokens.spacing.sm,
    fontSize: tokens.typography.fontSize.base,
    fontWeight: tokens.typography.fontWeight.medium,
  };

  const buttonStyles = {
    backgroundColor: tokens.colors.primary[500],
    color: '#ffffff',
    border: 'none',
    padding: `${tokens.spacing.sm} ${tokens.spacing.lg}`,
    borderRadius: tokens.borderRadius.sm,
    cursor: 'pointer',
    fontSize: tokens.typography.fontSize.sm,
    fontWeight: tokens.typography.fontWeight.medium,
    transition: 'background-color 0.2s ease',
  };

  const handleOpenCamera = () => {
    navigate('/camera');
  };

  return (
    <>
      <Marker position={position} icon={cameraIcon}>
        <Popup>
        <div style={popupContentStyles}>
          <div style={titleStyles}>{t('map.cameraTitle')}</div>
          <button
            onClick={handleOpenCamera}
            style={buttonStyles}
            onMouseEnter={(e) => e.target.style.backgroundColor = tokens.colors.primary[600]}
            onMouseLeave={(e) => e.target.style.backgroundColor = tokens.colors.primary[500]}
          >
            {t('map.openAnalytics')}
          </button>
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
