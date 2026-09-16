import { useState, useEffect } from 'react';
import { authGet } from '../utils/authFetch';

/**
 * Generic hook to fetch data from any camera endpoint.
 * Replaces the hardcoded useCameraStats, useCameraHistory, useHeatmapPoints hooks
 * with a single parametrized hook that works for any camera.
 *
 * @param {string} cameraId - Camera ID (e.g., "traffic_main_gaborone", "parking_gaborone_lot1")
 * @param {string} endpoint - Endpoint suffix (e.g., 'stats', 'history', 'heatmap-points', 'kpis')
 * @param {number} pollInterval - Polling interval in milliseconds (default: 3000)
 * @returns {Object|Array} - Data from the endpoint (object for stats/kpis, array for history/heatmap)
 */
export function useGenericCameraData(cameraId, endpoint, pollInterval = 3000) {
  // Initialize with appropriate empty value based on endpoint type
  const initialValue = (endpoint === 'history' || endpoint === 'heatmap-points') ? [] : {};
  const [data, setData] = useState(initialValue);

  useEffect(() => {
    if (!cameraId) return;

    const fetchData = async () => {
      try {
        const result = await authGet(`http://127.0.0.1:8000/cameras/${cameraId}/${endpoint}`);
        setData(result);
      } catch (err) {
        console.error(`Error fetching camera ${cameraId} ${endpoint}:`, err);
      }
    };

    // Initial fetch
    fetchData();

    // Set up polling
    const interval = setInterval(fetchData, pollInterval);

    // Cleanup
    return () => clearInterval(interval);
  }, [cameraId, endpoint, pollInterval]);

  return data;
}


/**
 * Hook to fetch list of all cameras with status information.
 * Polls the /cameras endpoint to get registry of all cameras.
 *
 * @param {number} pollInterval - Polling interval in milliseconds (default: 5000)
 * @returns {Array} - Array of camera objects with status and metadata
 */
export function useCameraList(pollInterval = 5000) {
  const [cameras, setCameras] = useState([]);

  useEffect(() => {
    const fetchCameras = async () => {
      try {
        const result = await authGet('http://127.0.0.1:8000/cameras');
        setCameras(result);
      } catch (err) {
        console.error('Error fetching camera list:', err);
      }
    };

    // Initial fetch
    fetchCameras();

    // Set up polling
    const interval = setInterval(fetchCameras, pollInterval);

    // Cleanup
    return () => clearInterval(interval);
  }, [pollInterval]);

  return cameras;
}
