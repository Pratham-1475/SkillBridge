import express from 'express';

import requireAdmin from '../middlewares/requireAdmin.js';
import Freelancer from '../models/Freelancer.js';
import Inquiry from '../models/Inquiry.js';
import { sendFreelancerInquiryEmail } from '../utils/email.js';
import { getBearerToken, hashToken } from '../utils/auth.js';
import User from '../models/User.js';

const router = express.Router();

async function getOptionalUser(req) {
  const token = getBearerToken(req.headers.authorization || '');

  if (!token) {
    return null;
  }

  return User.findOne({
    sessionTokenHash: hashToken(token),
    sessionExpiresAt: { $gt: new Date() },
  });
}

router.get('/', requireAdmin, async (_req, res, next) => {
  try {
    const inquiries = await Inquiry.find()
      .populate('freelancerId')
      .populate('senderUserId', 'name email')
      .sort({ createdAt: -1 });
    res.json(inquiries);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const user = await getOptionalUser(req);
    let freelancer = null;

    if (req.body.freelancerId) {
      freelancer = await Freelancer.findById(req.body.freelancerId).populate('ownerUserId', 'name email');
    }

    const inquiry = await Inquiry.create({
      name: req.body.name,
      email: req.body.email,
      subject: req.body.subject,
      message: req.body.message,
      freelancerId: freelancer?._id || null,
      freelancerName: freelancer?.name || '',
      senderUserId: user?._id || null,
      emailStatus: freelancer ? 'not_applicable' : 'not_applicable',
    });

    const freelancerEmail = freelancer?.contactEmail
      || freelancer?.ownerUserId?.email
      || process.env.MARKETPLACE_INQUIRY_EMAIL
      || process.env.ADMIN_EMAILS?.split(',')[0]?.trim()
      || process.env.ADMIN_EMAIL
      || '';

    if (freelancer && freelancerEmail) {
      try {
        await sendFreelancerInquiryEmail({
          to: freelancerEmail,
          freelancerName: freelancer.name,
          inquiry,
        });

        inquiry.emailStatus = 'sent';
      } catch (emailError) {
        inquiry.emailStatus = 'failed';
        inquiry.emailError = emailError.message || 'Failed to email freelancer.';
      }

      await inquiry.save();
    }

    res.status(201).json(inquiry);
  } catch (error) {
    next(error);
  }
});

export default router;
