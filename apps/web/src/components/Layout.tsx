import { Link } from 'react-router-dom';
import { authLogout, useAuth } from '../auth/AuthContext';

export function Layout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return (
    <div>
      <div className="topbar">
        <div className="container row" style={{ justifyContent: 'space-between', padding: '12px 16px' }}>
          <div className="row" style={{ gap: 16 }}>
            <Link to="/" style={{ textDecoration: 'none', color: 'var(--text)', fontWeight: 700 }}>
              Research Vault
            </Link>
            <Link to="/">Материалы</Link>
            <Link to="/new">Добавить</Link>
            <Link to="/collections">Коллекции</Link>
          </div>
          <div className="row" style={{ gap: 10 }}>
            {user && <span className="muted">{user.email}</span>}
            {user && (
              <button type="button" onClick={() => authLogout()}>
                Выйти
              </button>
            )}
          </div>
        </div>
      </div>
      <div style={{ padding: '18px 0' }}>{children}</div>
    </div>
  );
}
