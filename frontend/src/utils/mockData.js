/**
 * Mock data for Dashboard and Incidents pages
 */

// Mock incidents for demonstration
export const mockIncidents = [
  {
    id: 1,
    title: "Collision véhicule-piéton",
    severity: "serious",
    urgency: 80,
    timestamp: "14:32",
    location: "Intersection Main Mall / Khama Crescent",
    details: {
      "Type": "Collision",
      "Météo": "Ensoleillé",
      "Véhicules impliqués": "1",
      "Piétons impliqués": "1",
    },
    notifiedServices: [
      { name: "Ambulance", status: "dispatched" },
      { name: "Police", status: "inProgress" },
      { name: "Pompiers", status: "notified" },
    ]
  },
  {
    id: 2,
    title: "Excès de vitesse détecté",
    severity: "minor",
    urgency: 35,
    timestamp: "13:15",
    location: "Independence Avenue",
    details: {
      "Type": "Infraction",
      "Vitesse détectée": "85 km/h",
      "Limite": "60 km/h",
      "Météo": "Ensoleillé",
    },
    notifiedServices: [
      { name: "Police", status: "notified" },
    ]
  },
  {
    id: 3,
    title: "Accident avec blessés",
    severity: "serious",
    urgency: 90,
    timestamp: "12:48",
    location: "Queens Road / Broadhurst",
    details: {
      "Type": "Collision multiple",
      "Météo": "Pluie légère",
      "Véhicules impliqués": "3",
      "Blessés": "2",
    },
    notifiedServices: [
      { name: "Ambulance", status: "dispatched" },
      { name: "Police", status: "dispatched" },
      { name: "Pompiers", status: "inProgress" },
    ]
  },
  {
    id: 4,
    title: "Piéton traversant hors passage",
    severity: "minor",
    urgency: 25,
    timestamp: "11:20",
    location: "The Mall",
    details: {
      "Type": "Infraction piéton",
      "Météo": "Ensoleillé",
    },
    notifiedServices: [
      { name: "Police", status: "notified" },
    ]
  },
  {
    id: 5,
    title: "Accident mortel",
    severity: "fatal",
    urgency: 100,
    timestamp: "09:15",
    location: "A1 Highway Exit Gaborone",
    details: {
      "Type": "Collision frontale",
      "Météo": "Brouillard",
      "Véhicules impliqués": "2",
      "Décès": "1",
      "Blessés graves": "3",
    },
    notifiedServices: [
      { name: "Ambulance", status: "dispatched" },
      { name: "Police", status: "dispatched" },
      { name: "Pompiers", status: "dispatched" },
      { name: "Services médicaux d'urgence", status: "inProgress" },
    ]
  },
  {
    id: 6,
    title: "Stationnement illégal bloquant circulation",
    severity: "minor",
    urgency: 40,
    timestamp: "08:45",
    location: "Government Enclave",
    details: {
      "Type": "Infraction stationnement",
      "Météo": "Ensoleillé",
    },
    notifiedServices: [
      { name: "Police", status: "notified" },
    ]
  },
];

// Mock sparkline data for stat cards
export const mockSparklineData = {
  vehicles: [120, 135, 145, 138, 152, 148, 160, 155, 170, 165],
  speed: [42, 45, 43, 48, 46, 44, 47, 45, 43, 42],
  pedestrians: [25, 30, 28, 32, 35, 33, 38, 36, 40, 38],
  incidents: [5, 3, 7, 4, 6, 5, 8, 6, 5, 7],
};

// Mock key metrics
export const mockKeyMetrics = {
  camerasConnected: { current: 3, total: 3 },
  alerts24h: 12,
  zonesMonitored: 1,
};

// Mock graph data for the network visualization — road-segment topology
// only (names/layout/links are illustrative, not sourced from PostGIS).
// hasAlert always starts false: real alert state is driven live by
// useCrashSignals() from the actual camera-mapped crash detector, not
// seeded here. A node with no camera mapped to it (backend/camera_config.py
// road_node_id) simply never gets a hasAlert update and stays neutral.
export const mockGraphNodes = [
  { id: 'A1', name: 'Main Mall', type: 'main_road', hasAlert: false },
  { id: 'A2', name: 'Independence Ave', type: 'main_road', hasAlert: false },
  { id: 'A3', name: 'Queens Road', type: 'main_road', hasAlert: false },
  { id: 'A4', name: 'Khama Crescent', type: 'secondary_road', hasAlert: false },
  { id: 'A5', name: 'Broadhurst', type: 'secondary_road', hasAlert: false },
  { id: 'A6', name: 'The Mall', type: 'main_road', hasAlert: false },
  { id: 'A7', name: 'Government Enclave', type: 'secondary_road', hasAlert: false },
  { id: 'A8', name: 'Gaborone West', type: 'residential', hasAlert: false },
  { id: 'A9', name: 'CBD North', type: 'main_road', hasAlert: false },
  { id: 'A10', name: 'A1 Highway Exit', type: 'highway', hasAlert: false },
  { id: 'A11', name: 'Old Naledi', type: 'residential', hasAlert: false },
  { id: 'A12', name: 'Extension 2', type: 'residential', hasAlert: false },
  { id: 'A13', name: 'Industrial Area', type: 'industrial', hasAlert: false },
  { id: 'A14', name: 'Village', type: 'residential', hasAlert: false },
  { id: 'A15', name: 'Riverwalk', type: 'commercial', hasAlert: false },
];

// Links represent connections between road segments
export const mockGraphLinks = [
  { source: 'A1', target: 'A2', traffic: 'high' },
  { source: 'A1', target: 'A6', traffic: 'high' },
  { source: 'A2', target: 'A3', traffic: 'high' },
  { source: 'A2', target: 'A9', traffic: 'medium' },
  { source: 'A3', target: 'A5', traffic: 'medium' },
  { source: 'A4', target: 'A1', traffic: 'medium' },
  { source: 'A4', target: 'A7', traffic: 'low' },
  { source: 'A5', target: 'A8', traffic: 'medium' },
  { source: 'A6', target: 'A9', traffic: 'high' },
  { source: 'A7', target: 'A13', traffic: 'low' },
  { source: 'A8', target: 'A11', traffic: 'low' },
  { source: 'A9', target: 'A10', traffic: 'high' },
  { source: 'A10', target: 'A3', traffic: 'high' },
  { source: 'A11', target: 'A14', traffic: 'low' },
  { source: 'A12', target: 'A8', traffic: 'low' },
  { source: 'A13', target: 'A15', traffic: 'medium' },
  { source: 'A14', target: 'A15', traffic: 'low' },
  { source: 'A15', target: 'A6', traffic: 'medium' },
];
