import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { useAuth } from '../context/AuthContext.jsx';
import {
  createMyFreelancerProfile,
  createService,
  deleteService,
  getMyFreelancerProfile,
  getServices,
  updateMyFreelancerProfile,
  updateService,
} from '../services/api.js';

const EMPTY_PROFILE_FORM = {
  title: '',
  bio: '',
  avatarUrl: '',
  skills: '',
  category: '',
  hourlyRate: '',
};

const EMPTY_SERVICE_FORM = {
  title: '',
  description: '',
  price: '',
  deliveryDays: '',
  category: '',
};

function profileToForm(freelancer) {
  if (!freelancer) {
    return EMPTY_PROFILE_FORM;
  }

  return {
    title: freelancer.title || '',
    bio: freelancer.bio || '',
    avatarUrl: freelancer.avatarUrl || '',
    skills: freelancer.skills?.join(', ') || '',
    category: freelancer.category || '',
    hourlyRate: String(freelancer.hourlyRate || ''),
  };
}

function normalizeProfilePayload(form) {
  return {
    ...form,
    skills: form.skills
      .split(',')
      .map((skill) => skill.trim())
      .filter(Boolean),
    hourlyRate: Number(form.hourlyRate),
  };
}

function normalizeServicePayload(form, freelancerId) {
  return {
    freelancerId,
    title: form.title.trim(),
    description: form.description.trim(),
    price: Number(form.price),
    deliveryDays: Number(form.deliveryDays),
    category: form.category.trim(),
  };
}

export default function MyFreelancerProfilePage() {
  const { user } = useAuth();
  const [freelancer, setFreelancer] = useState(null);
  const [services, setServices] = useState([]);
  const [profileForm, setProfileForm] = useState(EMPTY_PROFILE_FORM);
  const [serviceForm, setServiceForm] = useState(EMPTY_SERVICE_FORM);
  const [editingServiceId, setEditingServiceId] = useState('');
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState('');

  async function loadProfile() {
    setLoading(true);
    setError('');

    try {
      const response = await getMyFreelancerProfile();
      setFreelancer(response.freelancer);
      setProfileForm(profileToForm(response.freelancer));

      if (response.freelancer?._id) {
        const serviceData = await getServices({ freelancerId: response.freelancer._id });
        setServices(serviceData);
      } else {
        setServices([]);
      }
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProfile();
  }, []);

  function updateProfileField(field, value) {
    setProfileForm((current) => ({ ...current, [field]: value }));
  }

  function updateServiceField(field, value) {
    setServiceForm((current) => ({ ...current, [field]: value }));
  }

  async function handleProfileSubmit(event) {
    event.preventDefault();
    setStatusMessage('');
    setError('');

    try {
      const payload = normalizeProfilePayload(profileForm);
      const saved = freelancer
        ? await updateMyFreelancerProfile(payload)
        : await createMyFreelancerProfile(payload);

      setFreelancer(saved);
      setProfileForm(profileToForm(saved));
      setStatusMessage(freelancer ? 'Your freelancer profile was updated.' : 'Your freelancer profile is now live.');

      const serviceData = await getServices({ freelancerId: saved._id });
      setServices(serviceData);
    } catch (submitError) {
      setError(submitError.message);
    }
  }

  async function handleServiceSubmit(event) {
    event.preventDefault();
    setStatusMessage('');
    setError('');

    if (!freelancer?._id) {
      setError('Create your freelancer profile before adding services.');
      return;
    }

    try {
      const payload = normalizeServicePayload(serviceForm, freelancer._id);

      if (editingServiceId) {
        await updateService(editingServiceId, payload);
        setStatusMessage('Service updated.');
      } else {
        await createService(payload);
        setStatusMessage('Service created.');
      }

      setServiceForm(EMPTY_SERVICE_FORM);
      setEditingServiceId('');
      setServices(await getServices({ freelancerId: freelancer._id }));
    } catch (submitError) {
      setError(submitError.message);
    }
  }

  async function handleDeleteService(serviceId) {
    if (!window.confirm('Delete this service package?')) {
      return;
    }

    try {
      await deleteService(serviceId);
      setStatusMessage('Service deleted.');
      setServices(await getServices({ freelancerId: freelancer._id }));
    } catch (deleteError) {
      setError(deleteError.message);
    }
  }

  function startServiceEdit(service) {
    setEditingServiceId(service._id);
    setServiceForm({
      title: service.title,
      description: service.description,
      price: String(service.price),
      deliveryDays: String(service.deliveryDays),
      category: service.category,
    });
  }

  return (
    <div className="space-y-8">
      <section className="fade-up rounded-[2.5rem] bg-ink p-8 text-white shadow-glow sm:p-10">
        <p className="text-xs uppercase tracking-[0.35em] text-white/60">Freelancer profile</p>
        <h1 className="mt-4 font-display text-5xl">Post yourself on SkillBridge</h1>
        <p className="mt-5 max-w-3xl text-base leading-8 text-slate-300">
          Your account can own one freelancer profile. The public profile uses your verified account name and email, so
          clients contact the real profile owner.
        </p>
      </section>

      {statusMessage ? (
        <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">
          {statusMessage}
        </div>
      ) : null}

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
      ) : (
        <section className="grid gap-6 xl:grid-cols-[0.55fr_0.45fr]">
          <form className="glass-panel rounded-[2rem] p-6" onSubmit={handleProfileSubmit}>
            <div className="mb-6">
              <p className="text-xs uppercase tracking-[0.3em] text-accent/75">Public listing</p>
              <h2 className="mt-3 font-display text-3xl text-ink">
                {freelancer ? 'Edit your profile' : 'Create your profile'}
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Locked identity: {user?.name} / {user?.email}
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <input
                className="rounded-2xl border border-slate-200 px-4 py-3"
                onChange={(event) => updateProfileField('title', event.target.value)}
                placeholder="Professional title"
                value={profileForm.title}
              />
              <input
                className="rounded-2xl border border-slate-200 px-4 py-3"
                onChange={(event) => updateProfileField('category', event.target.value)}
                placeholder="Category"
                value={profileForm.category}
              />
              <input
                className="rounded-2xl border border-slate-200 px-4 py-3 md:col-span-2"
                onChange={(event) => updateProfileField('avatarUrl', event.target.value)}
                placeholder="Avatar image URL"
                value={profileForm.avatarUrl}
              />
              <textarea
                className="min-h-32 rounded-[1.5rem] border border-slate-200 px-4 py-3 md:col-span-2"
                onChange={(event) => updateProfileField('bio', event.target.value)}
                placeholder="Short bio"
                value={profileForm.bio}
              />
              <input
                className="rounded-2xl border border-slate-200 px-4 py-3 md:col-span-2"
                onChange={(event) => updateProfileField('skills', event.target.value)}
                placeholder="Skills, comma separated"
                value={profileForm.skills}
              />
              <input
                className="rounded-2xl border border-slate-200 px-4 py-3"
                min="0"
                onChange={(event) => updateProfileField('hourlyRate', event.target.value)}
                placeholder="Hourly rate"
                type="number"
                value={profileForm.hourlyRate}
              />
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button className="rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white shadow-glow transition hover:bg-plum" type="submit">
                {freelancer ? 'Update profile' : 'Publish profile'}
              </button>
              {freelancer ? (
                <Link className="rounded-full border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-accent hover:text-white" to={`/freelancer/${freelancer._id}`}>
                  View public profile
                </Link>
              ) : null}
            </div>
          </form>

          <form className="glass-panel rounded-[2rem] p-6" onSubmit={handleServiceSubmit}>
            <div className="mb-6">
              <p className="text-xs uppercase tracking-[0.3em] text-accent/75">Services</p>
              <h2 className="mt-3 font-display text-3xl text-ink">
                {editingServiceId ? 'Edit service' : 'Add service package'}
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Services are attached only to your own freelancer profile.
              </p>
            </div>

            <div className="grid gap-4">
              <input className="rounded-2xl border border-slate-200 px-4 py-3" onChange={(event) => updateServiceField('title', event.target.value)} placeholder="Service title" value={serviceForm.title} />
              <textarea className="min-h-28 rounded-[1.5rem] border border-slate-200 px-4 py-3" onChange={(event) => updateServiceField('description', event.target.value)} placeholder="Service description" value={serviceForm.description} />
              <input className="rounded-2xl border border-slate-200 px-4 py-3" onChange={(event) => updateServiceField('category', event.target.value)} placeholder="Category" value={serviceForm.category} />
              <div className="grid gap-4 md:grid-cols-2">
                <input className="rounded-2xl border border-slate-200 px-4 py-3" min="0" onChange={(event) => updateServiceField('price', event.target.value)} placeholder="Price" type="number" value={serviceForm.price} />
                <input className="rounded-2xl border border-slate-200 px-4 py-3" min="1" onChange={(event) => updateServiceField('deliveryDays', event.target.value)} placeholder="Delivery days" type="number" value={serviceForm.deliveryDays} />
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button className="rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white shadow-glow transition hover:bg-plum disabled:opacity-60" disabled={!freelancer} type="submit">
                {editingServiceId ? 'Update service' : 'Create service'}
              </button>
              {editingServiceId ? (
                <button
                  className="rounded-full border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-accent hover:text-white"
                  onClick={() => {
                    setEditingServiceId('');
                    setServiceForm(EMPTY_SERVICE_FORM);
                  }}
                  type="button"
                >
                  Cancel edit
                </button>
              ) : null}
            </div>
          </form>
        </section>
      )}

      {freelancer ? (
        <section className="glass-panel rounded-[2rem] p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-accent/75">Your service table</p>
          <h2 className="mt-3 font-display text-3xl text-ink">{services.length} services</h2>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {services.map((service) => (
              <article key={service._id} className="rounded-[1.5rem] border border-slate-800 bg-slate-950/70 p-4">
                <h3 className="font-display text-xl text-ink">{service.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">{service.description}</p>
                <p className="mt-3 text-sm text-slate-400">
                  ${service.price} / {service.deliveryDays} days / {service.category}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button className="rounded-full border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-accent hover:text-white" onClick={() => startServiceEdit(service)} type="button">
                    Edit
                  </button>
                  <button className="rounded-full border border-rose-500/40 px-4 py-2 text-sm font-semibold text-rose-300 transition hover:bg-rose-950/30" onClick={() => handleDeleteService(service._id)} type="button">
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
