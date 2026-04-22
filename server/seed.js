import 'dotenv/config';

import Freelancer from './models/Freelancer.js';
import Inquiry from './models/Inquiry.js';
import Service from './models/Service.js';
import { connectToDatabase } from './utils/db.js';

const demoContactEmail = process.env.MARKETPLACE_INQUIRY_EMAIL
  || process.env.ADMIN_EMAILS?.split(',')[0]?.trim()
  || process.env.ADMIN_EMAIL
  || 'freelancer@example.com';

const freelancers = [
  {
    name: 'Ava Thompson',
    contactEmail: demoContactEmail,
    title: 'Product-Focused Full-Stack Engineer',
    bio: 'Builds conversion-friendly SaaS products with polished React frontends and scalable Node backends.',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80',
    skills: ['React', 'Node.js', 'Express', 'MongoDB', 'Stripe', 'Tailwind CSS'],
    category: 'Web Development',
    hourlyRate: 72,
    rating: 4.9,
    reviewCount: 38,
  },
  {
    name: 'Noah Patel',
    contactEmail: demoContactEmail,
    title: 'Mobile Commerce Specialist',
    bio: 'Ships high-retention mobile apps for marketplaces, food delivery, and logistics teams.',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80',
    skills: ['React Native', 'Expo', 'Firebase', 'Maps API', 'Node.js', 'MongoDB'],
    category: 'Mobile Apps',
    hourlyRate: 84,
    rating: 4.8,
    reviewCount: 29,
  },
  {
    name: 'Maya Chen',
    contactEmail: demoContactEmail,
    title: 'UX Designer for Trust-Critical Products',
    bio: 'Designs seamless booking, fintech, and healthcare experiences with a strong research backbone.',
    avatarUrl: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=80',
    skills: ['Figma', 'UX Research', 'Design Systems', 'Prototyping', 'Accessibility'],
    category: 'UI/UX Design',
    hourlyRate: 66,
    rating: 4.95,
    reviewCount: 41,
  },
  {
    name: 'Diego Ramirez',
    contactEmail: demoContactEmail,
    title: 'AI Automation Engineer',
    bio: 'Connects GPT workflows, vector search, and custom dashboards so teams can ship AI features quickly.',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=900&q=80',
    skills: ['OpenAI', 'Python', 'Node.js', 'Vector Databases', 'LangChain', 'Automation'],
    category: 'AI & Automation',
    hourlyRate: 96,
    rating: 4.92,
    reviewCount: 24,
  },
  {
    name: 'Leila Hassan',
    contactEmail: demoContactEmail,
    title: 'Marketplace Operations Engineer',
    bio: 'Builds resilient admin panels, payout systems, and analytics pipelines for service marketplaces.',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=900&q=80',
    skills: ['React', 'Express', 'MongoDB', 'Admin Dashboards', 'Analytics', 'Charting'],
    category: 'Marketplace Systems',
    hourlyRate: 78,
    rating: 4.87,
    reviewCount: 33,
  },
  {
    name: 'Ethan Walker',
    contactEmail: demoContactEmail,
    title: 'Cloud & DevOps Consultant',
    bio: 'Hardens deployments, CI/CD pipelines, monitoring, and infrastructure for growth-stage product teams.',
    avatarUrl: 'https://images.unsplash.com/photo-1504257432389-52343af06ae3?auto=format&fit=crop&w=900&q=80',
    skills: ['AWS', 'Docker', 'CI/CD', 'NGINX', 'Monitoring', 'Security'],
    category: 'DevOps',
    hourlyRate: 88,
    rating: 4.76,
    reviewCount: 19,
  },
];

const inquirySeeds = [
  {
    name: 'Jordan Blake',
    email: 'jordan@example.com',
    subject: 'Need a white-label marketplace MVP',
    message: 'Looking for a team to launch a freelancer marketplace in eight weeks.',
  },
  {
    name: 'Rhea Kapoor',
    email: 'rhea@example.com',
    subject: 'Food delivery app estimate',
    message: 'Need mobile apps, vendor dashboard, and rider tracking with a realistic budget.',
  },
];

const serviceSeeds = (freelancerDocs) => [
  {
    freelancerId: freelancerDocs.find((freelancer) => freelancer.name === 'Ava Thompson')._id,
    title: 'Full-stack marketplace MVP',
    description: 'A polished React + Node MVP with auth, dashboards, messaging, and payments.',
    price: 5200,
    deliveryDays: 28,
    category: 'Web Development',
  },
  {
    freelancerId: freelancerDocs.find((freelancer) => freelancer.name === 'Noah Patel')._id,
    title: 'Delivery app for iOS and Android',
    description: 'Cross-platform customer app with live order tracking and merchant integrations.',
    price: 6400,
    deliveryDays: 35,
    category: 'Mobile Apps',
  },
  {
    freelancerId: freelancerDocs.find((freelancer) => freelancer.name === 'Maya Chen')._id,
    title: 'End-to-end product UX sprint',
    description: 'Research, wireframes, UI kit, and high-fidelity prototypes for launch-ready teams.',
    price: 2400,
    deliveryDays: 10,
    category: 'UI/UX Design',
  },
  {
    freelancerId: freelancerDocs.find((freelancer) => freelancer.name === 'Diego Ramirez')._id,
    title: 'AI scoping and workflow assistant',
    description: 'Structured AI recommendations, prompt design, and automations connected to your stack.',
    price: 3100,
    deliveryDays: 14,
    category: 'AI & Automation',
  },
  {
    freelancerId: freelancerDocs.find((freelancer) => freelancer.name === 'Leila Hassan')._id,
    title: 'Marketplace admin and analytics suite',
    description: 'Powerful admin surfaces for operations, performance tracking, and inquiry handling.',
    price: 4200,
    deliveryDays: 21,
    category: 'Marketplace Systems',
  },
  {
    freelancerId: freelancerDocs.find((freelancer) => freelancer.name === 'Ethan Walker')._id,
    title: 'Production deployment hardening',
    description: 'CI/CD, observability, security headers, and cloud rollout support for launch readiness.',
    price: 2700,
    deliveryDays: 12,
    category: 'DevOps',
  },
];

async function seedDatabase() {
  await connectToDatabase(process.env.MONGO_URI);

  await Promise.all([
    Freelancer.deleteMany({}),
    Service.deleteMany({}),
    Inquiry.deleteMany({}),
  ]);

  const freelancerDocs = await Freelancer.insertMany(freelancers);
  await Service.insertMany(serviceSeeds(freelancerDocs));
  await Inquiry.insertMany(inquirySeeds);

  console.log(`Seeded ${freelancerDocs.length} freelancers.`);
  process.exit(0);
}

seedDatabase().catch((error) => {
  console.error('Failed to seed SkillBridge:', error);
  process.exit(1);
});
