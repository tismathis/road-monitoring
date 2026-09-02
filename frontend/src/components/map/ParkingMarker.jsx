import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import { ParkingSquare } from 'lucide-react';
import { tokens } from '../../styles/tokens';
import { useTranslation } from '../../i18n/LanguageContext';

/**
 * ParkingMarker component - Clickable marker for parking lot monitoring
 *
 * @param {Object} props
 * @param {Array<number>} props.position - Geographic coordinates [lat, lng]
 * @param {Function} props.onClick - Callback when marker is clicked
 *
 * How it works:
 * 1. Renders a custom parking icon on the map using Leaflet's divIcon
 * 2. The icon is created from a React component (ParkingSquare from lucide-react)
 * 3. When clicked, it opens a modal showing the live parking stream
 *
 * Visual design:
 * - Blue circular background (using tokens.colors.info)
 * - White parking icon from lucide-react
 * - Pulsing animation to attract attention
 * - Drop shadow for depth
 */
export function ParkingMarker({ position, onClick }) {
  const { t } = useTranslation();

  /**
   * Create custom parking icon using Leaflet's divIcon
   *
   * divIcon allows us to use HTML/CSS instead of image files
   * We render a React component (ParkingSquare) to static HTML using renderToStaticMarkup
   *
   * Icon configuration:
   * - className: CSS class for styling the icon container
   * - html: The actual HTML/SVG content of the icon
   * - iconSize: [width, height] in pixels
   * - iconAnchor: [x, y] offset from position (center the 48x48 icon)
   * - popupAnchor: [x, y] where popup appears relative to icon
   */
  const parkingIcon = L.divIcon({
    className: 'custom-parking-icon',  // Custom CSS class (defined below)

    // Render React component to static HTML string
    html: renderToStaticMarkup(
      <div style={{
        backgroundColor: tokens.colors.severity.info,  // Blue background (fixed path)
        borderRadius: '50%',                       // Make it circular
        width: '48px',
        height: '48px',
        display: 'flex',                          // Flexbox for centering
        alignItems: 'center',
        justifyContent: 'center',
        border: `3px solid ${tokens.colors.neutral[0]}`,  // White border
        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.5)', // Blue glow
        cursor: 'pointer',                        // Show it's clickable
        animation: 'parking-pulse 2s ease-in-out infinite',  // Pulsing animation
      }}>
        {/* ParkingSquare icon from lucide-react */}
        <ParkingSquare size={24} color="#ffffff" strokeWidth={2} />
      </div>
    ),

    iconSize: [48, 48],      // Icon dimensions
    iconAnchor: [24, 24],    // Anchor point (center of 48x48)
    popupAnchor: [0, -24],   // Popup appears above the icon
  });

  // Styles for the popup content
  const popupContentStyles = {
    textAlign: 'center',
    padding: tokens.spacing.xs,
  };

  const titleStyles = {
    marginBottom: tokens.spacing.sm,
    fontSize: tokens.typography.fontSize.base,
    fontWeight: tokens.typography.fontWeight.medium,
    color: tokens.colors.neutral[800],
  };

  const buttonStyles = {
    backgroundColor: tokens.colors.severity.info,  // Blue button (fixed path)
    color: '#ffffff',
    border: 'none',
    padding: `${tokens.spacing.sm} ${tokens.spacing.lg}`,
    borderRadius: tokens.borderRadius.sm,
    cursor: 'pointer',
    fontSize: tokens.typography.fontSize.sm,
    fontWeight: tokens.typography.fontWeight.medium,
    transition: 'background-color 0.2s ease',
    width: '100%',  // Full width button
  };

  /**
   * Handle click on the "View Parking" button
   *
   * Calls the onClick prop passed from parent component
   * This will open the parking modal in the parent
   */
  const handleOpenParking = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <>
      {/* Leaflet Marker component with custom icon */}
      <Marker position={position} icon={parkingIcon}>
        {/* Popup that appears when marker is clicked */}
        <Popup>
          <div style={popupContentStyles}>
            {/* Title with parking emoji */}
            <div style={titleStyles}>{t('parking.title')}</div>

            {/* Button to open the parking stream modal */}
            <button
              onClick={handleOpenParking}
              style={buttonStyles}
              // Hover effect: darken button color
              onMouseEnter={(e) => e.target.style.backgroundColor = '#2563eb'}
              onMouseLeave={(e) => e.target.style.backgroundColor = tokens.colors.severity.info}
            >
              {t('parking.view')}
            </button>
          </div>
        </Popup>
      </Marker>

      {/* CSS animation for the pulsing effect */}
      <style>{`
        /* Keyframe animation: makes the icon pulse (grow/shrink) */
        @keyframes parking-pulse {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.5);
          }
          50% {
            transform: scale(1.1);  /* Slightly larger at midpoint */
            box-shadow: 0 6px 20px rgba(59, 130, 246, 0.7);  /* Stronger glow */
          }
        }

        /* Remove default Leaflet icon styling */
        .custom-parking-icon {
          background: transparent !important;
          border: none !important;
        }

        /* Ensure the icon div is properly positioned */
        .custom-parking-icon > div {
          position: relative;
        }
      `}</style>
    </>
  );
}
