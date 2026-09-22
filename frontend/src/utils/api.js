// API Configuration
export const API_URL = 'http://127.0.0.1:8000';

// API Endpoints
export const endpoints = {
  // Authentication endpoints
  login: `${API_URL}/auth/login`,
  me: `${API_URL}/auth/me`,
  register: `${API_URL}/auth/register`,
  users: `${API_URL}/auth/users`,
  userById: (id) => `${API_URL}/auth/users/${id}`,

  // Map data
  roads: `${API_URL}/roads`,
  points: `${API_URL}/points`,
  historicalCrashes: `${API_URL}/historical_crashes`,

  // Camera endpoints
  cameraStats: `${API_URL}/camera/stats`,
  cameraHistory: `${API_URL}/camera/history`,
  cameraHeatmapPoints: `${API_URL}/camera/heatmap-points`,
  cameraStream: `${API_URL}/camera/stream`,

  // Parking endpoints
  parkingStats: `${API_URL}/parking/stats`,
  parkingStream: `${API_URL}/parking/stream`,

  // Statistics endpoints
  crashesByYear: `${API_URL}/stats/crashes-by-year`,
  crashesBySeverity: `${API_URL}/stats/crashes-by-severity`,
  roadUserFatalities: `${API_URL}/stats/road-user-fatalities`,
  greaterGaboroneCrashes: `${API_URL}/stats/greater-gaborone-crashes`,

  // Generic multi-camera endpoints
  cameras: `${API_URL}/cameras`,
  cameraById: (id) => `${API_URL}/cameras/${id}`,
  cameraStreamById: (id) => `${API_URL}/cameras/${id}/stream`,
  cameraStatsById: (id) => `${API_URL}/cameras/${id}/stats`,
  cameraHistoryById: (id) => `${API_URL}/cameras/${id}/history`,
  cameraHeatmapById: (id) => `${API_URL}/cameras/${id}/heatmap-points`,
  cameraKpisById: (id) => `${API_URL}/cameras/${id}/kpis`,
  cameraCrashSignalById: (id) => `${API_URL}/cameras/${id}/crash-signal`,
};
