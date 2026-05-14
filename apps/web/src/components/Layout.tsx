import { Link } from 'react-router-dom';
import { authLogout, useAuth } from '../auth/AuthContext';

export function Layout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return (
    <div className="app-shell">
      <div className="topbar">
        <div className="container app-nav">
          <div className="app-nav-links">
            <Link to="/" className="app-brand">
              Research Vault
            </Link>
            <Link to="/">Материалы</Link>
            <Link to="/new">Добавить</Link>
            <Link to="/collections">Коллекции</Link>
          </div>
          <div className="app-user">
            {user && <span className="muted">{user.email}</span>}
            {user && (
              <button type="button" onClick={() => authLogout()}>
                Выйти
              </button>
            )}
          </div>
        </div>
      </div>
      <main className="app-main">{children}</main>
    </div>
  );
}
