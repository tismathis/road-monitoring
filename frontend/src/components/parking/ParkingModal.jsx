import { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { tokens } from '../../styles/tokens';
import { useTranslation } from '../../i18n/LanguageContext';

/**
 * ParkingModal component - Displays live parking lot stream with statistics
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether modal is visible
 * @param {Function} props.onClose - Callback to close modal
 *
 * Features:
 * - Live MJPEG video stream from backend showing parking lot
 * - Real-time statistics (total, available, occupied spots)
 * - Auto-refreshing stats every 2 seconds
 * - Responsive design with video scaling
 *
 * Backend endpoints used:
 * - GET /parking/stream - MJPEG video stream
 * - GET /parking/stats - JSON with parking statistics
 */
export function ParkingModal({ isOpen, onClose }) {
  const { t } = useTranslation();
  // State for parking statistics
  // Initial state: null means data not loaded yet
  const [stats, setStats] = useState(null);

  /**
   * useEffect hook to fetch parking statistics
   *
   * Runs when:
   * - Modal opens (isOpen becomes true)
   * - Every 2 seconds while modal is open
   *
   * Why we need this:
   * - Parking availability changes in real-time
   * - We want to show up-to-date numbers without refreshing the page
   */
  useEffect(() => {
    // Don't fetch if modal is closed
    if (!isOpen) return;

    /**
     * Fetch parking stats from backend
     *
     * Backend returns JSON like:
     * {
     *   "total_spots": 50,
     *   "available_spots": 12,
     *   "occupied_spots": 38
     * }
     */
    const fetchStats = async () => {
      try {
        const response = await fetch('http://localhost:8000/parking/stats');
        const data = await response.json();
        setStats(data);  // Update state with new stats
      } catch (error) {
        console.error('Error fetching parking stats:', error);
      }
    };

    // Fetch immediately when modal opens
    fetchStats();

    // Set up interval to fetch every 2 seconds
    const interval = setInterval(fetchStats, 2000);

    // Cleanup function: runs when modal closes or component unmounts
    // This prevents memory leaks by clearing the interval
    return () => clearInterval(interval);

  }, [isOpen]);  // Re-run effect when isOpen changes

  // Container for the entire modal content
  const containerStyles = {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing.lg,
  };

  // Style for the video container
  const videoContainerStyles = {
    width: '100%',
    backgroundColor: tokens.colors.neutral[900],  // Black background
    borderRadius: tokens.borderRadius.lg,
    overflow: 'hidden',
    boxShadow: tokens.shadows.lg,
  };

  // Style for the video stream image
  const videoStyles = {
    width: '100%',
    height: 'auto',
    display: 'block',  // Remove bottom space
  };

  // Container for statistics cards
  const statsContainerStyles = {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',  // 3 equal columns
    gap: tokens.spacing.md,
    marginTop: tokens.spacing.md,
  };

  // Style for individual stat cards
  const statCardStyles = {
    padding: tokens.spacing.lg,
    borderRadius: tokens.borderRadius.md,
    textAlign: 'center',
    boxShadow: tokens.shadows.sm,
  };

  // Style for stat labels (e.g., "Total Spots")
  const statLabelStyles = {
    fontSize: tokens.typography.fontSize.sm,
    fontWeight: tokens.typography.fontWeight.medium,
    color: tokens.colors.neutral[600],
    marginBottom: tokens.spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  };

  // Style for stat values (e.g., "50")
  const statValueStyles = {
    fontSize: tokens.typography.fontSize['3xl'],
    fontWeight: tokens.typography.fontWeight.bold,
    margin: 0,
  };

  /**
   * Calculate occupancy percentage
   *
   * Formula: (occupied / total) * 100
   * Used to show how full the parking lot is
   */
  const getOccupancyPercentage = () => {
    if (!stats || stats.total_spots === 0) return 0;
    return Math.round((stats.occupied_spots / stats.total_spots) * 100);
  };

  // Description text showing occupancy rate
  const descriptionStyles = {
    fontSize: tokens.typography.fontSize.sm,
    color: tokens.colors.neutral[600],
    textAlign: 'center',
    marginTop: tokens.spacing.sm,
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('parking.title')}
      width="95vw"
      maxWidth="1400px"
    >
      <div style={containerStyles}>

        {/* Video Stream Section */}
        <div style={videoContainerStyles}>
          {/*
            MJPEG Stream Explanation:

            The <img> tag can display MJPEG streams by setting src to the stream URL.
            MJPEG (Motion JPEG) works like this:
            - Server sends a continuous stream of JPEG images
            - Each image is separated by a boundary marker
            - Browser displays them one after another (like a video)

            How our backend generates this:
            1. parking_mjpeg_generator() yields frames continuously
            2. Each frame is wrapped with boundary markers
            3. Content-Type: multipart/x-mixed-replace tells browser to replace
               the image with each new frame

            Result: Smooth video playback with no need for complex video codecs
          */}
          <img
            src="http://localhost:8000/parking/stream"
            alt={t('parking.alt')}
            style={videoStyles}
          />
        </div>

        {/* Statistics Section */}
        {stats && (
          <>
            <div style={statsContainerStyles}>

              {/* Total Spots Card */}
              <div style={{
                ...statCardStyles,
                backgroundColor: tokens.colors.neutral[100],
              }}>
                <div style={statLabelStyles}>{t('parking.total')}</div>
                <p style={{
                  ...statValueStyles,
                  color: tokens.colors.neutral[800],
                }}>
                  {stats.total_spots}
                </p>
              </div>

              {/* Available Spots Card (Green) */}
              <div style={{
                ...statCardStyles,
                backgroundColor: tokens.colors.primary[50],  // Green background
                border: `2px solid ${tokens.colors.primary[100]}`,
              }}>
                <div style={{
                  ...statLabelStyles,
                  color: tokens.colors.primary[700],  // Dark green text
                }}>
                  {t('parking.available')}
                </div>
                <p style={{
                  ...statValueStyles,
                  color: tokens.colors.primary[700],
                }}>
                  {stats.available_spots}
                </p>
              </div>

              {/* Occupied Spots Card (Red) */}
              <div style={{
                ...statCardStyles,
                backgroundColor: '#fee2e2',  // Light red background
                border: '2px solid #fecaca',  // Red border
              }}>
                <div style={{
                  ...statLabelStyles,
                  color: '#b91c1c',  // Dark red text
                }}>
                  {t('parking.occupied')}
                </div>
                <p style={{
                  ...statValueStyles,
                  color: '#b91c1c',
                }}>
                  {stats.occupied_spots}
                </p>
              </div>

            </div>

            {/* Occupancy Percentage Description */}
            <div style={descriptionStyles}>
              <strong>{t('parking.description', { percent: getOccupancyPercentage() })}</strong>
              {' • '}
              <span style={{ color: tokens.colors.primary[600] }}>
                {t('parking.green')}
              </span>
              {t('parking.greenDetail')}
              <span style={{ color: '#dc2626' }}>
                {t('parking.red')}
              </span>
              {t('parking.redDetail')}
            </div>
          </>
        )}

        {/* Loading state while stats are being fetched */}
        {!stats && (
          <div style={{
            textAlign: 'center',
            padding: tokens.spacing.xl,
            color: tokens.colors.neutral[600],
          }}>
            {t('parking.loading')}
          </div>
        )}

      </div>
    </Modal>
  );
}
