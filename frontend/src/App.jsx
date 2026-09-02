import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { LiveMapPage } from './pages/LiveMapPage';
import { IncidentsPage } from './pages/IncidentsPage';
import { LiveCameraPage } from './pages/LiveCameraPage';
import { GraphPage } from './pages/GraphPage';
import { GraphPage3D } from './pages/GraphPage3D';
import { StatisticsPage } from './pages/StatisticsPage';
import { SettingsPage } from './pages/SettingsPage';

function App() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/map" element={<LiveMapPage />} />
          <Route path="/incidents" element={<IncidentsPage />} />
          <Route path="/camera" element={<LiveCameraPage />} />
          <Route path="/graph" element={<GraphPage />} />
          <Route path="/graph3d" element={<GraphPage3D />} />
          <Route path="/stats" element={<StatisticsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}

export default App;
