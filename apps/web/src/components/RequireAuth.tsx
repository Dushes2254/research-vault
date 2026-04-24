import { Navigate, useLocation } from 'react-router-dom';
import { getToken } from '../api/client';
import { useAuth } from '../auth/AuthContext';

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, ready } = useAuth();
  const loc = useLocation();
  if (!ready) return <div className="container muted">Загрузка…</div>;
  if (!getToken() || !user) return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  return <>{children}</>;
}
