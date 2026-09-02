import { useState, useEffect } from 'react';
import { endpoints } from '../utils/api';

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

    const fetchPoints = () => {
      fetch(endpoints.cameraHeatmapPoints)
        .then(res => res.json())
        .then(setPoints)
        .catch(err => console.error('Error fetching heatmap points:', err));
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
