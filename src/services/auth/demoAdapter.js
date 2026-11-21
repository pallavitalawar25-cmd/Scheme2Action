// DEMO AUTH ADAPTER. NOT SECURE. Accounts, hashes and sessions live in this browser's storage.
// It exists so every screen can be tested without a backend. It must never be used with real passwords or data.
import { AuthError } from './AuthError';
import { hashPassword, randomSalt } from '../../utils/crypto';
import { readJSON, removeKey, writeJSON } from '../../utils/storage';

const ACCOUNTS_KEY = 's2a.demo.accounts';
const SESSION_KEY = 's2a.demo.session';

export const DEMO_IDS = { citizen: 'demo-citizen', admin: 'demo-admin' };
const SEEDED = {
  [DEMO_IDS.citizen]: { id: DEMO_IDS.citizen, name: 'Demo Citizen', email: 'demo.citizen@example.test', username: 'demo.citizen', role: 'citizen' },
  [DEMO_IDS.admin]: { id: DEMO_IDS.admin, name: 'Demo Admin', email: 'demo.admin@example.test', username: 'demo.admin', role: 'admin' },
};

const accounts = () => readJSON(ACCOUNTS_KEY, []);
const saveAccounts = (list) => writeJSON(ACCOUNTS_KEY, list);
const publicUser = (a) => (a ? { id: a.id, name: a.name, email: a.email, username: a.username, role: a.role, demo: true } : null);

const sessionStore = (remember) => (remember ? window.localStorage : window.sessionStorage);
const readSession = () => {
  try { return JSON.parse(window.localStorage.getItem(SESSION_KEY) || window.sessionStorage.getItem(SESSION_KEY) || 'null'); } catch { return null; }
};
const writeSession = (userId, remember) => {
  try { window.localStorage.removeItem(SESSION_KEY); window.sessionStorage.removeItem(SESSION_KEY); sessionStore(remember).setItem(SESSION_KEY, JSON.stringify({ userId })); } catch { /* ignore */ }
};
const findById = (id) => (SEEDED[id] ? SEEDED[id] : accounts().find((a) => a.id === id));

const demoAdapter = {
  mode: 'demo',

  // Synchronous read used for the first render (no loading flash in demo mode).
  peekUser() { const s = readSession(); return s ? publicUser(findById(s.userId)) : null; },
  async getCurrentUser() { return this.peekUser(); },

  async login({ identifier, password, remember = false }) {
    const id = String(identifier || '').trim().toLowerCase();
    const account = accounts().find((a) => a.email.toLowerCase() === id || a.username.toLowerCase() === id);
    // Same error for "no such account" and "wrong password" so existence is not revealed.
    if (!account) throw new AuthError('invalid_credentials');
    const hash = await hashPassword(password, account.salt);
    if (hash !== account.hash) throw new AuthError('invalid_credentials');
    writeSession(account.id, remember);
    return publicUser(account);
  },

  async register({ name, email, username, password }) {
    const list = accounts();
    if (list.some((a) => a.email.toLowerCase() === email.trim().toLowerCase())) throw new AuthError('email_taken');
    if (list.some((a) => a.username.toLowerCase() === username.trim().toLowerCase())) throw new AuthError('username_taken');
    const salt = randomSalt();
    const account = {
      id: `u-${Date.now().toString(36)}-${randomSalt().slice(0, 4)}`,
      name: name.trim(), email: email.trim(), username: username.trim(), role: 'citizen', salt,
      hash: await hashPassword(password, salt), createdAt: new Date().toISOString(),
    };
    saveAccounts([...list, account]);
    writeSession(account.id, true);
    return publicUser(account);
  },

  // Demo shortcut: skips the password entirely. Not available in API mode.
  async quickLogin(role = 'citizen') {
    const seeded = SEEDED[role === 'admin' ? DEMO_IDS.admin : DEMO_IDS.citizen];
    writeSession(seeded.id, false);
    return publicUser(seeded);
  },

  async logout() { removeKey(SESSION_KEY); try { window.sessionStorage.removeItem(SESSION_KEY); } catch { /* ignore */ } },

  // Always resolves the same way so account existence is never revealed. Sends nothing in demo mode.
  async requestPasswordReset() { return { sent: true, demo: true }; },

  async deleteAccount(userId) {
    saveAccounts(accounts().filter((a) => a.id !== userId));
    await this.logout();
  },
};

export default demoAdapter;
