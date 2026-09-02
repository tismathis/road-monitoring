// API Configuration
export const API_URL = 'http://127.0.0.1:8000';

// API Endpoints
export const endpoints = {
  // Map data
  roads: `${API_URL}/roads`,
  points: `${API_URL}/points`,
  historicalCrashes: `${API_URL}/historical_crashes`,

  // Camera endpoints
  cameraStats: `${API_URL}/camera/stats`,
  cameraHistory: `${API_URL}/camera/history`,
  cameraHeatmapPoints: `${API_URL}/camera/heatmap-points`,
  cameraStream: `${API_URL}/camera/stream`,

  // Statistics endpoints
  crashesByYear: `${API_URL}/stats/crashes-by-year`,
  crashesBySeverity: `${API_URL}/stats/crashes-by-severity`,
};
