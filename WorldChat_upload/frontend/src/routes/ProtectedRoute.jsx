import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Spinner from '../components/common/Spinner.jsx';

/** Full-screen loader while the auth state is bootstrapping. */
const FullScreenLoader = () => (
  <div className="grid h-[100dvh] place-items-center bg-slate-100 dark:bg-slate-950">
    <div className="flex flex-col items-center gap-3 text-slate-500">
      <Spinner size={8} />
      <span className="text-sm">Loading WorldChat…</span>
    </div>
  </div>
);

/** Requires any authenticated principal (guest or user). */
export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  if (loading) return <FullScreenLoader />;
  if (!isAuthenticated) return <Navigate to="/" replace state={{ from: location }} />;
  return children;
};

/** Requires a registered (non-guest) user. */
export const RegisteredRoute = ({ children }) => {
  const { isAuthenticated, isUser, loading } = useAuth();
  if (loading) return <FullScreenLoader />;
  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (!isUser) return <Navigate to="/chat" replace />;
  return children;
};
