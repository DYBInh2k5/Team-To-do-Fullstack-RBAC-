import { useMemo, useState, type FormEvent } from 'react';
import { useAuth } from '../context/useAuth';

type Mode = 'login' | 'register';

interface FormState {
  name: string;
  email: string;
  password: string;
}

const initialState: FormState = {
  name: '',
  email: '',
  password: '',
};

export function AuthPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [form, setForm] = useState<FormState>(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const title = useMemo(
    () => (mode === 'login' ? 'Dang nhap he thong' : 'Tao tai khoan moi'),
    [mode],
  );

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        await login({ email: form.email, password: form.password });
      } else {
        await register({
          name: form.name,
          email: form.email,
          password: form.password,
        });
      }
      setForm(initialState);
    } catch {
      setError('Thong tin khong hop le hoac may chu tam thoi loi.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-panel">
        <p className="eyebrow">Team To-do</p>
        <h1>{title}</h1>
        <p className="subtitle">
          Quan ly task theo vai tro ADMIN/MEMBER voi API NestJS + MySQL.
        </p>

        <div className="mode-switch">
          <button
            type="button"
            className={mode === 'login' ? 'active' : ''}
            onClick={() => setMode('login')}
          >
            Dang nhap
          </button>
          <button
            type="button"
            className={mode === 'register' ? 'active' : ''}
            onClick={() => setMode('register')}
          >
            Dang ky
          </button>
        </div>

        <form onSubmit={onSubmit} className="auth-form">
          {mode === 'register' ? (
            <label>
              Ho va ten
              <input
                required
                value={form.name}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, name: event.target.value }))
                }
                placeholder="Nguyen Van A"
              />
            </label>
          ) : null}

          <label>
            Email
            <input
              type="email"
              required
              value={form.email}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, email: event.target.value }))
              }
              placeholder="you@example.com"
            />
          </label>

          <label>
            Mat khau
            <input
              type="password"
              required
              minLength={6}
              value={form.password}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, password: event.target.value }))
              }
              placeholder="Toi thieu 6 ky tu"
            />
          </label>

          {error ? <p className="error-text">{error}</p> : null}

          <button type="submit" className="primary" disabled={isSubmitting}>
            {isSubmitting
              ? 'Dang xu ly...'
              : mode === 'login'
                ? 'Vao dashboard'
                : 'Tao tai khoan'}
          </button>
        </form>
      </section>
    </main>
  );
}
