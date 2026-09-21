import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { Dashboard } from './pages/Dashboard';
import { LiveMapPage } from './pages/LiveMapPage';
import { IncidentsPage } from './pages/IncidentsPage';
import { LiveCameraPage } from './pages/LiveCameraPage';
import { CameraWallPage } from './pages/CameraWallPage';
import { GraphPage } from './pages/GraphPage';
import { GraphPage3D } from './pages/GraphPage3D';
import { StatisticsPage } from './pages/StatisticsPage';
import { SettingsPage } from './pages/SettingsPage';

/**
 * Every page now renders its own <ConsoleLayout> (icon rail + top status
 * bar), so routes just point at the page — no shared AppLayout wrapper.
 * This is what makes the whole app read as one dark command console
 * instead of a light CRUD app with one dark surface bolted on.
 */
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route path="/" element={
            <ProtectedRoute>
              <Navigate to="/dashboard" replace />
            </ProtectedRoute>
          } />

          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />

          <Route path="/map" element={
            <ProtectedRoute>
              <LiveMapPage />
            </ProtectedRoute>
          } />

          <Route path="/stats" element={
            <ProtectedRoute>
              <StatisticsPage />
            </ProtectedRoute>
          } />

          {/* Operator, Admin only: Camera Wall (multi-camera grid view) */}
          <Route path="/camera-wall" element={
            <ProtectedRoute allowedRoles={['operator', 'admin']}>
              <CameraWallPage />
            </ProtectedRoute>
          } />

          {/* Operator, Admin only: Live camera analytics (dynamic camera IDs) */}
          <Route path="/camera/:cameraId?" element={
            <ProtectedRoute allowedRoles={['operator', 'admin']}>
              <LiveCameraPage />
            </ProtectedRoute>
          } />

          <Route path="/graph" element={
            <ProtectedRoute allowedRoles={['operator', 'admin']}>
              <GraphPage />
            </ProtectedRoute>
          } />

          <Route path="/graph3d" element={
            <ProtectedRoute allowedRoles={['operator', 'admin']}>
              <GraphPage3D />
            </ProtectedRoute>
          } />

          <Route path="/incidents" element={
            <ProtectedRoute allowedRoles={['operator', 'admin']}>
              <IncidentsPage />
            </ProtectedRoute>
          } />

          {/* Admin only: Settings with user management */}
          <Route path="/settings" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <SettingsPage />
            </ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
