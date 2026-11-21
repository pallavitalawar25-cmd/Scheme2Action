// Pure validators. Each returns a translation key for the error, or null when valid.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const USERNAME = /^[a-zA-Z0-9._]{3,20}$/;

export const required = (v) => (String(v ?? '').trim() ? null : 'v.required');
export const fullName = (v) => (String(v ?? '').trim().length >= 2 ? null : 'v.name');
export const email = (v) => (EMAIL.test(String(v ?? '').trim()) ? null : 'v.email');
export const username = (v) => (USERNAME.test(String(v ?? '').trim()) ? null : 'v.username');
export const password = (v) => {
  const s = String(v ?? '');
  if (s.length < 8) return 'v.passwordLen';
  if (!/[A-Za-z]/.test(s) || !/\d/.test(s)) return 'v.passwordMix';
  return null;
};
export const matches = (other) => (v) => (v === other ? null : 'v.match');
export const checked = (v) => (v ? null : 'v.consent');
export const optionalPhone = (v) => (!v || /^[6-9]\d{9}$/.test(String(v).trim()) ? null : 'v.phone');
export const optionalPincode = (v) => (!v || /^\d{6}$/.test(String(v).trim()) ? null : 'v.pincode');
export const optionalPastDate = (v) => {
  if (!v) return null;
  const d = new Date(v);
  const now = new Date();
  return Number.isNaN(d.getTime()) || d > now || d.getFullYear() < 1900 ? 'v.date' : null;
};

// 0 = empty, 1 = weak, 2 = fair, 3 = strong
export function passwordStrength(v) {
  const s = String(v ?? '');
  if (!s) return 0;
  let score = 0;
  if (s.length >= 8) score += 1;
  if (/[A-Za-z]/.test(s) && /\d/.test(s)) score += 1;
  if (s.length >= 12 || (/[a-z]/.test(s) && /[A-Z]/.test(s) && /[^A-Za-z0-9]/.test(s))) score += 1;
  return Math.max(1, score);
}

export const firstError = (checks) => {
  for (const key of Object.keys(checks)) if (checks[key]) return checks;
  return checks;
};
// Build an errors object, dropping null entries.
export const collect = (map) => Object.fromEntries(Object.entries(map).filter(([, v]) => v));
