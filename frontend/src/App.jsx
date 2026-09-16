import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AppLayout } from './layouts/AppLayout';
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

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected routes - wrapped in AppLayout */}
          <Route path="/" element={
            <ProtectedRoute>
              <AppLayout>
                <Navigate to="/dashboard" replace />
              </AppLayout>
            </ProtectedRoute>
          } />

          {/* Viewer, Operator, Admin: Dashboard, Map, Stats */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <AppLayout>
                <Dashboard />
              </AppLayout>
            </ProtectedRoute>
          } />

          <Route path="/map" element={
            <ProtectedRoute>
              <AppLayout>
                <LiveMapPage />
              </AppLayout>
            </ProtectedRoute>
          } />

          <Route path="/stats" element={
            <ProtectedRoute>
              <AppLayout>
                <StatisticsPage />
              </AppLayout>
            </ProtectedRoute>
          } />

          {/* Operator, Admin only: Camera Wall (multi-camera grid view) */}
          <Route path="/camera-wall" element={
            <ProtectedRoute allowedRoles={['operator', 'admin']}>
              <AppLayout>
                <CameraWallPage />
              </AppLayout>
            </ProtectedRoute>
          } />

          {/* Operator, Admin only: Live camera analytics (now supports dynamic camera IDs) */}
          <Route path="/camera/:cameraId?" element={
            <ProtectedRoute allowedRoles={['operator', 'admin']}>
              <AppLayout>
                <LiveCameraPage />
              </AppLayout>
            </ProtectedRoute>
          } />

          <Route path="/graph" element={
            <ProtectedRoute allowedRoles={['operator', 'admin']}>
              <AppLayout>
                <GraphPage />
              </AppLayout>
            </ProtectedRoute>
          } />

          <Route path="/graph3d" element={
            <ProtectedRoute allowedRoles={['operator', 'admin']}>
              <AppLayout>
                <GraphPage3D />
              </AppLayout>
            </ProtectedRoute>
          } />

          <Route path="/incidents" element={
            <ProtectedRoute allowedRoles={['operator', 'admin']}>
              <AppLayout>
                <IncidentsPage />
              </AppLayout>
            </ProtectedRoute>
          } />

          {/* Admin only: Settings with user management */}
          <Route path="/settings" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AppLayout>
                <SettingsPage />
              </AppLayout>
            </ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
