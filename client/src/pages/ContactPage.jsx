import ContactForm from '../components/ContactForm.jsx';

export default function ContactPage() {
  return (
    <div className="grid gap-8 lg:grid-cols-[0.42fr_0.58fr] lg:items-start">
      <section className="fade-up space-y-6">
        <div className="rounded-[2.5rem] bg-ink p-8 text-white shadow-glow sm:p-10">
          <p className="text-xs uppercase tracking-[0.35em] text-white/60">Contact SkillBridge</p>
          <h1 className="mt-4 font-display text-5xl leading-tight">Bring us the brief that still feels messy.</h1>
          <p className="mt-5 text-base leading-8 text-slate-300">
            We designed this form for early-stage project conversations. Share goals, deadlines, blockers, or the
            thing your last vendor missed and we will store it as an inquiry for follow-up.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <article className="fade-up glass-panel rounded-[1.75rem] p-6" style={{ animationDelay: '0.08s' }}>
            <p className="text-xs uppercase tracking-[0.25em] text-accent/75">Response flow</p>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Contact submissions are validated on the client, then stored in MongoDB through the inquiries API.
            </p>
          </article>
          <article className="fade-up glass-panel rounded-[1.75rem] p-6" style={{ animationDelay: '0.16s' }}>
            <p className="text-xs uppercase tracking-[0.25em] text-accent/75">Best for</p>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Marketplace MVPs, mobile products, AI add-ons, redesign sprints, or multi-role freelance squads.
            </p>
          </article>
        </div>
      </section>

      <section className="fade-up" style={{ animationDelay: '0.08s' }}>
        <ContactForm />
      </section>
    </div>
  );
}
