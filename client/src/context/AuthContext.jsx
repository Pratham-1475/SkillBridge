import { createContext, useContext, useEffect, useState } from 'react';

import {
  clearStoredAuthToken,
  getCurrentUser,
  getStoredAuthToken,
  login as loginRequest,
  logout as logoutRequest,
  resendVerification as resendVerificationRequest,
  setStoredAuthToken,
  signup as signupRequest,
  verifyEmailOtp,
  verifyEmailToken,
} from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authStatus, setAuthStatus] = useState('loading');

  useEffect(() => {
    async function bootstrapSession() {
      const token = getStoredAuthToken();

      if (!token) {
        setAuthStatus('anonymous');
        return;
      }

      try {
        const response = await getCurrentUser();
        setUser(response.user);
        setAuthStatus('authenticated');
      } catch (_error) {
        clearStoredAuthToken();
        setUser(null);
        setAuthStatus('anonymous');
      }
    }

    bootstrapSession();
  }, []);

  async function signup(payload) {
    return signupRequest(payload);
  }

  async function login(payload) {
    const response = await loginRequest(payload);
    setStoredAuthToken(response.token);
    setUser(response.user);
    setAuthStatus('authenticated');
    return response;
  }

  async function logout() {
    try {
      await logoutRequest();
    } catch (_error) {
      // Always clear the client session even if the server token is already gone.
    } finally {
      clearStoredAuthToken();
      setUser(null);
      setAuthStatus('anonymous');
    }
  }

  async function resendVerification(email) {
    return resendVerificationRequest({ email });
  }

  async function verifyEmail(token) {
    const response = await verifyEmailToken(token);
    setStoredAuthToken(response.token);
    setUser(response.user);
    setAuthStatus('authenticated');
    return response;
  }

  async function verifyEmailCode(payload) {
    const response = await verifyEmailOtp(payload);
    setStoredAuthToken(response.token);
    setUser(response.user);
    setAuthStatus('authenticated');
    return response;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        authStatus,
        isAuthenticated: Boolean(user),
        signup,
        login,
        logout,
        resendVerification,
        verifyEmail,
        verifyEmailCode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider.');
  }

  return context;
}
