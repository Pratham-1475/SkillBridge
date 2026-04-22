const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api';
const AUTH_TOKEN_KEY = 'skillbridge_auth_token';

export function getStoredAuthToken() {
  if (typeof window === 'undefined') {
    return '';
  }

  return window.localStorage.getItem(AUTH_TOKEN_KEY) || '';
}

export function setStoredAuthToken(token) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(AUTH_TOKEN_KEY, token);
  }
}

export function clearStoredAuthToken() {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(AUTH_TOKEN_KEY);
  }
}

async function request(path, options = {}) {
  const authToken = getStoredAuthToken();
  const { headers: customHeaders = {}, ...restOptions } = options;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...restOptions,
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...customHeaders,
    },
  });

  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || 'Something went wrong while talking to SkillBridge.');
    Object.assign(error, data);
    throw error;
  }

  return data;
}

function buildQueryString(params = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, value);
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

export function getFreelancers(params) {
  return request(`/freelancers${buildQueryString(params)}`);
}

export function getFreelancer(id) {
  return request(`/freelancers/${id}`);
}

export function createFreelancer(payload) {
  return request('/freelancers', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateFreelancer(id, payload) {
  return request(`/freelancers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function deleteFreelancer(id) {
  return request(`/freelancers/${id}`, {
    method: 'DELETE',
  });
}

export function getMyFreelancerProfile() {
  return request('/freelancers/me/profile');
}

export function createMyFreelancerProfile(payload) {
  return request('/freelancers/me/profile', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateMyFreelancerProfile(payload) {
  return request('/freelancers/me/profile', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function getServices(params) {
  return request(`/services${buildQueryString(params)}`);
}

export function createService(payload) {
  return request('/services', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateService(id, payload) {
  return request(`/services/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function deleteService(id) {
  return request(`/services/${id}`, {
    method: 'DELETE',
  });
}

export function getInquiries() {
  return request('/inquiries');
}

export function createInquiry(payload) {
  return request('/inquiries', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function scopeProject(description) {
  return request('/ai/scope', {
    method: 'POST',
    body: JSON.stringify({ description }),
  });
}

export function signup(payload) {
  return request('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function login(payload) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function logout() {
  return request('/auth/logout', {
    method: 'POST',
  });
}

export function getCurrentUser() {
  return request('/auth/me');
}

export function resendVerification(payload) {
  return request('/auth/resend-verification', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function verifyEmailToken(token) {
  return request(`/auth/verify-email${buildQueryString({ token })}`);
}

export function verifyEmailOtp(payload) {
  return request('/auth/verify-email', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function getChats() {
  return request('/chats');
}

export function startChat(payload) {
  return request('/chats', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function getChatMessages(conversationId) {
  return request(`/chats/${conversationId}/messages`);
}

export function sendChatMessage(conversationId, message) {
  return request(`/chats/${conversationId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ message }),
  });
}
