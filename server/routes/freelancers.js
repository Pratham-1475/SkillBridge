import express from 'express';

import requireAdmin from '../middlewares/requireAdmin.js';
import requireAuth from '../middlewares/requireAuth.js';
import Freelancer from '../models/Freelancer.js';
import Service from '../models/Service.js';
import { isAdminUser } from '../utils/auth.js';

const router = express.Router();

function normalizeSkills(value) {
  if (Array.isArray(value)) {
    return value.map((skill) => String(skill).trim()).filter(Boolean);
  }

  return String(value || '')
    .split(',')
    .map((skill) => skill.trim())
    .filter(Boolean);
}

function normalizeProfilePayload(body, user) {
  return {
    name: user.name,
    ownerUserId: user._id,
    contactEmail: user.email,
    title: body.title?.trim(),
    bio: body.bio?.trim(),
    avatarUrl: body.avatarUrl?.trim(),
    skills: normalizeSkills(body.skills),
    category: body.category?.trim(),
    hourlyRate: Number(body.hourlyRate),
    rating: 4.8,
    reviewCount: 0,
    isSelfPublished: true,
  };
}

router.get('/', async (req, res, next) => {
  try {
    const { category, q, minRating } = req.query;
    const query = {};

    if (category) {
      query.category = category;
    }

    if (minRating) {
      query.rating = { $gte: Number(minRating) || 0 };
    }

    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { title: { $regex: q, $options: 'i' } },
        { bio: { $regex: q, $options: 'i' } },
        { skills: { $elemMatch: { $regex: q, $options: 'i' } } },
      ];
    }

    const freelancers = await Freelancer.find(query).sort({ rating: -1, reviewCount: -1, createdAt: -1 });
    res.json(freelancers);
  } catch (error) {
    next(error);
  }
});

router.get('/me/profile', requireAuth, async (req, res, next) => {
  try {
    const freelancer = await Freelancer.findOne({ ownerUserId: req.user._id });
    res.json({ freelancer });
  } catch (error) {
    next(error);
  }
});

router.post('/me/profile', requireAuth, async (req, res, next) => {
  try {
    const existingProfile = await Freelancer.findOne({ ownerUserId: req.user._id });

    if (existingProfile) {
      return res.status(409).json({ message: 'You already have a freelancer profile. You can edit it instead.' });
    }

    const freelancer = await Freelancer.create(normalizeProfilePayload(req.body, req.user));
    return res.status(201).json(freelancer);
  } catch (error) {
    next(error);
  }
});

router.put('/me/profile', requireAuth, async (req, res, next) => {
  try {
    const freelancer = await Freelancer.findOneAndUpdate(
      { ownerUserId: req.user._id },
      normalizeProfilePayload(req.body, req.user),
      { new: true, runValidators: true },
    );

    if (!freelancer) {
      return res.status(404).json({ message: 'Create your freelancer profile before editing it.' });
    }

    return res.json(freelancer);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const freelancer = await Freelancer.findById(req.params.id);

    if (!freelancer) {
      return res.status(404).json({ message: 'Freelancer not found.' });
    }

    return res.json(freelancer);
  } catch (error) {
    next(error);
  }
});

router.post('/', requireAdmin, async (req, res, next) => {
  try {
    const freelancer = await Freelancer.create(req.body);
    res.status(201).json(freelancer);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', requireAdmin, async (req, res, next) => {
  try {
    const freelancer = await Freelancer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!freelancer) {
      return res.status(404).json({ message: 'Freelancer not found.' });
    }

    return res.json(freelancer);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const freelancer = await Freelancer.findById(req.params.id);

    if (!freelancer) {
      return res.status(404).json({ message: 'Freelancer not found.' });
    }

    const isOwner = freelancer.ownerUserId?.toString() === req.user._id.toString();

    if (!isAdminUser(req.user) && !isOwner) {
      return res.status(403).json({ message: 'You can only delete your own freelancer profile.' });
    }

    await freelancer.deleteOne();
    await Service.deleteMany({ freelancerId: req.params.id });

    return res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
