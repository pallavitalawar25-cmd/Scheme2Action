// Per-user demonstration data (profile, settings, applications, documents, activity, helper session).
// Stored in localStorage under s2a.citizen.<userId>. In production this becomes API calls (GET/PATCH /me/*).
import { readJSON, removeKey, writeJSON } from '../utils/storage';
import { applicationSteps } from '../data/navigation';

const keyFor = (id) => `s2a.citizen.${id}`;
const cache = new Map();
const listeners = new Set();
export const EMPTY = Object.freeze({ empty: true });

const isoDaysAgo = (d) => new Date(Date.now() - d * 86400000).toISOString();

export const defaultSettings = () => ({ notifications: { email: true, sms: false, policy: true }, privacy: { ai: true, helper: true } });
export const blankProfile = (user) => ({ fullName: user?.name || '', phone: '', dateOfBirth: '', gender: '', state: 'Karnataka', district: '', pincode: '', occupation: '' });

export function seedFor(user) {
  const base = { v: 1, profile: blankProfile(user), settings: defaultSettings(), applications: [], documents: [], activity: [{ id: 'a0', type: 'joined', at: new Date().toISOString() }], helperSession: null };
  if (user?.id !== 'demo-citizen') return base;
  return {
    ...base,
    profile: { ...base.profile, dateOfBirth: '2004-06-15', gender: 'female', district: 'Mysuru', pincode: '', occupation: 'student' },
    applications: [
      { id: 'app-1', schemeId: 'ssp-post-matric-scholarship', stage: 2, packetReady: false, startedAt: isoDaysAgo(12), updatedAt: isoDaysAgo(3) },
      { id: 'app-2', schemeId: 'pm-kisan', stage: 0, packetReady: false, startedAt: isoDaysAgo(5), updatedAt: isoDaysAgo(5) },
      { id: 'app-3', schemeId: 'nsp-scholarships', stage: 7, packetReady: true, startedAt: isoDaysAgo(30), updatedAt: isoDaysAgo(9) },
    ],
    documents: [
      { id: 'd1', appId: 'app-1', schemeId: 'ssp-post-matric-scholarship', docKey: 'doc.aadhaar', status: 'uploaded' },
      { id: 'd2', appId: 'app-1', schemeId: 'ssp-post-matric-scholarship', docKey: 'doc.income', status: 'missing' },
      { id: 'd3', appId: 'app-1', schemeId: 'ssp-post-matric-scholarship', docKey: 'doc.marks', status: 'needs-correction' },
      { id: 'd4', appId: 'app-1', schemeId: 'ssp-post-matric-scholarship', docKey: 'doc.admission', status: 'missing' },
      { id: 'd5', appId: 'app-1', schemeId: 'ssp-post-matric-scholarship', docKey: 'doc.bank', status: 'uploaded' },
    ],
    activity: [
      { id: 'a1', type: 'uploaded', schemeId: 'ssp-post-matric-scholarship', docKey: 'doc.bank', at: isoDaysAgo(3) },
      { id: 'a2', type: 'eligibility', schemeId: 'ssp-post-matric-scholarship', at: isoDaysAgo(8) },
      { id: 'a3', type: 'started', schemeId: 'pm-kisan', at: isoDaysAgo(5) },
      { id: 'a4', type: 'started', schemeId: 'ssp-post-matric-scholarship', at: isoDaysAgo(12) },
      { id: 'a5', type: 'joined', at: isoDaysAgo(30) },
    ],
  };
}

export function getData(user) {
  if (!user) return EMPTY;
  if (!cache.has(user.id)) {
    const stored = readJSON(keyFor(user.id), null);
    cache.set(user.id, stored && stored.v === 1 ? stored : seedFor(user));
    if (!stored) writeJSON(keyFor(user.id), cache.get(user.id));
  }
  return cache.get(user.id);
}

export function updateData(user, updater) {
  if (!user) return;
  const next = updater(getData(user));
  cache.set(user.id, next);
  writeJSON(keyFor(user.id), next);
  listeners.forEach((l) => l());
}

export function resetData(user) {
  if (!user) return;
  removeKey(keyFor(user.id));
  cache.delete(user.id);
  listeners.forEach((l) => l());
}

export function clearAllCache() { cache.clear(); listeners.forEach((l) => l()); }
export const subscribe = (l) => { listeners.add(l); return () => listeners.delete(l); };

// ----- derived values (pure) -----
export const PROFILE_FIELDS = ['fullName', 'phone', 'dateOfBirth', 'gender', 'district', 'pincode', 'occupation', 'state'];
export const profileCompleteness = (profile) => Math.round((PROFILE_FIELDS.filter((f) => String(profile?.[f] ?? '').trim()).length / PROFILE_FIELDS.length) * 100);
export const missingProfileFields = (profile) => PROFILE_FIELDS.filter((f) => !String(profile?.[f] ?? '').trim());

export const applicationProgress = (app) => (app.packetReady ? 100 : Math.round((app.stage / (applicationSteps.length - 1)) * 100));

export function summarize(data) {
  const apps = data.applications || [];
  const docs = data.documents || [];
  return {
    active: apps.filter((a) => !a.packetReady).length,
    packets: apps.filter((a) => a.packetReady).length,
    pendingDocs: docs.filter((d) => d.status === 'missing').length,
    pendingCorrections: docs.filter((d) => d.status === 'needs-correction').length,
  };
}
