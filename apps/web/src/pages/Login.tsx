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

export function Login() {
  const nav = useNavigate();
  const { setUser } = useAuth();
  const f = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) });

  return (
    <main className="auth-hero">
      <nav className="auth-nav container" aria-label="Основная навигация">
        <Link to="/login" className="auth-brand">
          Research Vault
        </Link>
        <div className="auth-nav-links">
          <a href="#collections">Коллекции</a>
          <a href="#workflow">Процесс</a>
          <a href="#features">Возможности</a>
        </div>
        <Link to="/register" className="auth-nav-cta">
          Начать
        </Link>
      </nav>

      <section className="auth-hero-content container">
        <div className="auth-copy">
          <p className="auth-eyebrow">Личный исследовательский архив</p>
          <h1>Материалы, которые всегда под рукой</h1>
          <p>
            Собирайте статьи, заметки и ссылки в одном спокойном пространстве. Research Vault помогает быстро
            возвращаться к важным идеям и держать коллекции в порядке.
          </p>
          <div className="auth-actions">
            <a href="#login-form" className="auth-primary-link">
              Войти
            </a>
            <Link to="/register" className="auth-secondary-link">
              Создать аккаунт
            </Link>
          </div>
        </div>

        <div className="auth-console" id="login-form">
          <div className="auth-console-bar">Research Vault / Вход</div>
          <form
            className="auth-form"
            onSubmit={f.handleSubmit(async v => {
              const r = (await apiFetch('/auth/login', {
                method: 'POST',
                body: JSON.stringify(v),
              })) as { accessToken: string; user: { id: string; email: string } };
              setToken(r.accessToken);
              setUser(r.user);
              nav('/');
            })}
          >
            <div className="auth-prompt">
              <span>Привет! Войдите, чтобы продолжить работу с материалами.</span>
            </div>
            <label>
              <span>Email</span>
              <input type="email" autoComplete="email" placeholder="you@example.com" {...f.register('email')} />
            </label>
            {f.formState.errors.email && (
              <div className="auth-error">{String(f.formState.errors.email.message)}</div>
            )}
            <label>
              <span>Пароль</span>
              <input type="password" autoComplete="current-password" placeholder="Минимум 8 символов" {...f.register('password')} />
            </label>
            <div className="auth-form-footer">
              <Link to="/register">Нужен аккаунт?</Link>
              <button className="primary auth-submit" type="submit" disabled={f.formState.isSubmitting}>
                {f.formState.isSubmitting ? '…' : 'Войти'}
              </button>
            </div>
          </form>
        </div>

        <div className="auth-logos" aria-label="Разделы продукта">
          <div id="collections">
            <span />
            Коллекции
          </div>
          <div id="workflow">
            <span />
            Материалы
          </div>
          <div id="features">
            <span />
            Поиск
          </div>
          <div>
            <span />
            Заметки
          </div>
        </div>
      </section>
    </main>
  );
}
