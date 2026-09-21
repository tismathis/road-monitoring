/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const translations = {
  en: {
    'app.title': 'RoadWatch — Road Monitoring', 'user.admin': 'Admin',
    'language.label': 'Language', 'language.english': 'English', 'language.french': 'French',
    'top.subtitle': 'Road monitoring zone', 'top.online': 'Online', 'top.offline': 'Offline', 'top.updated': 'Last updated',
    'nav.monitoring': 'Monitoring', 'nav.dashboard': 'Dashboard', 'nav.map': 'Live map',
    'nav.incidents': 'Incidents', 'nav.events': 'Events', 'nav.cameraWall': 'Camera Wall', 'nav.camera': 'Live camera',
    'nav.analytics': 'Analytics', 'nav.graph2d': '2D graph', 'nav.graph3d': '3D graph',
    'nav.statistics': 'Statistics', 'nav.system': 'System', 'nav.settings': 'Settings',
    'dashboard.title': 'Dashboard — Overview', 'dashboard.cameras': 'Connected cameras', 'dashboard.alerts': '24-hour alerts',
    'dashboard.zones': 'Monitored zones', 'dashboard.realtime': 'Real-time metrics',
    'dashboard.vehicles': 'Vehicles detected', 'dashboard.speed': 'Average speed', 'dashboard.pedestrians': 'Pedestrians detected',
    'dashboard.activeIncidents': 'Active incidents', 'dashboard.recentIncidents': 'Recent incidents',
    'incidents.title': 'Events & Incidents', 'incidents.filter': 'Filter by severity:', 'incidents.all': 'All',
    'severity.fatal': 'Fatal', 'severity.serious': 'Serious', 'severity.serious_injury': 'Serious injury', 'severity.minor': 'Minor',
    'incidents.showing': 'Showing {count} incident{plural}', 'incidents.filtered': ' (filtered by: {severity})',
    'incidents.empty': 'No incidents found for this filter.', 'incident.urgency': 'Urgency level',
    'incident.time': 'Time', 'incident.location': 'Location', 'incident.services': 'Services notified',
    'status.dispatched': 'Dispatched', 'status.inProgress': 'In progress', 'status.notified': 'Notified',
    'camera.title': 'Live Camera — Real-time Analytics', 'camera.loading': 'Loading camera data…',
    'camera.debug': 'Debug:', 'camera.statsLoaded': 'Stats loaded:', 'common.yes': 'Yes ✓', 'common.noWaiting': 'No (waiting…)',
    'camera.history': 'History:', 'camera.points': 'points', 'camera.totalObjects': 'Total objects:',
    'camera.alt': 'Live camera feed with object detection', 'camera.unavailable': 'Video stream unavailable',
    'camera.backend': 'Check that the backend is running at http://127.0.0.1:8000',
    'camera.hideHeatmap': 'Hide heatmap', 'camera.showHeatmap': 'Show heatmap',
    'camera.note': 'Live detection and tracking — objects are counted once per unique tracking ID.',
    'camera.heatmapNote': ' The heatmap reflects recent detection density (sliding window), not historical accumulation.',
    'camera.total': 'Total objects', 'camera.detectedByType': 'Objects detected by type', 'camera.trafficOverTime': 'Traffic volume over time',
    'object.car': 'Cars', 'object.bus': 'Buses', 'object.person': 'Pedestrians',
    'export.failed': 'Export failed. Please try again.', 'export.csvFailed': 'CSV export failed. Please try again.',
    'map.loading': 'Loading map…', 'map.monitoredZone': 'Monitored zone', 'map.subzone': 'Sub-zone', 'map.coordinates': 'Coordinates',
    'map.industrialZone': 'Industrial zone', 'map.legend': 'Legend', 'map.fatal': 'Fatal crash', 'map.serious': 'Serious injury',
    'map.minor': 'Minor crash', 'map.signal': 'Traffic light / Crosswalk', 'map.year': 'Year', 'map.deaths': 'Fatalities', 'map.source': 'Source',
    'map.cameraTitle': '📹 Live traffic camera', 'map.openAnalytics': 'Open analytics',
    'console.live': 'Live', 'console.offline': 'Offline', 'console.delayed': 'Delayed',
    'console.systemNormal': 'All systems normal', 'console.vehicleCount': 'Vehicle count',
    'console.trafficFlow': 'Traffic flow', 'console.parkingOcc': 'Parking occupancy',
    'console.activeCameras': 'Active cameras', 'console.incidents': 'Incidents',
    'console.acknowledge': 'Acknowledge', 'console.dispatch': 'Dispatch', 'console.scale': 'Scale',
    'console.operator': 'Operator', 'console.zoomIn': 'Zoom in', 'console.zoomOut': 'Zoom out',
    'console.locate': 'Recenter', 'console.layers': 'Layers', 'console.networkStatus': 'Network status',
    'console.flowLow': 'Low', 'console.flowModerate': 'Moderate', 'console.flowHeavy': 'Heavy',
    'console.logout': 'Sign out', 'console.backToApp': 'Back to app',
    'parking.title': '🅿️ Parking Lot Monitoring', 'parking.view': 'View live parking', 'parking.alt': 'Live parking lot stream',
    'parking.total': 'Total spots', 'parking.available': 'Available', 'parking.occupied': 'Occupied',
    'parking.description': 'Parking lot is {percent}% occupied', 'parking.green': 'Green boxes',
    'parking.greenDetail': ' indicate available spots • ', 'parking.red': 'Red boxes', 'parking.redDetail': ' indicate occupied spots',
    'parking.loading': 'Loading parking statistics…',
    'stats.loading': 'Loading statistics…', 'stats.title': 'Historical Statistics', 'stats.totalCrashes': 'Total Recorded Crashes',
    'stats.totalDeaths': 'Total Fatalities', 'stats.crashesByYear': 'Crashes by Year', 'stats.deaths': 'Fatalities',
    'stats.deathTrend': 'Fatality Trend', 'stats.severityDistribution': 'Distribution by Severity',
    'graph.road2d': '2D Road Network', 'graph.alert': 'alert', 'graph.alerts': 'alerts', 'graph.active': 'active',
    'graph.segments': 'road segments', 'graph.roads': 'roads', 'graph.connections': 'connections', 'graph.resetView': 'Reset View',
    'graph.accidentAlert': 'Crash Alert', 'graph.normalRoad': 'Normal Road', 'graph.activeAlert': 'ACTIVE ALERT', 'graph.normal': 'NORMAL',
    'graph.disableAlert': 'Disable Alert', 'graph.simulateAlert': 'Simulate Alert', 'graph.segmentId': 'Segment ID',
    'graph.roadId': 'Road ID', 'graph.roadType': 'Road Type', 'graph.type': 'Type', 'graph.state': 'Status',
    'graph.accidentDetected': 'ALERT — Crash detected', 'graph.normalTraffic': 'Normal — Traffic flowing',
    'graph.neural3d': '3D Neural Network — City Overview', 'graph.stopSimulation': 'Stop Simulation', 'graph.startSimulation': 'Start Simulation',
    'graph.reset': 'Reset', 'graph.accidentActive': 'Crash / Active Alert', 'graph.alertConnection': 'Connection with Alert',
    'graph.normalConnection': 'Normal Connection', 'graph.trafficNormal': 'NORMAL TRAFFIC', 'graph.detected': 'CRASH DETECTED',
    'graph.neuralVisualization': '3D Neural Visualization',
    'graph.description': 'This view represents Gaborone’s road network as a 3D neural system. Each neuron (glowing sphere) represents a road segment or intersection. Green connections indicate normal traffic, while red connections and pulsing neurons signal crashes or active alerts. Animated particles simulate traffic flow through the network.',
    'road.main_road': 'MAIN ROAD', 'road.secondary_road': 'SECONDARY ROAD', 'road.residential': 'RESIDENTIAL', 'road.highway': 'HIGHWAY', 'road.industrial': 'INDUSTRIAL', 'road.commercial': 'COMMERCIAL',
    'settings.title': 'Settings', 'settings.soon': 'Configuration settings will be available soon.',
    'settings.description': 'This page will let you configure monitoring zones, alert thresholds, and user preferences.',
    'common.close': 'Close',
    'incident.title.1': 'Vehicle–pedestrian collision', 'incident.title.2': 'Speeding detected', 'incident.title.3': 'Injury crash',
    'incident.title.4': 'Pedestrian crossing outside crosswalk', 'incident.title.5': 'Fatal crash', 'incident.title.6': 'Illegal parking blocking traffic',
    'detail.Type': 'Type', 'detail.Météo': 'Weather', 'detail.Véhicules impliqués': 'Vehicles involved',
    'detail.Piétons impliqués': 'Pedestrians involved', 'detail.Vitesse détectée': 'Detected speed', 'detail.Limite': 'Limit',
    'detail.Blessés': 'Injured', 'detail.Décès': 'Fatalities', 'detail.Blessés graves': 'Seriously injured',
    'value.Collision': 'Collision', 'value.Ensoleillé': 'Sunny', 'value.Infraction': 'Violation', 'value.Collision multiple': 'Multiple-vehicle collision',
    'value.Pluie légère': 'Light rain', 'value.Infraction piéton': 'Pedestrian violation', 'value.Collision frontale': 'Head-on collision',
    'value.Brouillard': 'Fog', 'value.Infraction stationnement': 'Parking violation',
    'service.Ambulance': 'Ambulance', 'service.Police': 'Police', 'service.Pompiers': 'Fire department',
    'service.Services médicaux d’urgence': 'Emergency medical services',
  },
  fr: {
    'language.label': 'Langue', 'language.english': 'Anglais', 'language.french': 'Français',
    'top.subtitle': 'Zone de surveillance routière', 'top.online': 'En ligne', 'top.offline': 'Hors ligne', 'top.updated': 'Dernière mise à jour',
    'nav.monitoring': 'Surveillance', 'nav.dashboard': 'Tableau de bord', 'nav.map': 'Carte en direct',
    'nav.incidents': 'Incidents', 'nav.events': 'Événements', 'nav.cameraWall': 'Mur de caméras', 'nav.camera': 'Caméra en direct',
    'nav.analytics': 'Analytique', 'nav.graph2d': 'Graphe 2D', 'nav.graph3d': 'Graphe 3D',
    'nav.statistics': 'Statistiques', 'nav.system': 'Système', 'nav.settings': 'Paramètres',
    'console.live': 'En direct', 'console.offline': 'Hors ligne', 'console.delayed': 'Retardé',
    'console.systemNormal': 'Tous les systèmes sont normaux', 'console.vehicleCount': 'Véhicules comptés',
    'console.trafficFlow': 'Trafic', 'console.parkingOcc': 'Occupation parking',
    'console.activeCameras': 'Caméras actives', 'console.incidents': 'Incidents',
    'console.acknowledge': 'Accuser réception', 'console.dispatch': 'Dépêcher', 'console.scale': 'Échelle',
    'console.operator': 'Opérateur', 'console.zoomIn': 'Zoomer', 'console.zoomOut': 'Dézoomer',
    'console.locate': 'Recentrer', 'console.layers': 'Couches', 'console.networkStatus': 'État du réseau',
    'console.flowLow': 'Faible', 'console.flowModerate': 'Modéré', 'console.flowHeavy': 'Dense',
    'console.logout': 'Déconnexion', 'console.backToApp': 'Retour à l’application',
  },
};

// French falls back to the former French UI wording declared here.
const frenchFallbacks = {
  'app.title': 'RoadWatch — Surveillance routière', 'user.admin': 'Administrateur',
  'dashboard.title': "Tableau de bord — Vue d’ensemble", 'dashboard.cameras': 'Caméras connectées', 'dashboard.alerts': 'Alertes sur 24 h', 'dashboard.zones': 'Zones surveillées',
  'dashboard.realtime': 'Métriques en temps réel', 'dashboard.vehicles': 'Véhicules détectés', 'dashboard.speed': 'Vitesse moyenne', 'dashboard.pedestrians': 'Piétons détectés', 'dashboard.activeIncidents': 'Incidents actifs', 'dashboard.recentIncidents': 'Incidents récents',
  'incidents.title': 'Événements et incidents', 'incidents.filter': 'Filtrer par sévérité :', 'incidents.all': 'Tous', 'severity.fatal': 'Mortel', 'severity.serious': 'Grave', 'severity.serious_injury': 'Blessure grave', 'severity.minor': 'Mineur',
  'incidents.showing': 'Affichage de {count} incident{plural}', 'incidents.filtered': ' (filtrés par : {severity})', 'incidents.empty': 'Aucun incident trouvé pour ce filtre.',
  'incident.urgency': "Niveau d’urgence", 'incident.time': 'Heure', 'incident.location': 'Localisation', 'incident.services': 'Services notifiés',
  'status.dispatched': 'Dépêché', 'status.inProgress': 'En cours', 'status.notified': 'Notifié',
  'camera.title': 'Caméra en direct — Analyse en temps réel', 'camera.loading': 'Chargement des données de la caméra…', 'camera.debug': 'Débogage :', 'camera.statsLoaded': 'Statistiques chargées :',
  'common.yes': 'Oui ✓', 'common.noWaiting': 'Non (en attente…)', 'camera.history': 'Historique :', 'camera.points': 'points', 'camera.totalObjects': 'Total des objets :',
  'camera.alt': "Flux caméra en direct avec détection d’objets", 'camera.unavailable': 'Flux vidéo indisponible', 'camera.backend': 'Vérifiez que le serveur est lancé sur http://127.0.0.1:8000',
  'camera.hideHeatmap': 'Masquer la carte thermique', 'camera.showHeatmap': 'Afficher la carte thermique', 'camera.note': 'Détection et suivi en direct — les objets sont comptés une fois par identifiant de suivi unique.',
  'camera.heatmapNote': ' La carte thermique reflète la densité de détection récente (fenêtre glissante), et non une accumulation historique.', 'camera.total': 'Total des objets',
  'camera.detectedByType': 'Objets détectés par type', 'camera.trafficOverTime': 'Volume du trafic dans le temps', 'object.car': 'Voitures', 'object.bus': 'Bus', 'object.person': 'Piétons',
  'export.failed': "Échec de l’exportation. Veuillez réessayer.", 'export.csvFailed': "Échec de l’exportation CSV. Veuillez réessayer.",
  'map.loading': 'Chargement de la carte…', 'map.monitoredZone': 'Zone surveillée', 'map.subzone': 'Sous-zone', 'map.coordinates': 'Coordonnées', 'map.industrialZone': 'Zone industrielle',
  'map.legend': 'Légende', 'map.fatal': 'Accident mortel', 'map.serious': 'Blessure grave', 'map.minor': 'Accident mineur', 'map.signal': 'Feu / Passage piéton',
  'map.year': 'Année', 'map.deaths': 'Décès', 'map.source': 'Source', 'map.cameraTitle': '📹 Caméra de trafic en direct', 'map.openAnalytics': 'Ouvrir les analyses',
  'parking.title': '🅿️ Surveillance du parking', 'parking.view': 'Voir le parking en direct', 'parking.alt': 'Flux en direct du parking', 'parking.total': 'Places totales',
  'parking.available': 'Disponibles', 'parking.occupied': 'Occupées', 'parking.description': 'Le parking est occupé à {percent} %', 'parking.green': 'Les cases vertes',
  'parking.greenDetail': ' indiquent les places disponibles • ', 'parking.red': 'Les cases rouges', 'parking.redDetail': ' indiquent les places occupées', 'parking.loading': 'Chargement des statistiques du parking…',
  'stats.loading': 'Chargement des statistiques…', 'stats.title': 'Statistiques historiques', 'stats.totalCrashes': 'Total des accidents enregistrés', 'stats.totalDeaths': 'Total des décès',
  'stats.crashesByYear': 'Accidents par année', 'stats.deaths': 'Décès', 'stats.deathTrend': 'Tendance des décès', 'stats.severityDistribution': 'Répartition par sévérité',
  'graph.road2d': 'Réseau routier 2D', 'graph.alert': 'alerte', 'graph.alerts': 'alertes', 'graph.active': 'active(s)', 'graph.segments': 'segments routiers', 'graph.roads': 'routes', 'graph.connections': 'connexions',
  'graph.resetView': 'Réinitialiser la vue', 'graph.accidentAlert': 'Alerte accident', 'graph.normalRoad': 'Route normale', 'graph.activeAlert': 'ALERTE ACTIVE', 'graph.normal': 'NORMAL',
  'graph.disableAlert': 'Désactiver l’alerte', 'graph.simulateAlert': 'Simuler une alerte', 'graph.segmentId': 'ID du segment', 'graph.roadId': 'ID de la route', 'graph.roadType': 'Type de route', 'graph.type': 'Type', 'graph.state': 'État',
  'graph.accidentDetected': 'ALERTE — Accident détecté', 'graph.normalTraffic': 'Normal — Trafic fluide', 'graph.neural3d': 'Réseau neuronal 3D — Vue d’ensemble de la ville',
  'graph.stopSimulation': 'Arrêter la simulation', 'graph.startSimulation': 'Démarrer la simulation', 'graph.reset': 'Réinitialiser', 'graph.accidentActive': 'Accident / Alerte active',
  'graph.alertConnection': 'Connexion avec alerte', 'graph.normalConnection': 'Connexion normale', 'graph.trafficNormal': 'TRAFIC NORMAL', 'graph.detected': 'ACCIDENT DÉTECTÉ',
  'graph.neuralVisualization': 'Visualisation neuronale 3D', 'graph.description': 'Cette vue représente le réseau routier de Gaborone comme un système neuronal 3D. Chaque neurone (sphère lumineuse) correspond à un segment de route ou à une intersection. Les connexions vertes indiquent un trafic normal, tandis que les connexions rouges et les neurones pulsants signalent des accidents ou des alertes actives. Les particules animées simulent le flux du trafic à travers le réseau.',
  'road.main_road': 'ROUTE PRINCIPALE', 'road.secondary_road': 'ROUTE SECONDAIRE', 'road.residential': 'RÉSIDENTIELLE', 'road.highway': 'AUTOROUTE', 'road.industrial': 'INDUSTRIELLE', 'road.commercial': 'COMMERCIALE',
  'settings.title': 'Paramètres', 'settings.soon': 'Les paramètres de configuration seront bientôt disponibles.', 'settings.description': "Cette page permettra de configurer les zones de surveillance, les seuils d’alerte et les préférences utilisateur.",
  'common.close': 'Fermer',
  'incident.title.1': 'Collision véhicule-piéton', 'incident.title.2': 'Excès de vitesse détecté', 'incident.title.3': 'Accident avec blessés', 'incident.title.4': 'Piéton traversant hors passage', 'incident.title.5': 'Accident mortel', 'incident.title.6': 'Stationnement illégal bloquant la circulation',
  'detail.Type': 'Type', 'detail.Météo': 'Météo', 'detail.Véhicules impliqués': 'Véhicules impliqués', 'detail.Piétons impliqués': 'Piétons impliqués', 'detail.Vitesse détectée': 'Vitesse détectée', 'detail.Limite': 'Limite', 'detail.Blessés': 'Blessés', 'detail.Décès': 'Décès', 'detail.Blessés graves': 'Blessés graves',
  'value.Collision': 'Collision', 'value.Ensoleillé': 'Ensoleillé', 'value.Infraction': 'Infraction', 'value.Collision multiple': 'Collision multiple', 'value.Pluie légère': 'Pluie légère', 'value.Infraction piéton': 'Infraction piétonne', 'value.Collision frontale': 'Collision frontale', 'value.Brouillard': 'Brouillard', 'value.Infraction stationnement': 'Infraction de stationnement',
  'service.Ambulance': 'Ambulance', 'service.Police': 'Police', 'service.Pompiers': 'Pompiers', 'service.Services médicaux d’urgence': 'Services médicaux d’urgence',
};
translations.fr = { ...translations.en, ...frenchFallbacks, ...translations.fr };

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => localStorage.getItem('roadwatch-language') || 'en');
  useEffect(() => {
    localStorage.setItem('roadwatch-language', language);
    document.documentElement.lang = language;
    document.title = translations[language]?.['app.title'] ?? translations.en['app.title'];
  }, [language]);

  const value = useMemo(() => ({
    language,
    locale: language === 'fr' ? 'fr-FR' : 'en-GB',
    setLanguage,
    t: (key, variables = {}) => {
      const fallback = key.startsWith('value.') ? key.slice('value.'.length) : key;
      const text = translations[language]?.[key] ?? translations.en[key] ?? fallback;
      return Object.entries(variables).reduce((result, [name, value]) => result.replaceAll(`{${name}}`, value), text);
    },
  }), [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useTranslation must be used inside LanguageProvider');
  return context;
}
