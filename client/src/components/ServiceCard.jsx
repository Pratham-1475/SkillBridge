export default function ServiceCard({ service }) {
  return (
    <article className="fade-up glass-panel rounded-[1.75rem] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-accent/75">{service.category}</p>
          <h3 className="mt-2 font-display text-2xl text-ink">{service.title}</h3>
        </div>
        <div className="rounded-2xl bg-accent px-4 py-3 text-white shadow-glow">
          <p className="text-xs uppercase tracking-[0.2em] text-white/70">From</p>
          <p className="font-display text-lg">${service.price}</p>
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-300">{service.description}</p>

      <div className="mt-5 flex items-center justify-between text-sm text-slate-300">
        <span>{service.deliveryDays} day delivery</span>
        <span className="font-medium text-accent">
          {service.freelancerId?.name ? `by ${service.freelancerId.name}` : 'Ready to book'}
        </span>
      </div>
    </article>
  );
}
