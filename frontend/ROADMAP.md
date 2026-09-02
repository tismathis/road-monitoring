# 🗺️ ROADMAP COMPLÈTE - Digital Twin Sécurité Routière Gaborone

## 📋 Table des Matières

1. [Vue d'Ensemble](#vue-densemble)
2. [Architecture Globale](#architecture-globale)
3. [Flow de Données](#flow-de-données)
4. [Structure des Fichiers Détaillée](#structure-des-fichiers-détaillée)
5. [Design System](#design-system)
6. [Composants Réutilisables](#composants-réutilisables)
7. [Pages de l'Application](#pages-de-lapplication)
8. [Hooks et Logique Métier](#hooks-et-logique-métier)
9. [Backend Integration](#backend-integration)
10. [Carte Interactive](#carte-interactive)
11. [Caméra Live & Détection](#caméra-live--détection)
12. [Comment Tout S'Emboîte](#comment-tout-semboîte)
13. [Guide de Maintenance](#guide-de-maintenance)

---

## 🎯 Vue d'Ensemble

### Qu'est-ce que c'est?

Une application web moderne de monitoring de sécurité routière en temps réel pour Gaborone, Botswana. Elle combine:
- 📹 **Streaming vidéo live** avec détection d'objets (YOLO)
- 🗺️ **Carte interactive** avec GeoJSON (routes, accidents, caméras)
- 📊 **Dashboards analytiques** en temps réel
- 🚨 **Gestion d'incidents** avec alertes

### Stack Technologique

**Frontend:**
- ⚛️ React 19 + Vite 8
- 🗺️ Leaflet + react-leaflet (cartes)
- 📊 Recharts (graphiques)
- 🎨 Design system custom (tokens)
- 🧭 React Router (navigation)
- 🎨 Lucide React (icônes)

**Backend:**
- 🐍 FastAPI (Python)
- 🎥 OpenCV + YOLO (détection d'objets)
- 📹 YouTube stream via yt-dlp
- 📊 GeoJSON (données géographiques)

---

## 🏗️ Architecture Globale

```
┌─────────────────────────────────────────────────────────────┐
│                     NAVIGATEUR (Frontend)                    │
│                                                               │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │  Sidebar   │  │   TopBar   │  │   Pages    │            │
│  │ Navigation │  │  Zone Info │  │  Content   │            │
│  └────────────┘  └────────────┘  └────────────┘            │
│                                                               │
│  Pages:                                                       │
│  • Dashboard    - Vue d'ensemble avec métriques              │
│  • Carte        - Leaflet map + GeoJSON                      │
│  • Incidents    - Liste événements filtrables                │
│  • Caméra Live  - Stream MJPEG + détection                   │
│  • Statistiques - Charts historiques                         │
│  • Paramètres   - Configuration                              │
│                                                               │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ HTTP/MJPEG
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                   BACKEND (FastAPI)                          │
│                                                               │
│  Endpoints:                                                   │
│  • /camera/stream         - MJPEG video stream               │
│  • /camera/stats          - Compteurs objets (polling 3s)    │
│  • /camera/history        - Historique trafic                │
│  • /camera/heatmap-points - Points détection (polling 1s)    │
│  • /roads                 - GeoJSON réseau routier           │
│  • /points                - GeoJSON signalisation            │
│  • /historical_crashes    - GeoJSON accidents historiques    │
│  • /stats/*               - Statistiques crashes             │
│                                                               │
│  Traitement:                                                  │
│  • YouTube Stream → OpenCV → YOLO → Détection objets         │
│  • Tracking avec IDs uniques                                 │
│  • Génération heatmap (positions normalisées 0-1)            │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Flow de Données

### 1️⃣ Démarrage de l'Application

```
main.jsx
  └─> App.jsx (React Router)
      └─> AppLayout (Sidebar + TopBar + Content)
          └─> Routes vers Pages
```

### 2️⃣ Navigation Utilisateur

```
User clicks "Dashboard" dans Sidebar
  └─> React Router change URL → /dashboard
      └─> Route render <Dashboard />
          └─> Dashboard utilise hooks:
              ├─> useCameraStats() → polling toutes les 3s
              ├─> Mock data pour incidents
              └─> Render KeyMetricCards + StatCards
```

### 3️⃣ Flow Caméra Live (Complexe!)

```
LiveCameraPage monte
  │
  ├─> useCameraStats(3000)
  │   └─> useEffect polling toutes les 3s
  │       └─> fetch('/camera/stats')
  │           └─> Backend retourne {person: 6, car: 12, bus: 2, ...}
  │               └─> State mis à jour → Re-render
  │
  ├─> useCameraHistory(3000)
  │   └─> Même pattern, données historiques
  │
  ├─> useHeatmapPoints(heatmapOn, 1000)
  │   └─> Si heatmapOn=true, polling toutes les 1s
  │       └─> fetch('/camera/heatmap-points')
  │           └─> Retourne [{x, y, w, h}, ...]
  │
  └─> useEffect (Canvas heatmap)
      └─> Si heatmapPoints changent ET heatmapOn=true:
          ├─> Récupère canvas + image
          ├─> Dessine gradients radiaux pour chaque point
          └─> Overlay sur image MJPEG
```

### 4️⃣ Flow Carte Interactive

```
LiveMapPage monte
  │
  ├─> useRoadData()
  │   └─> Promise.all([fetch /roads, fetch /points])
  │       └─> State {roads, points}
  │
  ├─> useCrashData()
  │   └─> fetch /historical_crashes
  │       └─> State {crashes}
  │
  └─> MapView render
      ├─> Leaflet MapContainer
      ├─> TileLayer (CartoDB Positron)
      ├─> GeoJSON roads (vert)
      ├─> GeoJSON points (vert)
      ├─> GeoJSON crashes (rouge/orange/jaune selon severity)
      ├─> CameraMarker (icône custom animé)
      └─> MapLegend (overlay)
```

### 5️⃣ Flow Backend → Frontend

```
BACKEND (Thread de traitement continu)
  │
  ├─> YouTube stream → OpenCV capture
  ├─> YOLO détection → Annotations
  ├─> Tracking IDs → Comptage unique
  ├─> Positions normalisées → Heatmap queue
  ├─> Snapshot toutes les 10s → History queue
  └─> Frame JPEG → latest_frame (global)

FRONTEND (Polling régulier)
  │
  ├─> Toutes les 3s: GET /camera/stats
  │   └─> Backend lit counts (dict global thread-safe)
  │
  ├─> Toutes les 3s: GET /camera/history
  │   └─> Backend lit history (deque 60 snapshots)
  │
  ├─> Toutes les 1s (si heatmap ON): GET /camera/heatmap-points
  │   └─> Backend lit heatmap_points (deque 80 points)
  │
  └─> Stream continu: GET /camera/stream
      └─> Backend yield frames MJPEG
          └─> Frontend <img src="..."> affiche
```

---

## 📁 Structure des Fichiers Détaillée

```
frontend/
│
├── public/                      # Fichiers statiques
│
├── src/
│   │
│   ├── main.jsx                 # ⚡ POINT D'ENTRÉE
│   │   └─> Importe App.jsx et rend dans #root
│   │
│   ├── App.jsx                  # 🧭 ROUTEUR PRINCIPAL
│   │   └─> BrowserRouter + Routes vers toutes les pages
│   │   └─> Wrapped dans AppLayout
│   │
│   ├── index.css                # 🎨 STYLES GLOBAUX + CSS VARIABLES
│   │   └─> Import police Inter
│   │   └─> Variables CSS (--color-*, --spacing-*, etc.)
│   │   └─> Reset CSS
│   │
│   ├── styles/
│   │   └── tokens.js            # 🎨 DESIGN SYSTEM (export JS)
│   │       └─> colors, spacing, shadows, typography, layout
│   │
│   ├── layouts/                 # 🏗️ STRUCTURE DE L'APP
│   │   ├── AppLayout.jsx        # Layout principal (flex container)
│   │   ├── Sidebar.jsx          # Navigation gauche (6 items)
│   │   └── TopBar.jsx           # Barre supérieure (zone + status + profil)
│   │
│   ├── components/              # 🧩 COMPOSANTS RÉUTILISABLES
│   │   │
│   │   ├── ui/                  # Composants de base
│   │   │   ├── Card.jsx         # Card blanche avec shadow
│   │   │   ├── Badge.jsx        # Badges colorés (severity/status)
│   │   │   ├── Button.jsx       # Boutons (4 variants)
│   │   │   └── Modal.jsx        # Modal overlay
│   │   │
│   │   ├── stats/               # Composants statistiques
│   │   │   ├── StatCard.jsx     # Grand chiffre + sparkline + trend
│   │   │   ├── KeyMetricCard.jsx    # Compact icône + valeur
│   │   │   ├── IncidentCard.jsx     # Card incident détaillée
│   │   │   └── MapControlCard.jsx   # Contrôle zone carte
│   │   │
│   │   ├── charts/              # Wrappers Recharts
│   │   │   ├── BarChartCard.jsx
│   │   │   ├── LineChartCard.jsx
│   │   │   └── PieChartCard.jsx
│   │   │
│   │   └── map/                 # Composants carte
│   │       ├── MapView.jsx      # Container Leaflet principal
│   │       ├── MapLegend.jsx    # Légende overlay
│   │       └── CameraMarker.jsx # Marqueur caméra custom
│   │
│   ├── pages/                   # 📄 PAGES DE L'APPLICATION
│   │   ├── Dashboard.jsx        # 🏠 Page d'accueil (route: /)
│   │   ├── LiveMapPage.jsx      # 🗺️ Carte interactive (/map)
│   │   ├── IncidentsPage.jsx    # 🚨 Liste incidents (/incidents)
│   │   ├── LiveCameraPage.jsx   # 📹 Caméra + analytics (/camera)
│   │   ├── StatisticsPage.jsx   # 📊 Stats historiques (/stats)
│   │   └── SettingsPage.jsx     # ⚙️ Paramètres (/settings)
│   │
│   ├── hooks/                   # 🪝 CUSTOM HOOKS (data fetching)
│   │   ├── useRoadData.js       # Fetch roads + points GeoJSON
│   │   ├── useCrashData.js      # Fetch historical crashes
│   │   ├── useCameraStats.js    # Polling stats (3s)
│   │   ├── useCameraHistory.js  # Polling history (3s)
│   │   ├── useHeatmapPoints.js  # Polling heatmap (1s)
│   │   └── useStatsData.js      # Fetch stats/crashes-by-*
│   │
│   └── utils/                   # 🛠️ UTILITAIRES
│       ├── api.js               # Configuration endpoints
│       ├── mockData.js          # Données mockées (incidents, sparklines)
│       └── mapStyles.js         # Styles de carte Leaflet (8 options)
│
├── package.json                 # Dépendances npm
├── vite.config.js               # Config Vite
└── ROADMAP.md                   # 📖 CE FICHIER!
```

---

## 🎨 Design System

### Tokens (styles/tokens.js)

**Organisation:**
```javascript
export const tokens = {
  colors: {
    primary: {...},      // Vert #22c55e (5 nuances)
    neutral: {...},      // Gris (7 nuances)
    severity: {...},     // Rouge/Orange/Jaune
    status: {...},       // Couleurs de statut
    chart: {...},        // Palette graphiques
  },
  spacing: {...},        // xs(4px) → 4xl(64px)
  borderRadius: {...},   // sm(6px) → xl(16px)
  shadows: {...},        // sm → xl
  typography: {
    fontFamily: {...},
    fontSize: {...},     // xs(12px) → 4xl(36px)
    fontWeight: {...},
    lineHeight: {...},
  },
  layout: {
    sidebarWidth: '240px',
    topBarHeight: '64px',
  },
}
```

**Usage dans composants:**
```javascript
import { tokens } from '../styles/tokens';

const styles = {
  backgroundColor: tokens.colors.primary[500],
  padding: tokens.spacing.lg,
  borderRadius: tokens.borderRadius.md,
  boxShadow: tokens.shadows.md,
};
```

### CSS Variables (index.css)

Les tokens sont aussi disponibles en CSS:
```css
.my-element {
  background: var(--color-primary-500);
  padding: var(--spacing-lg);
  border-radius: var(--radius-md);
}
```

---

## 🧩 Composants Réutilisables

### 1. Card (Base de tout)

```javascript
<Card padding="lg" shadow="md">
  <h3>Titre</h3>
  <p>Contenu</p>
</Card>
```

**Props:**
- `children` - Contenu
- `padding` - xs|sm|md|lg|xl|2xl
- `shadow` - sm|md|lg|xl
- `variant` - default|bordered|flat

**Utilisé par:** TOUS les composants qui affichent du contenu

### 2. Badge (Statuts & Sévérité)

```javascript
<Badge variant="fatal">FATAL</Badge>
<Badge variant="online" size="sm">En ligne</Badge>
```

**Props:**
- `variant` - fatal|serious|minor|online|dispatched|etc.
- `size` - sm|md|lg

**Utilisé par:** IncidentCard, TopBar, IncidentsPage

### 3. StatCard (Métriques Principales)

```javascript
<StatCard
  value={1247}
  label="Véhicules détectés"
  icon={Car}
  trend={{ direction: 'up', percentage: 12.5 }}
  sparklineData={[120, 135, 145, 138, 152]}
/>
```

**Props:**
- `value` - Nombre à afficher
- `label` - Description
- `icon` - Composant lucide-react
- `trend` - {direction: 'up'|'down'|'neutral', percentage: number}
- `sparklineData` - Array de valeurs pour mini-chart SVG
- `suffix` - Optionnel (ex: 'km/h')

**Utilisé par:** Dashboard, LiveCameraPage

### 4. IncidentCard (Événements Détaillés)

```javascript
<IncidentCard incident={{
  title: "Collision véhicule-piéton",
  severity: "serious",
  urgency: 80,
  timestamp: "14:32",
  location: "Main Mall",
  details: { Type: "Collision", Météo: "Pluie" },
  notifiedServices: [
    { name: 'Ambulance', status: 'dispatched' }
  ]
}} />
```

**Props:**
- `incident` - Objet avec toutes les infos

**Utilisé par:** Dashboard, IncidentsPage

### 5. MapView (Carte Leaflet)

```javascript
<MapView
  center={[-24.6539, 25.9010]}
  zoom={15}
  roads={roadsGeoJSON}
  points={pointsGeoJSON}
  crashes={crashesGeoJSON}
  cameraPosition={[-24.6539, 25.9010]}
  showLegend={true}
/>
```

**Props:**
- `center` - [lat, lng]
- `zoom` - Niveau de zoom
- `roads`, `points`, `crashes` - GeoJSON data
- `cameraPosition` - Position marqueur caméra
- `showLegend` - Afficher légende

**Utilisé par:** LiveMapPage

---

## 📄 Pages de l'Application

### 1. Dashboard (/) - Page d'Accueil

**Fichier:** `pages/Dashboard.jsx`

**Sections:**
1. **Key Metrics** (3 cards)
   - Caméras connectées (vraies données)
   - Alertes 24h (mockées)
   - Zones surveillées (mockées)

2. **Stat Cards** (4 cards)
   - Véhicules détectés (vraies données via useCameraStats)
   - Vitesse moyenne (mockée)
   - Piétons détectés (vraies données)
   - Incidents actifs (mockés)

3. **Recent Incidents** (liste)
   - 4 premiers incidents mockés avec IncidentCard

**Données:**
- Vraies: `useCameraStats()` → compteurs objets
- Mockées: `mockIncidents`, `mockSparklineData`, `mockKeyMetrics`

**Pourquoi des données mockées?**
Pour démontrer le design sans attendre API. Facile à remplacer plus tard.

---

### 2. LiveMapPage (/map) - Carte Interactive

**Fichier:** `pages/LiveMapPage.jsx`

**Flow:**
```
Mount
  └─> useRoadData() + useCrashData()
      └─> Loading...
          └─> Data arrives
              └─> <MapView> renders
                  ├─> Leaflet map
                  ├─> CartoDB Positron tiles
                  ├─> GeoJSON layers (roads, points, crashes)
                  ├─> CameraMarker (cliquable → /camera)
                  └─> MapLegend overlay
```

**Interactions:**
- Zoom/Pan sur la carte
- Clic sur crash marker → Popup avec infos
- Clic sur caméra → Navigate vers /camera

**Composants utilisés:**
- `MapView` (principal)
- `MapControlCard` (overlay zone info)

---

### 3. IncidentsPage (/incidents) - Liste d'Incidents

**Fichier:** `pages/IncidentsPage.jsx`

**Features:**
- Filtre par sévérité (Tous, Fatal, Grave, Mineur)
- Affichage du count par filtre
- Grid responsive de IncidentCard
- État vide si aucun résultat

**State:**
```javascript
const [severityFilter, setSeverityFilter] = useState('all');
const filteredIncidents = severityFilter === 'all'
  ? mockIncidents
  : mockIncidents.filter(i => i.severity === severityFilter);
```

**Données:** `mockIncidents` (6 incidents détaillés)

---

### 4. LiveCameraPage (/camera) - Caméra + Analytics

**Fichier:** `pages/LiveCameraPage.jsx`

**LA PAGE LA PLUS COMPLEXE!**

**Layout:**
```
┌────────────────────────────────────────┐
│ Titre + Debug Banner                   │
├─────────────────┬──────────────────────┤
│ Video + Heatmap │ Stats Cards          │
│ (1.2fr)         │ (1fr)                │
│                 │                      │
│ [Img MJPEG]     │ [Total Objets]       │
│ [Canvas overlay]│ [Cars] [Bus] [Person]│
│ [Toggle Button] │                      │
│                 │                      │
├─────────────────┴──────────────────────┤
│ Charts Row (2 colonnes)                │
│ [Bar Chart] [Line Chart]               │
└────────────────────────────────────────┘
```

**3 Hooks de Polling:**
```javascript
const stats = useCameraStats(3000);      // Toutes les 3s
const history = useCameraHistory(3000);  // Toutes les 3s
const heatmapPoints = useHeatmapPoints(heatmapOn, 1000); // 1s si ON
```

**Canvas Heatmap (LOGIQUE CRITIQUE!):**
```javascript
useEffect(() => {
  if (!heatmapOn || !canvasRef.current || !imgRef.current) return;

  const canvas = canvasRef.current;
  const img = imgRef.current;

  // 1. Dimensionner canvas selon image
  canvas.width = img.clientWidth;
  canvas.height = img.clientHeight;

  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.globalCompositeOperation = 'lighter';

  // 2. Pour chaque point détecté
  heatmapPoints.forEach(p => {
    // Dénormaliser coordonnées (p.x, p.y sont 0-1)
    const x = p.x * canvas.width;
    const y = p.y * canvas.height;
    const rx = Math.max(p.w * canvas.width, 20) / 2.5;
    const ry = Math.max(p.h * canvas.height, 20) / 2.5;

    // 3. Créer gradient radial
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, 'rgba(255, 0, 0, 0.22)');    // Rouge centre
    gradient.addColorStop(0.3, 'rgba(255, 165, 0, 0.16)'); // Orange
    gradient.addColorStop(0.55, 'rgba(255, 255, 0, 0.10)'); // Jaune
    gradient.addColorStop(0.75, 'rgba(0, 255, 100, 0.06)'); // Vert
    gradient.addColorStop(1, 'rgba(0, 100, 255, 0)');      // Bleu transparent

    // 4. Dessiner ellipse
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.globalCompositeOperation = 'source-over';
}, [heatmapPoints, heatmapOn]);
```

**Stream MJPEG:**
```javascript
<img
  ref={imgRef}
  src={endpoints.cameraStream}  // http://127.0.0.1:8000/camera/stream
  style={imgStyles}
  onLoad={() => setImageError(false)}
  onError={() => setImageError(true)}
/>
```

---

### 5. StatisticsPage (/stats) - Stats Historiques

**Fichier:** `pages/StatisticsPage.jsx`

**Sections:**
1. **Summary Cards**
   - Total crashes (calculé)
   - Total décès (calculé)

2. **Charts**
   - Bar: Crashes par année
   - Line: Tendance décès
   - Pie: Distribution sévérité

**Hook:**
```javascript
const { byYear, bySeverity, totalCrashes, totalFatalities, loading } = useStatsData();
```

**Endpoints Backend:**
- `/stats/crashes-by-year` → [{year, total, fatalities}, ...]
- `/stats/crashes-by-severity` → [{severity, total}, ...]

---

### 6. SettingsPage (/settings) - Paramètres

**Fichier:** `pages/SettingsPage.jsx`

Simple placeholder pour l'instant. Card avec texte "À venir".

---

## 🪝 Hooks et Logique Métier

### Pourquoi des Hooks?

**Avant (dans composants):**
```javascript
function CameraPanel() {
  const [stats, setStats] = useState({});

  useEffect(() => {
    const fetchStats = () => {
      fetch('http://127.0.0.1:8000/camera/stats')
        .then(res => res.json())
        .then(setStats);
    };
    fetchStats();
    const interval = setInterval(fetchStats, 3000);
    return () => clearInterval(interval);
  }, []);

  // ... rest of component
}
```

**Problèmes:**
- Logique mélangée avec UI
- Duplication si plusieurs composants utilisent
- Difficile à tester

**Après (avec hooks):**
```javascript
function LiveCameraPage() {
  const stats = useCameraStats(3000);
  // ... rest of component (juste UI!)
}
```

**Avantages:**
- Séparation logique/UI
- Réutilisable
- Testable isolément
- Facile à maintenir

### Hook Pattern (Tous suivent ce modèle)

```javascript
export function useMyData(pollInterval = 3000) {
  const [data, setData] = useState(initialValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = () => {
      fetch(endpoint)
        .then(res => res.json())
        .then(data => {
          setData(data);
          setLoading(false);
        })
        .catch(err => {
          setError(err);
          setLoading(false);
        });
    };

    fetchData(); // Initial fetch

    const interval = setInterval(fetchData, pollInterval);

    return () => clearInterval(interval); // Cleanup
  }, [pollInterval]);

  return { data, loading, error };
}
```

### Liste des Hooks

| Hook | Endpoint | Polling | Utilisé par |
|------|----------|---------|-------------|
| `useRoadData` | /roads, /points | Non | LiveMapPage |
| `useCrashData` | /historical_crashes | Non | LiveMapPage |
| `useCameraStats` | /camera/stats | 3s | Dashboard, LiveCameraPage |
| `useCameraHistory` | /camera/history | 3s | LiveCameraPage |
| `useHeatmapPoints` | /camera/heatmap-points | 1s (si enabled) | LiveCameraPage |
| `useStatsData` | /stats/* | Non | StatisticsPage |

---

## 🔌 Backend Integration

### Endpoints API

**Base URL:** `http://127.0.0.1:8000`

#### 1. Camera Endpoints

**GET /camera/stream**
- Type: MJPEG stream (multipart/x-mixed-replace)
- Usage: `<img src="...">`
- Retourne: Frames JPEG continues
- Thread backend: `camera_worker()` génère frames

**GET /camera/stats**
- Type: JSON
- Polling: 3s
- Retourne:
```json
{
  "person": 6,
  "bicycle": 0,
  "car": 12,
  "motorcycle": 0,
  "bus": 2,
  "truck": 1
}
```

**GET /camera/history**
- Type: JSON
- Polling: 3s
- Retourne:
```json
[
  {"time": "10:30:10", "car": 5, "bus": 1, "person": 3},
  {"time": "10:30:20", "car": 7, "bus": 1, "person": 2},
  ...
]
```

**GET /camera/heatmap-points**
- Type: JSON
- Polling: 1s (seulement si heatmap activée)
- Retourne:
```json
[
  {"x": 0.45, "y": 0.32, "w": 0.08, "h": 0.12},
  {"x": 0.62, "y": 0.48, "w": 0.06, "h": 0.10},
  ...
]
```
- x, y, w, h: Normalisés entre 0 et 1 (% de largeur/hauteur image)

#### 2. Map Endpoints

**GET /roads**
- Type: GeoJSON
- Retourne: FeatureCollection de LineStrings (réseau routier)

**GET /points**
- Type: GeoJSON
- Retourne: FeatureCollection de Points (signalisation)

**GET /historical_crashes**
- Type: GeoJSON
- Retourne: FeatureCollection de Points avec properties:
```json
{
  "type": "Feature",
  "geometry": {"type": "Point", "coordinates": [lng, lat]},
  "properties": {
    "severity": "fatal" | "serious_injury" | "minor",
    "year": 2023,
    "fatalities": 2,
    "source": "Police Report"
  }
}
```

#### 3. Stats Endpoints

**GET /stats/crashes-by-year**
```json
[
  {"year": 2019, "total": 45, "fatalities": 12},
  {"year": 2020, "total": 38, "fatalities": 8},
  ...
]
```

**GET /stats/crashes-by-severity**
```json
[
  {"severity": "fatal", "total": 23},
  {"severity": "serious_injury", "total": 67},
  {"severity": "minor", "total": 145}
]
```

---

## 🗺️ Carte Interactive

### Leaflet Layers (ordre de rendu)

```
MapContainer
  └─> TileLayer (fond de carte CartoDB Positron)
      └─> GeoJSON roads (lignes vertes, weight: 4)
          └─> GeoJSON points (cercles verts, signals)
              └─> GeoJSON crashes (cercles colorés par severity)
                  └─> CameraMarker (icône custom + animation)
```

### Styles de Carte Disponibles

**Fichier:** `utils/mapStyles.js`

8 styles prédéfinis:
1. **POSITRON** ⭐ - Clair épuré (actuel)
2. **VOYAGER** - Couleurs douces
3. **ALIDADE_SMOOTH** - Élégant moderne
4. **ALIDADE_SMOOTH_DARK** - Mode sombre 🌙
5. **OSM_STANDARD** - Classic OpenStreetMap
6. **DARK_MATTER** - Mode sombre complet 🌑
7. **STAMEN_TERRAIN** - Relief/topographie
8. **STAMEN_TONER_LITE** - Noir & blanc minimaliste

**Pour changer:**
```javascript
// Dans utils/mapStyles.js, ligne finale:
export const DEFAULT_MAP_STYLE = MAP_STYLES.VOYAGER; // Change ici!
```

### Animations & Effets CSS

**Marqueurs d'accidents:**
```css
@keyframes pulse-marker {
  0%, 100% { transform: scale(1); opacity: 0.85; }
  50% { transform: scale(1.1); opacity: 1; }
}
.crash-marker {
  animation: pulse-marker 2s ease-in-out infinite;
  filter: drop-shadow(0 0 8px rgba(239, 68, 68, 0.5));
}
```

**Icône caméra:**
```css
@keyframes camera-pulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 4px 12px rgba(34, 197, 94, 0.4);
  }
  50% {
    transform: scale(1.1);
    box-shadow: 0 6px 20px rgba(34, 197, 94, 0.6);
  }
}
```

### Customisation Popup

```javascript
onEachFeature={(feature, layer) => {
  const p = feature.properties;
  layer.bindPopup(`
    <b>${p.severity}</b><br/>
    Année: ${p.year}<br/>
    Décès: ${p.fatalities}<br/>
    Source: ${p.source}
  `);
}}
```

---

## 📹 Caméra Live & Détection

### Backend Processing Pipeline

```
YouTube URL
  └─> yt-dlp résout URL directe
      └─> OpenCV VideoCapture
          └─> Read frame
              └─> YOLO model.track()
                  ├─> Détection objets (classes: person, car, bus, etc.)
                  ├─> Tracking IDs uniques
                  ├─> Annotations sur frame
                  └─> Outputs:
                      ├─> Annotated frame → latest_frame
                      ├─> Tracking IDs → counts (si nouveau ID)
                      ├─> Bounding boxes → heatmap_points
                      └─> Snapshot toutes les 10s → history
```

### Thread Safety (Backend)

**Locks utilisés:**
```python
frame_lock = threading.Lock()      # Protège latest_frame
counts_lock = threading.Lock()     # Protège counts dict
history_lock = threading.Lock()    # Protège history deque
heatmap_lock = threading.Lock()    # Protège heatmap_points
```

**Pattern:**
```python
with counts_lock:
    snapshot = dict(counts)  # Copy atomique
```

### Comptage Unique (Tracking)

```python
seen_track_ids = set()  # IDs déjà vus

for track_id, cls_id in zip(ids, clss):
    tid = int(track_id)
    if tid not in seen_track_ids:  # Première fois qu'on voit cet ID
        seen_track_ids.add(tid)
        name = CLASS_MAP.get(int(cls_id))
        counts[name] += 1  # Compte une seule fois!
```

**Pourquoi?** Un objet peut apparaître dans 100+ frames. On veut compter chaque objet unique une seule fois.

### Heatmap Points (Normalisés)

```python
h, w = frame.shape[:2]  # Hauteur, largeur frame
xyxy = results[0].boxes.xyxy  # Bounding boxes [x1, y1, x2, y2]

for box in xyxy:
    cx = (box[0] + box[2]) / 2 / w  # Centre X normalisé (0-1)
    cy = (box[1] + box[3]) / 2 / h  # Centre Y normalisé (0-1)
    bw = (box[2] - box[0]) / w      # Largeur normalisée
    bh = (box[3] - box[1]) / h      # Hauteur normalisée

    heatmap_points.append({
        "x": float(cx),
        "y": float(cy),
        "w": float(bw),
        "h": float(bh)
    })
```

**Pourquoi normaliser?**
- Frontend ne connaît pas taille frame backend
- Frontend peut afficher image à n'importe quelle taille
- Conversion frontend: `x_pixels = x_normalized * canvas.width`

---

## 🔗 Comment Tout S'Emboîte

### Exemple Complet: User Clique "Caméra Live"

**1. Sidebar (Navigation)**
```javascript
// layouts/Sidebar.jsx
<NavLink to="/camera">
  <Video /> Caméra live
</NavLink>
```

**2. Router (Changement URL)**
```javascript
// App.jsx
<Route path="/camera" element={<LiveCameraPage />} />
```

**3. Page Monte (Hooks démarrent)**
```javascript
// pages/LiveCameraPage.jsx
const stats = useCameraStats(3000);
const history = useCameraHistory(3000);
const heatmapPoints = useHeatmapPoints(heatmapOn, 1000);
```

**4. Hooks Polent Backend**
```javascript
// hooks/useCameraStats.js
useEffect(() => {
  const fetchStats = () => {
    fetch('http://127.0.0.1:8000/camera/stats')
      .then(res => res.json())
      .then(setStats);
  };
  fetchStats();
  const interval = setInterval(fetchStats, 3000);
  return () => clearInterval(interval);
}, []);
```

**5. Backend Retourne Données**
```python
# backend/main.py
@app.get("/camera/stats")
async def camera_stats():
    return get_counts()  # Thread-safe read
```

**6. State Updated → Re-render**
```javascript
// LiveCameraPage.jsx re-renders
{Object.entries(stats).map(([cls, count]) => (
  <StatCard key={cls} value={count} label={cls} />
))}
```

**7. Stream MJPEG (Parallèle)**
```javascript
<img src="http://127.0.0.1:8000/camera/stream" />
```

**8. Backend Yield Frames**
```python
async def video_stream():
    while True:
        frame = get_latest_frame()
        if frame:
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')
```

**9. Canvas Heatmap (Si activé)**
```javascript
useEffect(() => {
  // Dessine gradients sur canvas overlay
  heatmapPoints.forEach(p => {
    const x = p.x * canvas.width;
    const y = p.y * canvas.height;
    // ... dessine gradient radial
  });
}, [heatmapPoints, heatmapOn]);
```

**Résultat:** Vidéo live + compteurs temps réel + heatmap optionnel!

---

## 🛠️ Guide de Maintenance

### Ajouter une Nouvelle Page

**1. Créer le fichier**
```javascript
// pages/MyNewPage.jsx
export function MyNewPage() {
  return (
    <div>
      <h1>Ma Nouvelle Page</h1>
      {/* ... */}
    </div>
  );
}
```

**2. Ajouter la route**
```javascript
// App.jsx
import { MyNewPage } from './pages/MyNewPage';

<Route path="/mynewpage" element={<MyNewPage />} />
```

**3. Ajouter au menu**
```javascript
// layouts/Sidebar.jsx
import { MyIcon } from 'lucide-react';

const menuItems = [
  // ... existing items
  { id: 'mynewpage', icon: MyIcon, label: 'Ma Page', route: '/mynewpage' },
];
```

### Ajouter un Nouveau Composant Stat

**1. Créer le composant**
```javascript
// components/stats/MyStatComponent.jsx
export function MyStatComponent({ data }) {
  return (
    <Card>
      {/* Utilise tokens pour styling */}
      <div style={{
        padding: tokens.spacing.lg,
        color: tokens.colors.neutral[900]
      }}>
        {data}
      </div>
    </Card>
  );
}
```

**2. Utiliser dans une page**
```javascript
import { MyStatComponent } from '../components/stats/MyStatComponent';

<MyStatComponent data={myData} />
```

### Connecter un Nouveau Endpoint Backend

**1. Ajouter à api.js**
```javascript
// utils/api.js
export const endpoints = {
  // ... existing
  myNewEndpoint: `${API_URL}/my-new-endpoint`,
};
```

**2. Créer un hook**
```javascript
// hooks/useMyNewData.js
export function useMyNewData() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(endpoints.myNewEndpoint)
      .then(res => res.json())
      .then(setData);
  }, []);

  return data;
}
```

**3. Utiliser dans page**
```javascript
const myData = useMyNewData();
```

### Changer les Couleurs

**1. Modifier tokens**
```javascript
// styles/tokens.js
export const tokens = {
  colors: {
    primary: {
      500: '#FF5733', // Change le vert en orange!
    },
  },
};
```

**2. Tous les composants updatent automatiquement!**

### Debugging Tips

**1. Logs de hooks:**
```javascript
const stats = useCameraStats();
console.log('Camera stats:', stats); // Voir les données
```

**2. React DevTools:**
- Install extension Chrome/Firefox
- Voir state/props de chaque composant

**3. Network Tab:**
- F12 → Network
- Voir tous les fetch/polling
- Vérifier réponses backend

**4. Backend logs:**
```python
print("Current counts:", counts)  # Dans camera_worker()
```

---

## 📚 Ressources & Liens Utiles

### Documentation

- **React:** https://react.dev
- **Vite:** https://vitejs.dev
- **Leaflet:** https://leafletjs.com
- **Recharts:** https://recharts.org
- **Lucide Icons:** https://lucide.dev

### Fichiers Clés à Connaître

| Fichier | Rôle |
|---------|------|
| `App.jsx` | Router principal |
| `styles/tokens.js` | Design system |
| `layouts/AppLayout.jsx` | Structure app |
| `hooks/useCameraStats.js` | Pattern de hook |
| `components/ui/Card.jsx` | Composant de base |
| `pages/LiveCameraPage.jsx` | Page la plus complexe |
| `utils/api.js` | Endpoints centralisés |

### Commandes Utiles

```bash
# Dev
npm run dev              # Lance frontend (port 5173)

# Build
npm run build            # Build production
npm run preview          # Preview build

# Backend
cd /path/to/road_monitoring
python -m uvicorn backend.main:app --reload
```

---

## ✅ Checklist Compréhension

Vous comprenez bien l'app si vous pouvez répondre:

- [ ] Comment passer de `/dashboard` à `/camera`? (React Router)
- [ ] Où sont définies les couleurs? (`styles/tokens.js`)
- [ ] Comment un StatCard reçoit ses données? (Props depuis page qui utilise hook)
- [ ] Pourquoi polling toutes les 3s? (Backend met à jour, frontend récupère)
- [ ] Comment fonctionne heatmap Canvas? (useEffect + positions normalisées)
- [ ] Où changer le style de carte? (`utils/mapStyles.js`)
- [ ] Comment ajouter une page? (Créer fichier + route + menu sidebar)
- [ ] Que fait `useRoadData()`? (Fetch roads + points GeoJSON une fois)
- [ ] Différence StatCard vs KeyMetricCard? (Grand détaillé vs compact simple)
- [ ] Pourquoi des hooks? (Séparation logique/UI, réutilisable)

---

## 🎓 Conclusion

Votre application est une **architecture moderne** avec:

✅ **Séparation claire** logique/présentation (hooks vs components)
✅ **Design system cohérent** (tokens centralisés)
✅ **Composants réutilisables** (DRY principle)
✅ **Routing professionnel** (React Router)
✅ **Data fetching efficace** (Hooks avec polling)
✅ **UI moderne** (Uber-like, vert, animations)
✅ **Backend integration** (REST API + MJPEG stream)
✅ **Temps réel** (Polling + Canvas heatmap)

**Prochaine étape:** Connecter vraies données pour incidents, implémenter Settings, ajouter authentification!

---

*Document créé le 2026-08-09*
*Version: 1.0*
*Auteur: Claude (avec votre collaboration!)*
