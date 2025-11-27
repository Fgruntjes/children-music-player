import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './store/authStore';
import { Layout } from './components/Layout';
import { FullPageLoader } from './components/LoadingSpinner';
import {
  LoginPage,
  DeviceSetupPage,
  NoMusicAccessPage,
  HomePage,
  DeviceInfoPage,
  PairPage,
  WhitelistPage,
  DevicesPage,
  ChildrenPage,
  BrowsePage,
  MyPlaylistsPage,
} from './pages';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user, device } = useAuthStore();

  if (isLoading) {
    return <FullPageLoader message="Loading..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user && !user.hasMusicAccess) {
    return <Navigate to="/no-music-access" replace />;
  }

  if (device && !device.type) {
    return <Navigate to="/device-setup" replace />;
  }

  return <>{children}</>;
}

function ParentRoute({ children }: { children: React.ReactNode }) {
  const { device } = useAuthStore();

  if (device?.type !== 'parent') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function ChildRoute({ children }: { children: React.ReactNode }) {
  const { device } = useAuthStore();

  if (device?.type !== 'child') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/no-music-access" element={<NoMusicAccessPage />} />

          {/* Semi-protected routes */}
          <Route path="/device-setup" element={<DeviceSetupPage />} />
          <Route path="/pair/:deviceId" element={<PairPage />} />

          {/* Protected routes */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<HomePage />} />
            <Route path="/device-info" element={<DeviceInfoPage />} />

            {/* Parent routes */}
            <Route
              path="/whitelist"
              element={
                <ParentRoute>
                  <WhitelistPage />
                </ParentRoute>
              }
            />
            <Route
              path="/devices"
              element={
                <ParentRoute>
                  <DevicesPage />
                </ParentRoute>
              }
            />
            <Route
              path="/children"
              element={
                <ParentRoute>
                  <ChildrenPage />
                </ParentRoute>
              }
            />

            {/* Child routes */}
            <Route
              path="/browse"
              element={
                <ChildRoute>
                  <BrowsePage />
                </ChildRoute>
              }
            />
            <Route
              path="/my-playlists"
              element={
                <ChildRoute>
                  <MyPlaylistsPage />
                </ChildRoute>
              }
            />
            <Route
              path="/my-playlists/:playlistId"
              element={
                <ChildRoute>
                  <MyPlaylistsPage />
                </ChildRoute>
              }
            />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
