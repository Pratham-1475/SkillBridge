import express from 'express';

import requireAuth from '../middlewares/requireAuth.js';
import Freelancer from '../models/Freelancer.js';
import Service from '../models/Service.js';
import { isAdminUser } from '../utils/auth.js';

const router = express.Router();

async function canManageFreelancerServices(user, freelancerId) {
  if (isAdminUser(user)) {
    return true;
  }

  const freelancer = await Freelancer.findById(freelancerId).select('ownerUserId');
  return freelancer?.ownerUserId?.toString() === user._id.toString();
}

router.get('/', async (req, res, next) => {
  try {
    const query = {};

    if (req.query.freelancerId) {
      query.freelancerId = req.query.freelancerId;
    }

    const services = await Service.find(query)
      .populate('freelancerId')
      .sort({ createdAt: -1 });

    res.json(services);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id).populate('freelancerId');

    if (!service) {
      return res.status(404).json({ message: 'Service not found.' });
    }

    return res.json(service);
  } catch (error) {
    next(error);
  }
});

router.post('/', requireAuth, async (req, res, next) => {
  try {
    const canManage = await canManageFreelancerServices(req.user, req.body.freelancerId);

    if (!canManage) {
      return res.status(403).json({ message: 'You can only create services for your own freelancer profile.' });
    }

    const service = await Service.create(req.body);
    const populatedService = await service.populate('freelancerId');
    res.status(201).json(populatedService);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', requireAuth, async (req, res, next) => {
  try {
    const existingService = await Service.findById(req.params.id);

    if (!existingService) {
      return res.status(404).json({ message: 'Service not found.' });
    }

    const canManageExisting = await canManageFreelancerServices(req.user, existingService.freelancerId);
    const targetFreelancerId = req.body.freelancerId || existingService.freelancerId;
    const canManageTarget = await canManageFreelancerServices(req.user, targetFreelancerId);

    if (!canManageExisting || !canManageTarget) {
      return res.status(403).json({ message: 'You can only update services for your own freelancer profile.' });
    }

    const service = await Service.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('freelancerId');

    if (!service) {
      return res.status(404).json({ message: 'Service not found.' });
    }

    return res.json(service);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ message: 'Service not found.' });
    }

    const canManage = await canManageFreelancerServices(req.user, service.freelancerId);

    if (!canManage) {
      return res.status(403).json({ message: 'You can only delete services for your own freelancer profile.' });
    }

    await service.deleteOne();

    return res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
