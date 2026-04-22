import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext.jsx';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, resendVerification } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const [verificationEmail, setVerificationEmail] = useState('');
  const [needsVerification, setNeedsVerification] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus('loading');
    setMessage('');
    setVerificationEmail('');
    setNeedsVerification(false);

    try {
      await login(form);
      const redirectTo = location.state?.from || '/admin';
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setStatus('error');
      setMessage(error.message);
      setNeedsVerification(Boolean(error.needsVerification));
      setVerificationEmail(error.verificationEmail || form.email);
    }
  }

  async function handleResendVerification() {
    setStatus('loading');
    setMessage('');

    try {
      const response = await resendVerification(form.email);
      setStatus('idle');
      setMessage(response.message);
      setVerificationEmail(response.verificationEmail || form.email);
    } catch (error) {
      setStatus('error');
      setMessage(error.message);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <section className="fade-up glass-panel rounded-[2.5rem] p-8 shadow-glow sm:p-10">
        <p className="text-xs uppercase tracking-[0.35em] text-accent/80">Log in</p>
        <h1 className="mt-4 font-display text-5xl text-ink">Access your SkillBridge account</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
          Verified accounts can manage marketplace content through the admin workspace and keep discovery workflows moving.
        </p>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Email
            <input
              className="rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/10"
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              placeholder="you@example.com"
              type="email"
              value={form.email}
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Password
            <input
              className="rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/10"
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              placeholder="Your password"
              type="password"
              value={form.password}
            />
          </label>

          {message ? (
            <div
              className={`rounded-[1.5rem] px-4 py-3 text-sm ${
                status === 'error'
                  ? 'border border-rose-200 bg-rose-50 text-rose-600'
                  : 'border border-emerald-200 bg-emerald-50 text-emerald-700'
              }`}
            >
              {message}
            </div>
          ) : null}

          {needsVerification ? (
            <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-700">
              <p>Your account exists, but it still needs email verification before login.</p>
              <button
                className="mt-3 rounded-full border border-amber-300 px-4 py-2 font-semibold transition hover:border-accent hover:text-accent"
                onClick={handleResendVerification}
                type="button"
              >
                Resend verification email
              </button>
            </div>
          ) : null}

          {verificationEmail ? (
            <Link
              className="inline-flex rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white shadow-glow transition hover:bg-plum"
              to={`/verify-email?email=${encodeURIComponent(verificationEmail)}`}
            >
              Enter OTP
            </Link>
          ) : null}

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <button
              className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white shadow-glow transition hover:bg-plum disabled:opacity-70"
              disabled={status === 'loading'}
              type="submit"
            >
              {status === 'loading' ? 'Logging in...' : 'Log in'}
            </button>
            <Link className="text-sm font-semibold text-accent transition hover:text-plum" to="/signup">
              Need an account? Sign up
            </Link>
          </div>
        </form>
      </section>
    </div>
  );
}
