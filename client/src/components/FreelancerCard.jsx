import { Link } from 'react-router-dom';

import CategoryPill from './CategoryPill.jsx';
import StarRating from './StarRating.jsx';

export default function FreelancerCard({ freelancer, delay = 0, showBio = true }) {
  return (
    <article
      className="fade-up group glass-panel overflow-hidden rounded-[1.75rem] p-5 transition duration-200 hover:scale-[1.03] hover:border-accent/40"
      style={{ animationDelay: `${delay * 0.08}s` }}
    >
      <div className="flex items-start gap-4">
        <img
          alt={freelancer.name}
          className="h-16 w-16 rounded-2xl object-cover ring-2 ring-white/10"
          src={freelancer.avatarUrl}
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="font-display text-xl text-ink">{freelancer.name}</h3>
              <p className="mt-1 text-sm text-slate-300">{freelancer.title}</p>
            </div>
            <div className="rounded-2xl bg-mist px-3 py-2 text-right">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Rate</p>
              <p className="font-display text-lg text-accent">${freelancer.hourlyRate}/hr</p>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <CategoryPill label={freelancer.category} />
            <StarRating rating={freelancer.rating} reviewCount={freelancer.reviewCount} />
          </div>
        </div>
      </div>

      {showBio ? <p className="mt-4 text-sm leading-6 text-slate-300">{freelancer.bio}</p> : null}

      <div className="mt-4 flex flex-wrap gap-2">
        {freelancer.skills.slice(0, 5).map((skill) => (
          <span key={skill} className="rounded-full bg-slate-900/80 px-3 py-1.5 text-xs font-medium text-slate-200">
            {skill}
          </span>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between">
        <span className="text-xs uppercase tracking-[0.22em] text-slate-400">Available for scoped work</span>
        <Link
          className="rounded-full border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-100 transition group-hover:border-accent group-hover:text-white"
          to={`/freelancer/${freelancer._id}`}
        >
          View profile
        </Link>
      </div>
    </article>
  );
}
