import { useState } from 'react';
import { Link } from 'react-router-dom';

import { useAuth } from '../context/AuthContext.jsx';

const EMPTY_FORM = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  acceptedTerms: false,
};

export default function SignupPage() {
  const { signup } = useAuth();
  const [form, setForm] = useState(EMPTY_FORM);
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const [verificationEmail, setVerificationEmail] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage('');
    setVerificationEmail('');

    if (form.password !== form.confirmPassword) {
      setStatus('error');
      setMessage('Passwords do not match.');
      return;
    }

    setStatus('loading');

    try {
      const response = await signup({
        name: form.name,
        email: form.email,
        password: form.password,
        acceptedTerms: form.acceptedTerms,
      });

      setStatus('success');
      setMessage(response.message);
      setVerificationEmail(response.verificationEmail || form.email);
      setForm(EMPTY_FORM);
    } catch (error) {
      setStatus('error');
      setMessage(error.message);
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <section className="fade-up grid gap-8 rounded-[2.5rem] bg-ink p-8 text-white shadow-glow sm:p-10 lg:grid-cols-[0.44fr_0.56fr]">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-white/60">Sign up</p>
          <h1 className="mt-4 font-display text-5xl leading-tight">Create a verified SkillBridge account</h1>
          <p className="mt-5 text-base leading-8 text-slate-300">
            New accounts must confirm email ownership before login. SkillBridge sends a verification link and 6-digit OTP to your inbox.
          </p>

          <div className="mt-8 space-y-3 rounded-[2rem] border border-white/10 bg-white/5 p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/75">Requirements</p>
            <p className="text-sm text-slate-300">At least 8 characters</p>
            <p className="text-sm text-slate-300">Uppercase, lowercase, number, and special character</p>
            <p className="text-sm text-slate-300">Valid email address and accepted marketplace terms</p>
          </div>
        </div>

        <form className="glass-panel rounded-[2rem] p-6 text-slate-900" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700 sm:col-span-2">
              Full name
              <input
                className="rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/10"
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                placeholder="Alicia Rivera"
                value={form.name}
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700 sm:col-span-2">
              Email
              <input
                className="rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/10"
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                placeholder="alicia@company.com"
                type="email"
                value={form.email}
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              Password
              <input
                className="rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/10"
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                placeholder="Strong password"
                type="password"
                value={form.password}
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              Confirm password
              <input
                className="rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/10"
                onChange={(event) => setForm((current) => ({ ...current, confirmPassword: event.target.value }))}
                placeholder="Repeat password"
                type="password"
                value={form.confirmPassword}
              />
            </label>
          </div>

          <label className="mt-5 flex items-start gap-3 rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-700">
            <input
              checked={form.acceptedTerms}
              className="mt-1 h-4 w-4 rounded border-slate-300"
              onChange={(event) => setForm((current) => ({ ...current, acceptedTerms: event.target.checked }))}
              type="checkbox"
            />
            <span>I agree to SkillBridge marketplace terms and understand that my email must be verified before login.</span>
          </label>

          {message ? (
            <div
              className={`mt-4 rounded-[1.5rem] px-4 py-3 text-sm ${
                status === 'error'
                  ? 'border border-rose-200 bg-rose-50 text-rose-600'
                  : 'border border-emerald-200 bg-emerald-50 text-emerald-700'
              }`}
            >
              {message}
            </div>
          ) : null}

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <button
              className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white shadow-glow transition hover:bg-plum disabled:opacity-70"
              disabled={status === 'loading'}
              type="submit"
            >
              {status === 'loading' ? 'Creating account...' : 'Create account'}
            </button>
            <Link className="text-sm font-semibold text-accent transition hover:text-plum" to="/login">
              Already verified? Log in
            </Link>
          </div>

          {verificationEmail ? (
            <Link
              className="mt-5 inline-flex rounded-full border border-accent px-5 py-3 text-sm font-semibold text-accent transition hover:bg-mist"
              to={`/verify-email?email=${encodeURIComponent(verificationEmail)}`}
            >
              Enter OTP from email
            </Link>
          ) : null}
        </form>
      </section>
    </div>
  );
}
