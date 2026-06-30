import { Routes, Route, Navigate } from 'react-router-dom';
import Home from '../pages/Home.jsx';
import GlobalChat from '../pages/GlobalChat.jsx';
import PrivateChat from '../pages/PrivateChat.jsx';
import Profile from '../pages/Profile.jsx';
import AppLayout from '../components/layout/AppLayout.jsx';
import { ProtectedRoute, RegisteredRoute } from './ProtectedRoute.jsx';
import { useAuth } from '../context/AuthContext.jsx';

/** Redirect authenticated users away from the landing page. */
const PublicOnly = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (!loading && isAuthenticated) return <Navigate to="/chat" replace />;
  return children;
};

const AppRoutes = () => (
  <Routes>
    <Route
      path="/"
      element={
        <PublicOnly>
          <Home />
        </PublicOnly>
      }
    />

    <Route
      element={
        <ProtectedRoute>
          <AppLayout />
        </ProtectedRoute>
      }
    >
      <Route path="/chat" element={<GlobalChat />} />
      <Route
        path="/chat/:userId"
        element={
          <RegisteredRoute>
            <PrivateChat />
          </RegisteredRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <RegisteredRoute>
            <Profile />
          </RegisteredRoute>
        }
      />
    </Route>

    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default AppRoutes;
