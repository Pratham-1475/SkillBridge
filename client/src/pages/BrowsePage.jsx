import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import AIScopeAssistant from '../components/AIScopeAssistant.jsx';
import CategoryPill from '../components/CategoryPill.jsx';
import FreelancerCard from '../components/FreelancerCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { getFreelancers } from '../services/api.js';

export default function BrowsePage() {
  const { isAuthenticated } = useAuth();
  const [catalog, setCatalog] = useState([]);
  const [freelancers, setFreelancers] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [minRating, setMinRating] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadCatalog() {
      try {
        const data = await getFreelancers();
        setCatalog(data);
      } catch (loadError) {
        setError(loadError.message);
      }
    }

    loadCatalog();
  }, []);

  useEffect(() => {
    async function loadFreelancers() {
      setLoading(true);
      setError('');

      try {
        const data = await getFreelancers({
          q: search,
          category: selectedCategory,
          minRating,
        });
        setFreelancers(data);
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setLoading(false);
      }
    }

    loadFreelancers();
  }, [search, selectedCategory, minRating]);

  const categories = Array.from(new Set(catalog.map((freelancer) => freelancer.category)));

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(420px,0.4fr)_minmax(0,1fr)]">
      <aside className="space-y-6">
        <section className="fade-up glass-panel rounded-[2rem] p-6">
          <p className="text-xs uppercase tracking-[0.35em] text-accent/75">Browse</p>
          <h1 className="mt-3 font-display text-4xl text-ink">Find the right freelancer fit</h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Search across categories, specialties, bios, and ratings to shortlist talent faster.
          </p>

          <div className="mt-6 space-y-4">
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-200">
              Search
              <input
                className="input-shell rounded-2xl px-4 py-3 outline-none transition"
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search skills, titles, or keywords"
                value={search}
              />
            </label>

            <div>
              <p className="text-sm font-medium text-slate-700">Category</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <CategoryPill active={!selectedCategory} label="All" onClick={() => setSelectedCategory('')} />
                {categories.map((category) => (
                  <CategoryPill
                    key={category}
                    active={selectedCategory === category}
                    label={category}
                    onClick={() => setSelectedCategory(category)}
                  />
                ))}
              </div>
            </div>

            <label className="flex flex-col gap-2 text-sm font-medium text-slate-200">
              Minimum rating
              <select
                className="input-shell rounded-2xl px-4 py-3 outline-none transition"
                onChange={(event) => setMinRating(event.target.value)}
                value={minRating}
              >
                <option value="">Any rating</option>
                <option value="4">4.0+</option>
                <option value="4.5">4.5+</option>
                <option value="4.8">4.8+</option>
              </select>
            </label>
          </div>
        </section>

        {!isAuthenticated ? (
          <section className="fade-up surface-panel rounded-[2rem] p-6" style={{ animationDelay: '0.05s' }}>
            <p className="text-xs uppercase tracking-[0.3em] text-accent/80">Guest access</p>
            <h2 className="mt-3 font-display text-3xl text-ink">Need admin tools?</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Create an account to manage freelancers, services, and inquiries after email verification.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link className="rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white shadow-glow transition hover:bg-plum" to="/signup">
                Sign up
              </Link>
              <Link className="rounded-full border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-accent hover:text-white" to="/login">
                Log in
              </Link>
            </div>
          </section>
        ) : null}

        <section className="fade-up" style={{ animationDelay: '0.08s' }}>
          <AIScopeAssistant
            collapsible
            compact
            description="Use the assistant without leaving browse mode, then jump straight into matched profiles."
            title="Scope in the sidebar"
          />
        </section>
      </aside>

      <section className="fade-up" style={{ animationDelay: '0.12s' }}>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-accent/75">Marketplace grid</p>
            <h2 className="mt-3 font-display text-4xl text-ink">
              {loading ? 'Loading freelancers...' : `${freelancers.length} freelancer matches`}
            </h2>
          </div>
          <p className="text-sm text-slate-500">Search, filter, and compare profiles with scoped context in reach.</p>
        </div>

        {error ? (
          <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-600">{error}</div>
        ) : null}

        {loading ? (
          <div className="glass-panel flex min-h-60 items-center justify-center rounded-[2rem]">
            <div className="flex items-center gap-2">
              <span className="loading-dot" />
              <span className="loading-dot" />
              <span className="loading-dot" />
            </div>
          </div>
        ) : freelancers.length ? (
          <div className="grid gap-5 xl:grid-cols-2">
            {freelancers.map((freelancer, index) => (
              <FreelancerCard key={freelancer._id} delay={index + 1} freelancer={freelancer} />
            ))}
          </div>
        ) : (
          <div className="glass-panel rounded-[2rem] p-10 text-center">
            <h3 className="font-display text-3xl text-ink">No matches for that filter set</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Try widening the rating filter, changing the category, or using the AI assistant to reframe the brief.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
