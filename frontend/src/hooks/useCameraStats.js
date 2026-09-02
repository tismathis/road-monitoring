import { useState, useEffect } from 'react';
import { endpoints } from '../utils/api';

/**
 * Hook to fetch and poll camera detection statistics
 * @param {number} pollInterval - Polling interval in milliseconds (default: 3000)
 * @returns {Object} Camera stats object
 */
export function useCameraStats(pollInterval = 3000) {
  const [stats, setStats] = useState({});

  useEffect(() => {
    const fetchStats = () => {
      fetch(endpoints.cameraStats)
        .then(res => res.json())
        .then(setStats)
        .catch(err => console.error('Error fetching camera stats:', err));
    };

    // Initial fetch
    fetchStats();

    // Set up polling
    const interval = setInterval(fetchStats, pollInterval);

    // Cleanup
    return () => clearInterval(interval);
  }, [pollInterval]);

  return stats;
}
