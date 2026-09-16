import { useState, useEffect } from 'react';
import { endpoints } from '../utils/api';
import { authGet } from '../utils/authFetch';

/**
 * Hook to fetch and poll heatmap points data
 * @param {boolean} enabled - Whether to enable polling
 * @param {number} pollInterval - Polling interval in milliseconds (default: 1000)
 * @returns {Array} Heatmap points array
 */
export function useHeatmapPoints(enabled, pollInterval = 1000) {
  const [points, setPoints] = useState([]);

  useEffect(() => {
    if (!enabled) {
      setPoints([]);
      return;
    }

    const fetchPoints = async () => {
      try {
        const data = await authGet(endpoints.cameraHeatmapPoints);
        setPoints(data);
      } catch (err) {
        console.error('Error fetching heatmap points:', err);
      }
    };

    // Initial fetch
    fetchPoints();

    // Set up polling
    const interval = setInterval(fetchPoints, pollInterval);

    // Cleanup
    return () => clearInterval(interval);
  }, [enabled, pollInterval]);

  return points;
}
