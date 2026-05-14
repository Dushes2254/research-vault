import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { apiFetch, setToken } from '../api/client';
import { useAuth } from '../auth/AuthContext';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export function Register() {
  const nav = useNavigate();
  const { setUser } = useAuth();
  const f = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) });
  return (
    <main className="auth-hero">
      <nav className="auth-nav container" aria-label="Основная навигация">
        <Link to="/login" className="auth-brand">
          Research Vault
        </Link>
        <Link to="/login" className="auth-nav-cta">
          Войти
        </Link>
      </nav>

      <section className="auth-hero-content container auth-register-content">
        <div className="auth-copy">
          <p className="auth-eyebrow">Личный исследовательский архив</p>
          <h1>Создайте пространство для материалов</h1>
          <p>Заведите аккаунт, чтобы собирать ссылки, заметки и коллекции в одном спокойном месте.</p>
        </div>

        <div className="auth-console auth-register-card">
          <div className="auth-console-bar">Research Vault / Регистрация</div>
          <form
            className="auth-form"
            onSubmit={f.handleSubmit(async (v) => {
              const r = (await apiFetch('/auth/register', {
                method: 'POST',
                body: JSON.stringify(v),
              })) as { accessToken: string; user: { id: string; email: string } };
              setToken(r.accessToken);
              setUser(r.user);
              nav('/');
            })}
          >
            <div className="auth-prompt">
              <span>Создайте аккаунт, чтобы начать работать с материалами.</span>
            </div>
            <label>
              <span>Email</span>
              <input type="email" autoComplete="email" {...f.register('email')} />
            </label>
            <label>
              <span>Пароль (мин. 8 символов)</span>
              <input type="password" autoComplete="new-password" {...f.register('password')} />
            </label>
            <div className="auth-form-footer">
              <Link to="/login">Уже есть аккаунт</Link>
              <button className="primary" type="submit" disabled={f.formState.isSubmitting}>
                {f.formState.isSubmitting ? '…' : 'Создать'}
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
