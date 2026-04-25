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
    <div className='container' style={{ maxWidth: 520 }}>
      <div className='card stack'>
        <h1 style={{ margin: 0 }}>Вход (тестовый)</h1>
        <form
          className='stack'
          onSubmit={f.handleSubmit(async v => {
            const r = (await apiFetch('/auth/login', {
              method: 'POST',
              body: JSON.stringify(v)
            })) as { accessToken: string; user: { id: string; email: string } };
            setToken(r.accessToken);
            setUser(r.user);
            nav('/');
          })}
        >
          <div className='stack'>
            <label className='muted'>Email</label>
            <input type='email' autoComplete='email' {...f.register('email')} />
            {f.formState.errors.email && (
              <div className='muted' style={{ color: 'var(--danger)' }}>
                {String(f.formState.errors.email.message)}
              </div>
            )}
          </div>
          <div className='stack'>
            <label className='muted'>Пароль</label>
            <input type='password' autoComplete='current-password' {...f.register('password')} />
          </div>
          <div className='row'>
            <button className='primary' type='submit' disabled={f.formState.isSubmitting}>
              {f.formState.isSubmitting ? '…' : 'Войти'}
            </button>
            <Link to='/register'>Создать аккаунт</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
