import { NavLink } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950/75">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div>
          <p className="font-display text-2xl text-ink">Build sharper projects with the right freelancer fit.</p>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
            SkillBridge combines marketplace discovery with AI-assisted project scoping so clients can move
            from vague ideas to clear execution plans faster.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <NavLink className="rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white shadow-glow" to="/browse">
            Explore talent
          </NavLink>
          <NavLink className="rounded-full border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-accent hover:text-white" to="/login">
            Log in
          </NavLink>
          <NavLink className="rounded-full border border-slate-700 bg-slate-900/80 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-accent hover:text-white" to="/signup">
            Sign up
          </NavLink>
        </div>
      </div>
    </footer>
  );
}
