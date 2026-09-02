import { useState, useEffect } from 'react';
import { endpoints } from '../utils/api';

/**
 * Hook to fetch and poll camera history data
 * @param {number} pollInterval - Polling interval in milliseconds (default: 3000)
 * @returns {Array} Camera history data array
 */
export function useCameraHistory(pollInterval = 3000) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchHistory = () => {
      fetch(endpoints.cameraHistory)
        .then(res => res.json())
        .then(setHistory)
        .catch(err => console.error('Error fetching camera history:', err));
    };

    // Initial fetch
    fetchHistory();

    // Set up polling
    const interval = setInterval(fetchHistory, pollInterval);

    // Cleanup
    return () => clearInterval(interval);
  }, [pollInterval]);

  return history;
}
