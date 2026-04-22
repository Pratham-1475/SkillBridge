import { NavLink } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="fade-up rounded-[2rem] border border-sand/80 bg-white/85 p-12 shadow-glow">
      <p className="text-sm uppercase tracking-[0.35em] text-accent/70">404</p>
      <h1 className="mt-4 font-display text-4xl text-ink">This bridge leads nowhere yet.</h1>
      <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
        The page you requested does not exist. Head back to the marketplace and keep exploring.
      </p>
      <div className="mt-8">
        <NavLink className="font-medium text-accent transition hover:text-plum" to="/">
          Back to home
        </NavLink>
      </div>
    </div>
  );
}
