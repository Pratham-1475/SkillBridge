export default function CategoryPill({ label, active = false, onClick }) {
  const className = `rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] transition ${
    active
      ? 'border-accent bg-accent text-white shadow-glow'
      : 'border-slate-700 bg-slate-900/75 text-slate-200 hover:border-accent/60 hover:text-white'
  }`;

  if (onClick) {
    return (
      <button className={className} onClick={onClick} type="button">
        {label}
      </button>
    );
  }

  return <span className={className}>{label}</span>;
}
