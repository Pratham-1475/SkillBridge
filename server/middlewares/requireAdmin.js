import { isAdminUser } from '../utils/auth.js';
import requireAuth from './requireAuth.js';

export default function requireAdmin(req, res, next) {
  return requireAuth(req, res, (error) => {
    if (error) {
      return next(error);
    }

    if (!isAdminUser(req.user)) {
      return res.status(403).json({ message: 'Admin access is restricted for this account.' });
    }

    return next();
  });
}
