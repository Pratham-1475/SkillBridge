import { useState } from 'react';

import { createInquiry } from '../services/api.js';

const EMPTY_FORM = {
  name: '',
  email: '',
  subject: '',
  message: '',
};

function validateForm(form) {
  const nextErrors = {};

  if (!form.name.trim() || form.name.trim().length < 2) {
    nextErrors.name = 'Please enter your full name.';
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    nextErrors.email = 'Please enter a valid email address.';
  }

  if (!form.subject.trim() || form.subject.trim().length < 4) {
    nextErrors.subject = 'Please add a short subject.';
  }

  if (!form.message.trim() || form.message.trim().length < 20) {
    nextErrors.message = 'Please share a bit more detail so freelancers can help well.';
  }

  return nextErrors;
}

export default function ContactForm({
  freelancerId = '',
  initialSubject = '',
  title = 'Tell us what you are building',
  subtitle = 'Share the project goals, delivery window, and any constraints that matter.',
  compact = false,
  onSubmitted,
}) {
  const [form, setForm] = useState({ ...EMPTY_FORM, subject: initialSubject });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle');
  const [statusMessage, setStatusMessage] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();

    const validationErrors = validateForm(form);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length) {
      return;
    }

    setStatus('loading');
    setStatusMessage('');

    try {
      const created = await createInquiry({
        ...form,
        freelancerId,
      });
      setStatus('success');
      setStatusMessage(created.name);
      setForm({ ...EMPTY_FORM, subject: initialSubject });
      setErrors({});
      onSubmitted?.(created);
    } catch (error) {
      setStatus('error');
      setStatusMessage(error.message);
    }
  }

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: '' }));
  }

  if (status === 'success') {
    return (
      <div className="success-pulse glass-panel rounded-[2rem] p-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent text-xl font-bold text-white shadow-glow">
          OK
        </div>
        <h3 className="mt-5 font-display text-3xl text-ink">Inquiry sent successfully</h3>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          {statusMessage || 'Your message is in the queue.'} is now in the SkillBridge pipeline. A follow-up can
          happen from the admin side or directly with the freelancer you contact next.
        </p>
        <button
          className="mt-6 rounded-full border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-accent hover:text-white"
          onClick={() => setStatus('idle')}
          type="button"
        >
          Send another inquiry
        </button>
      </div>
    );
  }

  return (
    <form className="glass-panel rounded-[2rem] p-6 sm:p-8" onSubmit={handleSubmit}>
      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.35em] text-accent/75">Contact</p>
        <h2 className={`mt-3 font-display text-3xl text-ink ${compact ? 'sm:text-2xl' : 'sm:text-4xl'}`}>{title}</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">{subtitle}</p>
      </div>

      <div className={`grid gap-4 ${compact ? 'grid-cols-1' : 'md:grid-cols-2'}`}>
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-200">
          Name
          <input
            className="input-shell rounded-2xl px-4 py-3 outline-none transition"
            onChange={(event) => updateField('name', event.target.value)}
            placeholder="Alicia Rivera"
            value={form.name}
          />
          {errors.name ? <span className="text-xs text-rose-400">{errors.name}</span> : null}
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-slate-200">
          Email
          <input
            className="input-shell rounded-2xl px-4 py-3 outline-none transition"
            onChange={(event) => updateField('email', event.target.value)}
            placeholder="alicia@company.com"
            type="email"
            value={form.email}
          />
          {errors.email ? <span className="text-xs text-rose-400">{errors.email}</span> : null}
        </label>
      </div>

      <label className="mt-4 flex flex-col gap-2 text-sm font-medium text-slate-200">
        Subject
        <input
          className="input-shell rounded-2xl px-4 py-3 outline-none transition"
          onChange={(event) => updateField('subject', event.target.value)}
          placeholder="Marketplace MVP sprint"
          value={form.subject}
        />
        {errors.subject ? <span className="text-xs text-rose-400">{errors.subject}</span> : null}
      </label>

      <label className="mt-4 flex flex-col gap-2 text-sm font-medium text-slate-200">
        Message
        <textarea
          className="input-shell min-h-36 rounded-[1.5rem] px-4 py-3 outline-none transition"
          onChange={(event) => updateField('message', event.target.value)}
          placeholder="We need a freelancer marketplace with AI scoping, admin tools, and polished profiles."
          value={form.message}
        />
        {errors.message ? <span className="text-xs text-rose-400">{errors.message}</span> : null}
      </label>

      {status === 'error' ? (
        <div className="mt-4 rounded-2xl border border-rose-200/50 bg-rose-950/30 px-4 py-3 text-sm text-rose-300">
          {statusMessage || 'We could not send your inquiry. Please try again.'}
        </div>
      ) : null}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Validated form with stored inquiries</p>
        <button
          className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white shadow-glow transition hover:bg-plum disabled:cursor-not-allowed disabled:opacity-70"
          disabled={status === 'loading'}
          type="submit"
        >
          {status === 'loading' ? 'Sending...' : 'Send inquiry'}
        </button>
      </div>
    </form>
  );
}
