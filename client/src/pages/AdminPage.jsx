import { useEffect, useState } from 'react';

import {
  createFreelancer,
  createService,
  deleteFreelancer,
  deleteService,
  getFreelancers,
  getInquiries,
  getServices,
  updateFreelancer,
  updateService,
} from '../services/api.js';

const EMPTY_FREELANCER_FORM = {
  name: '',
  contactEmail: '',
  title: '',
  bio: '',
  avatarUrl: '',
  skills: '',
  category: '',
  hourlyRate: '',
  rating: '4.8',
  reviewCount: '0',
};

const EMPTY_SERVICE_FORM = {
  freelancerId: '',
  title: '',
  description: '',
  price: '',
  deliveryDays: '',
  category: '',
};

function normalizeFreelancerPayload(form) {
  return {
    name: form.name.trim(),
    contactEmail: form.contactEmail.trim(),
    title: form.title.trim(),
    bio: form.bio.trim(),
    avatarUrl: form.avatarUrl.trim(),
    skills: form.skills
      .split(',')
      .map((skill) => skill.trim())
      .filter(Boolean),
    category: form.category.trim(),
    hourlyRate: Number(form.hourlyRate),
    rating: Number(form.rating),
    reviewCount: Number(form.reviewCount),
  };
}

function normalizeServicePayload(form) {
  return {
    freelancerId: form.freelancerId,
    title: form.title.trim(),
    description: form.description.trim(),
    price: Number(form.price),
    deliveryDays: Number(form.deliveryDays),
    category: form.category.trim(),
  };
}

export default function AdminPage() {
  const [freelancers, setFreelancers] = useState([]);
  const [services, setServices] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [freelancerForm, setFreelancerForm] = useState(EMPTY_FREELANCER_FORM);
  const [serviceForm, setServiceForm] = useState(EMPTY_SERVICE_FORM);
  const [editingFreelancerId, setEditingFreelancerId] = useState('');
  const [editingServiceId, setEditingServiceId] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  async function loadAdminData() {
    setLoading(true);
    setError('');

    try {
      const [freelancerData, serviceData, inquiryData] = await Promise.all([
        getFreelancers(),
        getServices(),
        getInquiries(),
      ]);

      setFreelancers(freelancerData);
      setServices(serviceData);
      setInquiries(inquiryData);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAdminData();
  }, []);

  function updateFreelancerField(field, value) {
    setFreelancerForm((current) => ({ ...current, [field]: value }));
  }

  function updateServiceField(field, value) {
    setServiceForm((current) => ({ ...current, [field]: value }));
  }

  async function handleFreelancerSubmit(event) {
    event.preventDefault();
    setStatusMessage('');
    setError('');

    try {
      const payload = normalizeFreelancerPayload(freelancerForm);

      if (editingFreelancerId) {
        await updateFreelancer(editingFreelancerId, payload);
        setStatusMessage('Freelancer updated.');
      } else {
        await createFreelancer(payload);
        setStatusMessage('Freelancer created.');
      }

      setFreelancerForm(EMPTY_FREELANCER_FORM);
      setEditingFreelancerId('');
      await loadAdminData();
    } catch (submitError) {
      setError(submitError.message);
    }
  }

  async function handleServiceSubmit(event) {
    event.preventDefault();
    setStatusMessage('');
    setError('');

    try {
      const payload = normalizeServicePayload(serviceForm);

      if (editingServiceId) {
        await updateService(editingServiceId, payload);
        setStatusMessage('Service updated.');
      } else {
        await createService(payload);
        setStatusMessage('Service created.');
      }

      setServiceForm(EMPTY_SERVICE_FORM);
      setEditingServiceId('');
      await loadAdminData();
    } catch (submitError) {
      setError(submitError.message);
    }
  }

  async function handleFreelancerDelete(id) {
    if (!window.confirm('Delete this freelancer and their related services?')) {
      return;
    }

    try {
      await deleteFreelancer(id);
      setStatusMessage('Freelancer deleted.');
      await loadAdminData();
    } catch (deleteError) {
      setError(deleteError.message);
    }
  }

  async function handleServiceDelete(id) {
    if (!window.confirm('Delete this service?')) {
      return;
    }

    try {
      await deleteService(id);
      setStatusMessage('Service deleted.');
      await loadAdminData();
    } catch (deleteError) {
      setError(deleteError.message);
    }
  }

  function startFreelancerEdit(freelancer) {
    setEditingFreelancerId(freelancer._id);
    setFreelancerForm({
      name: freelancer.name,
      contactEmail: freelancer.contactEmail || '',
      title: freelancer.title,
      bio: freelancer.bio,
      avatarUrl: freelancer.avatarUrl,
      skills: freelancer.skills.join(', '),
      category: freelancer.category,
      hourlyRate: String(freelancer.hourlyRate),
      rating: String(freelancer.rating),
      reviewCount: String(freelancer.reviewCount),
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function startServiceEdit(service) {
    setEditingServiceId(service._id);
    setServiceForm({
      freelancerId: service.freelancerId?._id ?? service.freelancerId,
      title: service.title,
      description: service.description,
      price: String(service.price),
      deliveryDays: String(service.deliveryDays),
      category: service.category,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="space-y-8">
      <section className="fade-up rounded-[2.5rem] bg-ink p-8 text-white shadow-glow sm:p-10">
        <p className="text-xs uppercase tracking-[0.35em] text-white/60">Admin</p>
        <h1 className="mt-4 font-display text-5xl">Marketplace control center</h1>
        <p className="mt-5 max-w-3xl text-base leading-8 text-slate-300">
          Manage freelancers, services, and inquiries from one place. CRUD actions write directly to MongoDB through
          the REST API.
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

      <section className="grid gap-6 xl:grid-cols-2">
        <form className="fade-up glass-panel rounded-[2rem] p-6" onSubmit={handleFreelancerSubmit}>
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-accent/75">Freelancers</p>
              <h2 className="mt-2 font-display text-3xl text-ink">
                {editingFreelancerId ? 'Edit freelancer' : 'Create freelancer'}
              </h2>
            </div>
            {editingFreelancerId ? (
              <button
                className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-accent hover:text-accent"
                onClick={() => {
                  setEditingFreelancerId('');
                  setFreelancerForm(EMPTY_FREELANCER_FORM);
                }}
                type="button"
              >
                Reset
              </button>
            ) : null}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <input className="rounded-2xl border border-slate-200 px-4 py-3" onChange={(event) => updateFreelancerField('name', event.target.value)} placeholder="Name" value={freelancerForm.name} />
            <input className="rounded-2xl border border-slate-200 px-4 py-3" onChange={(event) => updateFreelancerField('title', event.target.value)} placeholder="Title" value={freelancerForm.title} />
            <input className="rounded-2xl border border-slate-200 px-4 py-3 md:col-span-2" onChange={(event) => updateFreelancerField('contactEmail', event.target.value)} placeholder="Freelancer contact email" type="email" value={freelancerForm.contactEmail} />
            <input className="rounded-2xl border border-slate-200 px-4 py-3 md:col-span-2" onChange={(event) => updateFreelancerField('avatarUrl', event.target.value)} placeholder="Avatar URL" value={freelancerForm.avatarUrl} />
            <textarea className="min-h-28 rounded-[1.5rem] border border-slate-200 px-4 py-3 md:col-span-2" onChange={(event) => updateFreelancerField('bio', event.target.value)} placeholder="Bio" value={freelancerForm.bio} />
            <input className="rounded-2xl border border-slate-200 px-4 py-3 md:col-span-2" onChange={(event) => updateFreelancerField('skills', event.target.value)} placeholder="Skills (comma separated)" value={freelancerForm.skills} />
            <input className="rounded-2xl border border-slate-200 px-4 py-3" onChange={(event) => updateFreelancerField('category', event.target.value)} placeholder="Category" value={freelancerForm.category} />
            <input className="rounded-2xl border border-slate-200 px-4 py-3" min="0" onChange={(event) => updateFreelancerField('hourlyRate', event.target.value)} placeholder="Hourly rate" type="number" value={freelancerForm.hourlyRate} />
            <input className="rounded-2xl border border-slate-200 px-4 py-3" max="5" min="0" onChange={(event) => updateFreelancerField('rating', event.target.value)} placeholder="Rating" step="0.1" type="number" value={freelancerForm.rating} />
            <input className="rounded-2xl border border-slate-200 px-4 py-3" min="0" onChange={(event) => updateFreelancerField('reviewCount', event.target.value)} placeholder="Review count" type="number" value={freelancerForm.reviewCount} />
          </div>

          <button className="mt-5 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white shadow-glow transition hover:bg-plum" type="submit">
            {editingFreelancerId ? 'Update freelancer' : 'Create freelancer'}
          </button>
        </form>

        <form className="fade-up glass-panel rounded-[2rem] p-6" onSubmit={handleServiceSubmit} style={{ animationDelay: '0.08s' }}>
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-accent/75">Services</p>
              <h2 className="mt-2 font-display text-3xl text-ink">{editingServiceId ? 'Edit service' : 'Create service'}</h2>
            </div>
            {editingServiceId ? (
              <button
                className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-accent hover:text-accent"
                onClick={() => {
                  setEditingServiceId('');
                  setServiceForm(EMPTY_SERVICE_FORM);
                }}
                type="button"
              >
                Reset
              </button>
            ) : null}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <select className="rounded-2xl border border-slate-200 px-4 py-3 md:col-span-2" onChange={(event) => updateServiceField('freelancerId', event.target.value)} value={serviceForm.freelancerId}>
              <option value="">Select freelancer</option>
              {freelancers.map((freelancer) => (
                <option key={freelancer._id} value={freelancer._id}>
                  {freelancer.name}
                </option>
              ))}
            </select>
            <input className="rounded-2xl border border-slate-200 px-4 py-3 md:col-span-2" onChange={(event) => updateServiceField('title', event.target.value)} placeholder="Service title" value={serviceForm.title} />
            <textarea className="min-h-28 rounded-[1.5rem] border border-slate-200 px-4 py-3 md:col-span-2" onChange={(event) => updateServiceField('description', event.target.value)} placeholder="Service description" value={serviceForm.description} />
            <input className="rounded-2xl border border-slate-200 px-4 py-3" onChange={(event) => updateServiceField('category', event.target.value)} placeholder="Category" value={serviceForm.category} />
            <input className="rounded-2xl border border-slate-200 px-4 py-3" min="0" onChange={(event) => updateServiceField('price', event.target.value)} placeholder="Price" type="number" value={serviceForm.price} />
            <input className="rounded-2xl border border-slate-200 px-4 py-3 md:col-span-2" min="1" onChange={(event) => updateServiceField('deliveryDays', event.target.value)} placeholder="Delivery days" type="number" value={serviceForm.deliveryDays} />
          </div>

          <button className="mt-5 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white shadow-glow transition hover:bg-plum" type="submit">
            {editingServiceId ? 'Update service' : 'Create service'}
          </button>
        </form>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.54fr_0.46fr]">
        <div className="space-y-6">
          <div className="fade-up glass-panel rounded-[2rem] p-6" style={{ animationDelay: '0.12s' }}>
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-accent/75">Freelancer table</p>
                <h2 className="mt-2 font-display text-3xl text-ink">{loading ? 'Loading...' : freelancers.length} freelancers</h2>
              </div>
            </div>

            <div className="space-y-3">
              {freelancers.map((freelancer) => (
                <article key={freelancer._id} className="rounded-[1.5rem] border border-slate-200 bg-white/80 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h3 className="font-display text-xl text-ink">{freelancer.name}</h3>
                      <p className="mt-1 text-sm text-slate-600">{freelancer.title}</p>
                      <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-500">{freelancer.category}</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-accent hover:text-accent" onClick={() => startFreelancerEdit(freelancer)} type="button">
                        Edit
                      </button>
                      <button className="rounded-full border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-500 transition hover:bg-rose-50" onClick={() => handleFreelancerDelete(freelancer._id)} type="button">
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="fade-up glass-panel rounded-[2rem] p-6" style={{ animationDelay: '0.18s' }}>
            <div className="mb-4">
              <p className="text-xs uppercase tracking-[0.25em] text-accent/75">Inquiries</p>
              <h2 className="mt-2 font-display text-3xl text-ink">{inquiries.length} stored leads</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="px-3 py-3 font-medium">Name</th>
                    <th className="px-3 py-3 font-medium">Email</th>
                    <th className="px-3 py-3 font-medium">Subject</th>
                  </tr>
                </thead>
                <tbody>
                  {inquiries.map((inquiry) => (
                    <tr key={inquiry._id} className="border-b border-slate-100 text-slate-700">
                      <td className="px-3 py-3">{inquiry.name}</td>
                      <td className="px-3 py-3">{inquiry.email}</td>
                      <td className="px-3 py-3">{inquiry.subject}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="fade-up glass-panel rounded-[2rem] p-6" style={{ animationDelay: '0.16s' }}>
          <div className="mb-4">
            <p className="text-xs uppercase tracking-[0.25em] text-accent/75">Service table</p>
            <h2 className="mt-2 font-display text-3xl text-ink">{services.length} services</h2>
          </div>

          <div className="space-y-3">
            {services.map((service) => (
              <article key={service._id} className="rounded-[1.5rem] border border-slate-200 bg-white/80 p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="font-display text-xl text-ink">{service.title}</h3>
                    <p className="mt-1 text-sm text-slate-600">
                      {service.freelancerId?.name || 'Unassigned'} • {service.category}
                    </p>
                    <p className="mt-2 text-sm text-slate-500">
                      ${service.price} • {service.deliveryDays} days
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-accent hover:text-accent" onClick={() => startServiceEdit(service)} type="button">
                      Edit
                    </button>
                    <button className="rounded-full border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-500 transition hover:bg-rose-50" onClick={() => handleServiceDelete(service._id)} type="button">
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
