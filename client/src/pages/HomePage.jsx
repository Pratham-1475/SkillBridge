import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import AIScopeAssistant from '../components/AIScopeAssistant.jsx';
import CategoryPill from '../components/CategoryPill.jsx';
import FreelancerCard from '../components/FreelancerCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { getFreelancers } from '../services/api.js';

const CATEGORY_COPY = {
  'Web Development': 'Marketplace fronts, internal dashboards, payments, and growth-friendly product surfaces.',
  'Mobile Apps': 'Consumer-grade ordering flows, driver experiences, and location-aware mobile products.',
  'UI/UX Design': 'Research-led product architecture, UI systems, and launch-ready prototypes.',
  'AI & Automation': 'Scoping, workflow intelligence, support copilots, and knowledge-powered assistants.',
  'Marketplace Systems': 'Operational tooling for admin teams, supply quality, and platform controls.',
  DevOps: 'Infrastructure hardening, observability, and deployment pathways for scale.',
};

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const [freelancers, setFreelancers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadFreelancers() {
      try {
        const data = await getFreelancers();
        setFreelancers(data);
      } catch (loadError) {
        setError(loadError.message);
      }
    }

    loadFreelancers();
  }, []);

  const featuredFreelancers = freelancers.slice(0, 3);
  const featuredCategories = Array.from(new Set(freelancers.map((freelancer) => freelancer.category))).slice(0, 4);
  const averageRate = freelancers.length
    ? Math.round(freelancers.reduce((total, freelancer) => total + freelancer.hourlyRate, 0) / freelancers.length)
    : 0;

  return (
    <div className="space-y-10">
      <section className="fade-up mesh-surface overflow-hidden rounded-[2.5rem] border border-white/70 p-8 shadow-glow sm:p-10 lg:p-12">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.38em] text-accent/80">MERN Marketplace</p>
            <h1 className="mt-5 max-w-3xl font-display text-5xl leading-tight text-ink sm:text-6xl">
              Turn vague ideas into scoped projects and trusted freelancer matches.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              SkillBridge pairs curated freelance talent with an AI scoping assistant that clarifies requirements,
              stack choices, realistic budgets, and who should build what.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white shadow-glow transition hover:bg-plum" to="/browse">
                Browse freelancers
              </Link>
              {isAuthenticated ? (
                <Link className="rounded-full border border-slate-700 px-6 py-3 text-sm font-semibold text-slate-100 transition hover:border-accent hover:text-white" to="/admin">
                  Open admin
                </Link>
              ) : (
                <>
                  <Link className="rounded-full border border-slate-700 px-6 py-3 text-sm font-semibold text-slate-100 transition hover:border-accent hover:text-white" to="/signup">
                    Sign up
                  </Link>
                  <Link className="rounded-full border border-slate-700 bg-slate-900/80 px-6 py-3 text-sm font-semibold text-slate-100 transition hover:border-accent hover:text-white" to="/login">
                    Log in
                  </Link>
                </>
              )}
            </div>

            <div className="mt-8 flex flex-wrap gap-2">
              {['Search', 'Scope', 'Ship'].map((label) => (
                <CategoryPill key={label} label={label} />
              ))}
            </div>
          </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="fade-up glass-panel rounded-[2rem] p-6" style={{ animationDelay: '0.08s' }}>
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Available talent</p>
                <p className="mt-4 font-display text-5xl text-ink">{freelancers.length || 6}</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">Seeded freelancers across web, mobile, AI, UX, and ops.</p>
              </div>
              <div className="fade-up rounded-[2rem] bg-ink p-6 text-white" style={{ animationDelay: '0.16s' }}>
                <p className="text-xs uppercase tracking-[0.25em] text-white/60">Average rate</p>
                <p className="mt-4 font-display text-5xl">${averageRate || 81}</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">Clear pricing context for scoping MVPs and feature sprints.</p>
              </div>
              <div className="fade-up rounded-[2rem] bg-white/85 p-6 sm:col-span-2" style={{ animationDelay: '0.24s' }}>
                <p className="text-xs uppercase tracking-[0.25em] text-accent/75">Why teams use it</p>
                <p className="mt-4 font-display text-3xl text-ink">
                  Faster discovery, better briefs, and fewer mismatched conversations.
                </p>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                  The AI scoping assistant turns loose descriptions into structured delivery plans while the marketplace
                  keeps every recommendation grounded in real freelancer inventory.
                </p>
              </div>
            </div>
          </div>
      </section>

      {!isAuthenticated ? (
        <section className="fade-up" style={{ animationDelay: '0.04s' }}>
          <div className="surface-panel rounded-[2.5rem] p-8 sm:p-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-accent/80">Account access</p>
                <h2 className="mt-3 font-display text-4xl text-ink">Create an account before you manage the marketplace</h2>
                <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
                  Sign up to unlock the admin workspace, verify your email, and manage freelancers, services, and inquiries.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white shadow-glow transition hover:bg-plum" to="/signup">
                  Create account
                </Link>
                <Link className="rounded-full border border-slate-700 px-6 py-3 text-sm font-semibold text-slate-100 transition hover:border-accent hover:text-white" to="/login">
                  I already have an account
                </Link>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <section className="fade-up" style={{ animationDelay: '0.08s' }}>
        <AIScopeAssistant />
      </section>

      <section className="fade-up" style={{ animationDelay: '0.16s' }}>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-accent/75">Categories</p>
            <h2 className="mt-3 font-display text-4xl text-ink">Featured expertise lanes</h2>
          </div>
          <Link className="text-sm font-semibold text-accent transition hover:text-plum" to="/browse">
            See the full marketplace
          </Link>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {featuredCategories.map((category, index) => (
            <article
              key={category}
              className="fade-up glass-panel rounded-[1.75rem] p-6"
              style={{ animationDelay: `${0.08 * (index + 1)}s` }}
            >
              <div className="flex items-center justify-between gap-4">
                <CategoryPill label={category} />
                <span className="rounded-full bg-mist px-3 py-1 text-xs font-semibold text-accent">Featured</span>
              </div>
              <p className="mt-5 text-base leading-7 text-slate-300">
                {CATEGORY_COPY[category] || 'High-signal freelance support for modern product teams.'}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="fade-up" style={{ animationDelay: '0.24s' }}>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-accent/75">Freelancers</p>
            <h2 className="mt-3 font-display text-4xl text-ink">Top-rated talent ready for scoped work</h2>
          </div>
          <Link className="text-sm font-semibold text-accent transition hover:text-plum" to="/browse">
            Browse all profiles
          </Link>
        </div>

        {error ? (
          <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-600">{error}</div>
        ) : (
          <div className="grid gap-5 xl:grid-cols-3">
            {featuredFreelancers.map((freelancer, index) => (
              <FreelancerCard key={freelancer._id} delay={index + 1} freelancer={freelancer} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
