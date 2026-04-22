import { useState } from 'react';
import { Link } from 'react-router-dom';

import { scopeProject } from '../services/api.js';
import StarRating from './StarRating.jsx';

function LoadingDots() {
  return (
    <div className="flex items-center gap-2">
      <span className="loading-dot" />
      <span className="loading-dot" />
      <span className="loading-dot" />
    </div>
  );
}

function formatCurrency(value) {
  return `$${Number(value ?? 0).toLocaleString()}`;
}

function ResultCard({ eyebrow, title, children, className = '' }) {
  return (
    <section className={`rounded-[1.5rem] border border-slate-800/90 bg-slate-950/75 p-5 ${className}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">{eyebrow}</p>
      {title ? <h3 className="mt-2 font-display text-2xl text-white">{title}</h3> : null}
      <div className={title ? 'mt-4' : 'mt-3'}>{children}</div>
    </section>
  );
}

function ReadablePill({ children, tone = 'default' }) {
  const tones = {
    default: 'border-indigo-400/25 bg-indigo-400/10 text-indigo-100',
    cyan: 'border-cyan-300/25 bg-cyan-300/10 text-cyan-100',
  };

  return (
    <span className={`rounded-full border px-3 py-2 text-sm font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
}

function FreelancerMatchCard({ freelancer, delay }) {
  return (
    <article
      className="fade-up rounded-[1.35rem] border border-slate-800 bg-slate-900/75 p-4 transition duration-200 hover:border-accent/55 hover:bg-slate-900"
      style={{ animationDelay: `${delay * 0.08}s` }}
    >
      <div className="flex gap-4">
        <img
          alt={freelancer.name}
          className="h-14 w-14 shrink-0 rounded-2xl object-cover ring-2 ring-white/10"
          src={freelancer.avatarUrl}
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h4 className="truncate font-display text-lg text-white">{freelancer.name}</h4>
              <p className="mt-1 text-sm leading-5 text-slate-300">{freelancer.title}</p>
            </div>
            <p className="rounded-full border border-indigo-400/25 bg-indigo-400/10 px-3 py-1 text-sm font-bold text-indigo-100">
              ${freelancer.hourlyRate}/hr
            </p>
          </div>

          <div className="mt-3">
            <StarRating rating={freelancer.rating} reviewCount={freelancer.reviewCount} />
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {freelancer.skills?.slice(0, 4).map((skill) => (
              <span key={skill} className="rounded-full bg-slate-950 px-2.5 py-1 text-xs font-medium text-slate-200">
                {skill}
              </span>
            ))}
          </div>

          <Link
            className="mt-4 inline-flex rounded-full border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-accent hover:text-white"
            to={`/freelancer/${freelancer._id}`}
          >
            View profile
          </Link>
        </div>
      </div>
    </article>
  );
}

export default function AIScopeAssistant({
  collapsible = false,
  compact = false,
  title = 'AI Project Scoping Assistant',
  description = 'Drop in a rough project idea and get skills, stack direction, budget guidance, and matched freelancers.',
}) {
  const [projectDescription, setProjectDescription] = useState('');
  const [status, setStatus] = useState('idle');
  const [result, setResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isOpen, setIsOpen] = useState(!collapsible);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!projectDescription.trim()) {
      setStatus('error');
      setErrorMessage('Please describe the project you want scoped.');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      const scopedResult = await scopeProject(projectDescription.trim());
      setResult(scopedResult);
      setStatus('result');
      setIsOpen(true);
    } catch (error) {
      setStatus('error');
      setErrorMessage(error.message);
    }
  }

  return (
    <section className="glass-panel rounded-[2rem] p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-accent/75">AI Scope</p>
          <h2 className="mt-3 font-display text-3xl text-ink sm:text-4xl">{title}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">{description}</p>
        </div>

        {collapsible ? (
          <button
            className="rounded-full border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-accent hover:text-white"
            onClick={() => setIsOpen((current) => !current)}
            type="button"
          >
            {isOpen ? 'Collapse' : 'Open assistant'}
          </button>
        ) : null}
      </div>

      {isOpen ? (
        <div className="mt-6">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-200">
              Project description
              <textarea
                className={`input-shell rounded-[1.5rem] px-4 py-4 outline-none transition ${
                  compact ? 'min-h-28' : 'min-h-36'
                }`}
                onChange={(event) => setProjectDescription(event.target.value)}
                placeholder="I need a food delivery app with customer ordering, rider tracking, and a merchant dashboard."
                value={projectDescription}
              />
            </label>

            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Structured Gemini scoping response</p>
              <button
                className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white shadow-glow transition hover:bg-plum disabled:cursor-not-allowed disabled:opacity-70"
                disabled={status === 'loading'}
                type="submit"
              >
                {status === 'loading' ? 'Scoping...' : 'Scope my project'}
              </button>
            </div>
          </form>

          {status === 'loading' ? (
            <div className="mt-6 flex items-center justify-between rounded-[1.5rem] border border-accent/25 bg-mist px-5 py-4">
              <div>
                <p className="font-medium text-ink">Analyzing your project brief</p>
                <p className="text-sm text-slate-300">Matching skills, stack, budget, and ideal freelancers.</p>
              </div>
              <LoadingDots />
            </div>
          ) : null}

          {status === 'error' ? (
            <div className="mt-6 rounded-[1.5rem] border border-rose-200/60 bg-rose-950/30 px-5 py-4 text-sm text-rose-300">
              {errorMessage || 'The scoping assistant ran into an issue.'}
            </div>
          ) : null}

          {status === 'result' && result ? (
            <div className="result-panel mt-8 overflow-hidden rounded-[2rem] border border-accent/25 bg-slate-950/85 p-4 shadow-glow sm:p-6">
              <div className="rounded-[1.6rem] border border-white/10 bg-gradient-to-br from-indigo-500/20 via-slate-950 to-cyan-400/10 p-5">
                <div className="flex flex-wrap items-start justify-between gap-5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.32em] text-indigo-200/80">Scope summary</p>
                    <h3 className="mt-2 font-display text-3xl text-white">Your project blueprint</h3>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                      Cleaned up into skills, stack, budget, reasoning, and matched freelancers.
                    </p>
                  </div>
                  <div className="min-w-52 rounded-[1.35rem] border border-indigo-300/25 bg-indigo-300/10 px-5 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-indigo-100/75">Budget range</p>
                    <p className="mt-2 font-display text-3xl text-white">
                      {formatCurrency(result.budgetRange?.min)} - {formatCurrency(result.budgetRange?.max)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid gap-5 xl:grid-cols-2">
                <ResultCard eyebrow="Required skills" title="Capabilities to hire for">
                  <div className="flex flex-wrap gap-2.5">
                    {result.requiredSkills?.length ? (
                      result.requiredSkills.map((skill) => <ReadablePill key={skill}>{skill}</ReadablePill>)
                    ) : (
                      <p className="text-sm leading-6 text-slate-300">No specific required skills were returned.</p>
                    )}
                  </div>
                </ResultCard>

                <ResultCard eyebrow="Recommended stack" title="Suggested build path">
                  <div className="flex flex-wrap gap-2.5">
                    {result.recommendedStack?.length ? (
                      result.recommendedStack.map((stackItem) => (
                        <ReadablePill key={stackItem} tone="cyan">
                          {stackItem}
                        </ReadablePill>
                      ))
                    ) : (
                      <p className="text-sm leading-6 text-slate-300">No stack recommendation was returned.</p>
                    )}
                  </div>
                </ResultCard>
              </div>

              <ResultCard eyebrow="Reasoning" title="Why this scope fits" className="mt-5">
                <p className="text-base leading-8 text-slate-200">{result.reasoning || 'No reasoning was returned.'}</p>
              </ResultCard>

              <div className="mt-5 rounded-[1.5rem] border border-slate-800/90 bg-slate-950/75 p-5">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Suggested freelancers</p>
                    <h3 className="mt-2 font-display text-2xl text-white">Best matches from the marketplace</h3>
                  </div>
                  <p className="text-sm text-slate-400">Up to 3 strongest fits</p>
                </div>

                <div className="mt-5 grid gap-4">
                  {result.suggestedFreelancers?.length ? (
                    result.suggestedFreelancers.slice(0, 3).map((freelancer, index) => (
                      <FreelancerMatchCard
                        key={freelancer._id ?? freelancer.name}
                        delay={index + 1}
                        freelancer={freelancer}
                      />
                    ))
                  ) : (
                    <div className="rounded-[1.35rem] border border-dashed border-slate-700 px-5 py-6 text-sm leading-6 text-slate-300">
                      The AI did not return matched freelancers this time, but the required skills and stack guidance
                      are still available.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
