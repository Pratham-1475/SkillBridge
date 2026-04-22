import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { useAuth } from '../context/AuthContext.jsx';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const { resendVerification, verifyEmail, verifyEmailCode } = useAuth();
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [otp, setOtp] = useState('');
  const [status, setStatus] = useState(searchParams.get('token') ? 'loading' : 'idle');
  const [message, setMessage] = useState(
    searchParams.get('token')
      ? 'Verifying your email address...'
      : 'Enter the 6-digit code sent to your email, or open the verification link from your inbox.',
  );
  const token = searchParams.get('token') || '';

  useEffect(() => {
    async function runVerification() {
      if (!token) {
        return;
      }

      try {
        await verifyEmail(token);
        setStatus('success');
        setMessage('Your email is verified and your session is now active.');
      } catch (error) {
        setStatus('error');
        setMessage(error.message);
      }
    }

    runVerification();
  }, [token]);

  async function handleOtpSubmit(event) {
    event.preventDefault();
    setStatus('loading');
    setMessage('Checking your verification code...');

    try {
      await verifyEmailCode({ email, otp });
      setStatus('success');
      setMessage('Your email is verified and your session is now active.');
    } catch (error) {
      setStatus('error');
      setMessage(error.message);
    }
  }

  async function handleResend() {
    if (!email.trim()) {
      setStatus('error');
      setMessage('Enter your email address first so we know where to send the code.');
      return;
    }

    setStatus('loading');
    setMessage('Sending a fresh verification email...');

    try {
      const response = await resendVerification(email);
      setStatus('idle');
      setMessage(response.message);
    } catch (error) {
      setStatus('error');
      setMessage(error.message);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <section className="fade-up glass-panel rounded-[2.5rem] p-8 text-center shadow-glow sm:p-10">
        <p className="text-xs uppercase tracking-[0.35em] text-accent/80">Email verification</p>
        <h1 className="mt-4 font-display text-4xl text-ink">
          {status === 'success' ? 'Email verified' : status === 'error' ? 'Verification failed' : token ? 'Working on it' : 'Enter your code'}
        </h1>
        <p className="mt-5 text-base leading-7 text-slate-600">{message}</p>

        {status === 'loading' ? (
          <div className="mt-8 flex items-center justify-center gap-2">
            <span className="loading-dot" />
            <span className="loading-dot" />
            <span className="loading-dot" />
          </div>
        ) : null}

        {!token && status !== 'success' ? (
          <form className="mx-auto mt-8 max-w-md space-y-4 text-left" onSubmit={handleOtpSubmit}>
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-200">
              Email address
              <input
                className="input-shell rounded-2xl px-4 py-3 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/10"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                type="email"
                value={email}
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-slate-200">
              6-digit code
              <input
                className="input-shell rounded-2xl px-4 py-3 text-center text-2xl font-bold tracking-[0.45em] outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/10"
                inputMode="numeric"
                maxLength={6}
                onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                value={otp}
              />
            </label>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                className="rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white shadow-glow transition hover:bg-plum disabled:opacity-70"
                disabled={status === 'loading'}
                type="submit"
              >
                Verify code
              </button>
              <button
                className="rounded-full border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-accent hover:text-white"
                disabled={status === 'loading'}
                onClick={handleResend}
                type="button"
              >
                Resend email
              </button>
            </div>
          </form>
        ) : null}

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            className="rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white shadow-glow transition hover:bg-plum"
            to="/admin"
          >
            Go to admin
          </Link>
          <Link
            className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-accent hover:text-accent"
            to="/browse"
          >
            Browse marketplace
          </Link>
        </div>
      </section>
    </div>
  );
}
