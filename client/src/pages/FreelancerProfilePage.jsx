import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import CategoryPill from '../components/CategoryPill.jsx';
import ContactForm from '../components/ContactForm.jsx';
import ServiceCard from '../components/ServiceCard.jsx';
import StarRating from '../components/StarRating.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { getFreelancer, getServices, startChat } from '../services/api.js';

function buildReviews(freelancer) {
  if (!freelancer) {
    return [];
  }

  return [
    {
      author: 'Lina from Northstar Labs',
      quote: `${freelancer.name.split(' ')[0]} turned a fuzzy brief into a clear delivery plan and kept momentum high every week.`,
    },
    {
      author: 'Marcus from Driftlane',
      quote: `Strong communication, dependable estimates, and thoughtful decisions around ${freelancer.skills[0] || 'product architecture'}.`,
    },
    {
      author: 'Jules from Orchard Studio',
      quote: `We hired for one sprint and extended to three. The quality of execution matched the strategy from day one.`,
    },
  ];
}

export default function FreelancerProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [freelancer, setFreelancer] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatStatus, setChatStatus] = useState('idle');
  const [chatError, setChatError] = useState('');

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
      setError('');

      try {
        const [freelancerData, serviceData] = await Promise.all([
          getFreelancer(id),
          getServices({ freelancerId: id }),
        ]);

        setFreelancer(freelancerData);
        setServices(serviceData);
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="glass-panel flex min-h-80 items-center justify-center rounded-[2rem]">
        <div className="flex items-center gap-2">
          <span className="loading-dot" />
          <span className="loading-dot" />
          <span className="loading-dot" />
        </div>
      </div>
    );
  }

  if (error || !freelancer) {
    return (
      <div className="rounded-[2rem] border border-rose-200 bg-rose-50 px-6 py-5 text-sm text-rose-600">
        {error || 'This freelancer profile could not be loaded.'}
      </div>
    );
  }

  const reviews = buildReviews(freelancer);
  const isOwnProfile = freelancer.ownerUserId === user?._id || freelancer.ownerUserId?._id === user?._id;

  async function handleStartChat(event) {
    event.preventDefault();
    setChatStatus('loading');
    setChatError('');

    try {
      const response = await startChat({
        freelancerId: freelancer._id,
        message: chatMessage,
      });

      navigate(`/chats?conversation=${response.conversation._id}`);
    } catch (submitError) {
      setChatStatus('error');
      setChatError(submitError.message);
    }
  }

  return (
    <div className="space-y-10">
      <section className="fade-up overflow-hidden rounded-[2.5rem] bg-ink p-8 text-white shadow-glow sm:p-10">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div className="flex items-start gap-5">
            <img
              alt={freelancer.name}
              className="h-28 w-28 rounded-[2rem] object-cover ring-4 ring-white/10"
              src={freelancer.avatarUrl}
            />
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-white/60">Freelancer profile</p>
              <h1 className="mt-3 font-display text-4xl">{freelancer.name}</h1>
              <p className="mt-3 max-w-xl text-lg text-slate-300">{freelancer.title}</p>
              <div className="mt-4">
                <StarRating dark rating={freelancer.rating} reviewCount={freelancer.reviewCount} />
              </div>
            </div>
          </div>

          <div>
            <div className="flex flex-wrap gap-2">
              <CategoryPill label={freelancer.category} />
              <span className="rounded-full border border-white/15 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-white/75">
                ${freelancer.hourlyRate}/hr
              </span>
            </div>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-200">{freelancer.bio}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {freelancer.skills.map((skill) => (
                <span key={skill} className="rounded-full bg-white/10 px-3 py-1.5 text-sm text-white/90">
                  {skill}
                </span>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-ink transition hover:bg-mist"
                onClick={() => setIsInquiryOpen(true)}
                type="button"
              >
                Send inquiry
              </button>
              {isAuthenticated && !isOwnProfile ? (
                <button
                  className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/40"
                  onClick={() => setIsChatOpen(true)}
                  type="button"
                >
                  Start chat
                </button>
              ) : !isAuthenticated ? (
                <button
                  className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/40"
                  onClick={() => navigate('/login', { state: { from: `/freelancer/${freelancer._id}` } })}
                  type="button"
                >
                  Log in to chat
                </button>
              ) : null}
              <a
                className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/40"
                href="#services"
              >
                View services
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="fade-up" id="services" style={{ animationDelay: '0.08s' }}>
        <div className="mb-6">
          <p className="text-xs uppercase tracking-[0.35em] text-accent/75">Services</p>
          <h2 className="mt-3 font-display text-4xl text-ink">Packaged offers</h2>
        </div>

        {services.length ? (
          <div className="grid gap-5 lg:grid-cols-2">
            {services.map((service, index) => (
              <div key={service._id} style={{ animationDelay: `${0.08 * (index + 1)}s` }}>
                <ServiceCard service={service} />
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-panel rounded-[2rem] px-6 py-8 text-sm text-slate-600">
            No services are listed yet for this freelancer, but you can still reach out directly with an inquiry.
          </div>
        )}
      </section>

      <section className="fade-up" style={{ animationDelay: '0.16s' }}>
        <div className="mb-6">
          <p className="text-xs uppercase tracking-[0.35em] text-accent/75">Reviews</p>
          <h2 className="mt-3 font-display text-4xl text-ink">What clients say</h2>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {reviews.map((review, index) => (
            <article
              key={review.author}
              className="fade-up glass-panel rounded-[1.75rem] p-6"
              style={{ animationDelay: `${0.08 * (index + 1)}s` }}
            >
              <p className="text-base leading-7 text-slate-600">"{review.quote}"</p>
              <p className="mt-5 text-sm font-semibold uppercase tracking-[0.2em] text-accent/75">{review.author}</p>
            </article>
          ))}
        </div>
      </section>

      {isInquiryOpen ? (
        <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[2rem]">
            <div className="mb-4 flex justify-end">
              <button
                aria-label="Close inquiry modal"
                className="rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:text-accent"
                onClick={() => setIsInquiryOpen(false)}
                type="button"
              >
                Close
              </button>
            </div>

            <ContactForm
              compact
              freelancerId={freelancer._id}
              initialSubject={`Project inquiry for ${freelancer.name}`}
              onSubmitted={() => {
                window.setTimeout(() => setIsInquiryOpen(false), 1200);
              }}
              subtitle={`Tell ${freelancer.name.split(' ')[0]} what you need built and how soon you want to move.`}
              title={`Work with ${freelancer.name}`}
            />
          </div>
        </div>
      ) : null}

      {isChatOpen ? (
        <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
          <form className="glass-panel w-full max-w-2xl rounded-[2rem] p-6" onSubmit={handleStartChat}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-accent/75">Chat</p>
                <h2 className="mt-3 font-display text-3xl text-ink">Start a conversation with {freelancer.name}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  Your first message opens a private chat and emails the freelancer a notification.
                </p>
              </div>
              <button
                className="rounded-full border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-accent hover:text-white"
                onClick={() => setIsChatOpen(false)}
                type="button"
              >
                Close
              </button>
            </div>

            <label className="mt-6 flex flex-col gap-2 text-sm font-medium text-slate-200">
              Message
              <textarea
                className="input-shell min-h-36 rounded-[1.5rem] px-4 py-3 outline-none transition"
                onChange={(event) => setChatMessage(event.target.value)}
                placeholder="Hi, I need help scoping and building..."
                value={chatMessage}
              />
            </label>

            {chatError ? (
              <div className="mt-4 rounded-[1.5rem] border border-rose-200/50 bg-rose-950/30 px-4 py-3 text-sm text-rose-300">
                {chatError}
              </div>
            ) : null}

            <button
              className="mt-5 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white shadow-glow transition hover:bg-plum disabled:opacity-70"
              disabled={chatStatus === 'loading'}
              type="submit"
            >
              {chatStatus === 'loading' ? 'Starting chat...' : 'Start chat'}
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
