import crypto from 'crypto';

const PASSWORD_KEY_LENGTH = 64;
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 7;
const DEFAULT_VERIFICATION_MINUTES = 30;

function getVerificationDurationMs() {
  const configuredMinutes = Number(process.env.VERIFICATION_EXPIRES_MINUTES || DEFAULT_VERIFICATION_MINUTES);
  const safeMinutes = Number.isFinite(configuredMinutes) && configuredMinutes > 0
    ? configuredMinutes
    : DEFAULT_VERIFICATION_MINUTES;

  return safeMinutes * 60 * 1000;
}

export function normalizeEmail(email = '') {
  return email.trim().toLowerCase();
}

export function getAdminEmails() {
  const configuredEmails = process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || '';

  return configuredEmails
    .split(',')
    .map((email) => normalizeEmail(email))
    .filter(Boolean);
}

export function isAdminUser(user) {
  return Boolean(user?.email && getAdminEmails().includes(normalizeEmail(user.email)));
}

export function isStrongPassword(password = '') {
  return (
    password.length >= 8 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /\d/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
}

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, PASSWORD_KEY_LENGTH).toString('hex');
  return `${salt}:${derivedKey}`;
}

export function verifyPassword(password, passwordHash) {
  const [salt, storedHash] = passwordHash.split(':');

  if (!salt || !storedHash) {
    return false;
  }

  const computedHash = crypto.scryptSync(password, salt, PASSWORD_KEY_LENGTH).toString('hex');

  if (storedHash.length !== computedHash.length) {
    return false;
  }

  return crypto.timingSafeEqual(Buffer.from(storedHash, 'hex'), Buffer.from(computedHash, 'hex'));
}

export function createRawToken() {
  return crypto.randomBytes(32).toString('hex');
}

export function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function createSessionToken() {
  const token = createRawToken();

  return {
    token,
    tokenHash: hashToken(token),
    expiresAt: new Date(Date.now() + SESSION_DURATION_MS),
  };
}

export function createVerificationToken() {
  const token = createRawToken();

  return {
    token,
    tokenHash: hashToken(token),
    expiresAt: new Date(Date.now() + getVerificationDurationMs()),
  };
}

export function createVerificationChallenge() {
  const token = createRawToken();
  const otp = String(crypto.randomInt(0, 1_000_000)).padStart(6, '0');
  const expiresAt = new Date(Date.now() + getVerificationDurationMs());

  return {
    token,
    tokenHash: hashToken(token),
    otp,
    otpHash: hashToken(otp),
    expiresAt,
  };
}

export function getBearerToken(authorizationHeader = '') {
  if (!authorizationHeader.startsWith('Bearer ')) {
    return '';
  }

  return authorizationHeader.slice(7).trim();
}

export function getPublicUser(user) {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    isVerified: user.isVerified,
    isAdmin: isAdminUser(user),
    createdAt: user.createdAt,
  };
}

export function buildVerificationUrl(token, email = '') {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const searchParams = new URLSearchParams({ token });

  if (email) {
    searchParams.set('email', email);
  }

  return `${frontendUrl.replace(/\/$/, '')}/verify-email?${searchParams.toString()}`;
}
