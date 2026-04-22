import User from '../models/User.js';
import { getBearerToken, hashToken } from '../utils/auth.js';

export default async function requireAuth(req, res, next) {
  try {
    const token = getBearerToken(req.headers.authorization || '');

    if (!token) {
      return res.status(401).json({ message: 'Authentication is required for this action.' });
    }

    const user = await User.findOne({
      sessionTokenHash: hashToken(token),
      sessionExpiresAt: { $gt: new Date() },
    });

    if (!user) {
      return res.status(401).json({ message: 'Your session has expired. Please log in again.' });
    }

    req.user = user;
    return next();
  } catch (error) {
    return next(error);
  }
}
