import express from 'express';

import User from '../models/User.js';
import requireAuth from '../middlewares/requireAuth.js';
import { sendVerificationEmail } from '../utils/email.js';
import {
  buildVerificationUrl,
  createVerificationChallenge,
  createSessionToken,
  getPublicUser,
  hashPassword,
  hashToken,
  isStrongPassword,
  normalizeEmail,
  verifyPassword,
} from '../utils/auth.js';

const router = express.Router();

function getVerificationSentMessage(email) {
  return `Verification email sent to ${email}. Open the link in your inbox or enter the 6-digit code.`;
}

async function sendFreshVerification(user) {
  const verification = createVerificationChallenge();
  const verificationUrl = buildVerificationUrl(verification.token, user.email);

  user.verificationTokenHash = verification.tokenHash;
  user.verificationOtpHash = verification.otpHash;
  user.verificationExpiresAt = verification.expiresAt;
  await user.save();

  await sendVerificationEmail({
    to: user.email,
    name: user.name,
    verificationUrl,
    otp: verification.otp,
    expiresAt: verification.expiresAt,
  });

  return verification.expiresAt;
}

async function completeVerification(user) {
  user.isVerified = true;
  user.verificationTokenHash = '';
  user.verificationOtpHash = '';
  user.verificationExpiresAt = null;

  const session = createSessionToken();
  user.sessionTokenHash = session.tokenHash;
  user.sessionExpiresAt = session.expiresAt;
  await user.save();

  return {
    token: session.token,
    user: getPublicUser(user),
  };
}

router.post('/signup', async (req, res, next) => {
  try {
    const name = req.body.name?.trim();
    const email = normalizeEmail(req.body.email);
    const password = req.body.password || '';
    const acceptedTerms = Boolean(req.body.acceptedTerms);

    if (!name || name.length < 2) {
      return res.status(400).json({ message: 'Please provide your full name.' });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address.' });
    }

    if (!acceptedTerms) {
      return res.status(400).json({ message: 'Please accept the marketplace terms to continue.' });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({
        message:
          'Password must be at least 8 characters and include uppercase, lowercase, number, and special character.',
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser?.isVerified) {
      return res.status(409).json({ message: 'An account with that email already exists. Please log in.' });
    }

    const payload = {
      name,
      email,
      passwordHash: hashPassword(password),
      isVerified: false,
      verificationTokenHash: '',
      verificationOtpHash: '',
      verificationExpiresAt: null,
      sessionTokenHash: '',
      sessionExpiresAt: null,
    };

    const user = existingUser
      ? await User.findByIdAndUpdate(existingUser._id, payload, { new: true, runValidators: true })
      : await User.create(payload);

    const verificationExpiresAt = await sendFreshVerification(user);

    return res.status(201).json({
      message: getVerificationSentMessage(user.email),
      user: getPublicUser(user),
      verificationEmail: user.email,
      verificationExpiresAt,
    });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    const password = req.body.password || '';

    const user = await User.findOne({ email });

    if (!user || !verifyPassword(password, user.passwordHash)) {
      return res.status(401).json({ message: 'Incorrect email or password.' });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        message: 'Please verify your email before logging in.',
        needsVerification: true,
        verificationEmail: user.email,
      });
    }

    const session = createSessionToken();
    user.sessionTokenHash = session.tokenHash;
    user.sessionExpiresAt = session.expiresAt;
    await user.save();

    return res.json({
      message: 'Welcome back to SkillBridge.',
      token: session.token,
      user: getPublicUser(user),
    });
  } catch (error) {
    next(error);
  }
});

router.get('/me', requireAuth, async (req, res) => {
  res.json({ user: getPublicUser(req.user) });
});

router.post('/logout', requireAuth, async (req, res, next) => {
  try {
    req.user.sessionTokenHash = '';
    req.user.sessionExpiresAt = null;
    await req.user.save();

    return res.json({ message: 'Logged out successfully.' });
  } catch (error) {
    next(error);
  }
});

router.post('/resend-verification', async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);

    if (!email) {
      return res.status(400).json({ message: 'Email is required to resend verification.' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'No account found for that email.' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'This email address is already verified. Please log in.' });
    }

    const verificationExpiresAt = await sendFreshVerification(user);

    return res.json({
      message: getVerificationSentMessage(user.email),
      verificationEmail: user.email,
      verificationExpiresAt,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/verify-email', async (req, res, next) => {
  try {
    const token = req.query.token?.trim();

    if (!token) {
      return res.status(400).json({ message: 'Verification token is required.' });
    }

    const user = await User.findOne({
      verificationTokenHash: hashToken(token),
      verificationExpiresAt: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Verification link is invalid or expired.' });
    }

    const session = await completeVerification(user);

    return res.json({
      message: 'Email verified successfully.',
      ...session,
    });
  } catch (error) {
    next(error);
  }
});

router.post('/verify-email', async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    const otp = String(req.body.otp || '').replace(/\D/g, '');

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'A valid email address is required.' });
    }

    if (otp.length !== 6) {
      return res.status(400).json({ message: 'Please enter the 6-digit verification code from your email.' });
    }

    const user = await User.findOne({
      email,
      verificationOtpHash: hashToken(otp),
      verificationExpiresAt: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Verification code is invalid or expired.' });
    }

    const session = await completeVerification(user);

    return res.json({
      message: 'Email verified successfully.',
      ...session,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
