// REAL AUTH ADAPTER for the future FastAPI backend (used automatically when VITE_API_BASE_URL is set).
//
// Expected endpoints (all JSON, session in an httpOnly, Secure, SameSite cookie set by the server):
//   POST /auth/login            { identifier, password, remember }  -> 200 { user }   | 401 invalid credentials
//   POST /auth/register         { name, email, username, password } -> 201 { user }   | 409 { code: 'email_taken' | 'username_taken' }
//   POST /auth/logout           -> 204
//   GET  /auth/me               -> 200 { user } | 401
//   POST /auth/forgot-password  { email } -> 202 (always, to avoid revealing which emails exist)
//   DELETE /auth/account        -> 204
// A user is { id, name, email, username, role: 'citizen' | 'admin' }.
// The server must hash passwords (argon2/bcrypt), rate-limit login, and enforce roles on every admin route.
import { ApiError, apiRequest } from '../api';
import { AuthError } from './AuthError';

const wrap = async (fn) => {
  try { return await fn(); } catch (e) {
    if (e instanceof AuthError) throw e;
    if (e instanceof ApiError) {
      if (e.status === 401) throw new AuthError('invalid_credentials');
      if (e.status === 409 && (e.code === 'email_taken' || e.code === 'username_taken')) throw new AuthError(e.code);
      throw new AuthError('unknown', e.message);
    }
    throw new AuthError('network', e.message);
  }
};

const apiAdapter = {
  mode: 'api',
  // No peekUser: the first render shows a loading state until /auth/me answers.
  async getCurrentUser() {
    try { return (await apiRequest('/auth/me'))?.user ?? null; } catch (e) { if (e instanceof ApiError && e.status === 401) return null; throw e; }
  },
  login: (creds) => wrap(async () => (await apiRequest('/auth/login', { method: 'POST', body: creds })).user),
  register: (data) => wrap(async () => (await apiRequest('/auth/register', { method: 'POST', body: data })).user),
  logout: () => wrap(() => apiRequest('/auth/logout', { method: 'POST' })),
  requestPasswordReset: (email) => wrap(async () => { await apiRequest('/auth/forgot-password', { method: 'POST', body: { email } }); return { sent: true }; }),
  deleteAccount: () => wrap(() => apiRequest('/auth/account', { method: 'DELETE' })),
  quickLogin: undefined, // never available against a real backend
};

export default apiAdapter;
