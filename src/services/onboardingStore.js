// AI onboarding helpers: field catalogue, client-side validation (mirrors the server) and progress persistence.
// Progress lives in sessionStorage (this tab only, cleared after saving) so a visitor can sign in and come back.
// Nothing here is a profile store: confirmed profiles are saved only through PATCH /me/profile.
export const CORE_FIELDS = ['fullName', 'dateOfBirth', 'state', 'district', 'residence', 'occupation', 'education', 'annualIncome'];
export const OPTIONAL_FIELDS = ['gender', 'category', 'disability', 'circumstances'];
export const ALL_FIELDS = [...CORE_FIELDS, ...OPTIONAL_FIELDS];

export const OPTIONS = {
  residence: ['rural', 'urban'],
  occupation: ['student', 'farmer', 'homemaker', 'employed', 'self', 'unemployed', 'retired'],
  education: ['none', 'primary', 'secondary', 'higher_secondary', 'diploma_iti', 'graduate', 'postgraduate', 'doctorate'],
  gender: ['female', 'male', 'other', 'na'],
  category: ['general', 'obc', 'sc', 'st', 'ews'],
  disability: ['yes', 'no'],
  circumstances: ['student', 'farmer', 'woman', 'business_owner', 'senior_citizen', 'widow', 'unemployed', 'daily_wage_worker'],
};
// Translation key for the label of an enumerated value.
export const optionKey = (field, value) => ({
  residence: `ob.res.${value}`, occupation: `occ.${value}`, education: `ob.edu.${value}`, gender: `gender.${value}`,
  category: `ob.cat.${value}`, disability: `ob.dis.${value}`, circumstances: `ob.circ.${value}`,
}[field]);

const TEXT_BAD = /[<>{}[\]\\\d]/;
const cleanText = (v) => String(v ?? '').trim().replace(/\s+/g, ' ');

// Returns { field: translationKey } for every invalid value. Empty values are not errors (review shows "Not provided").
export function validateProfile(values) {
  const errors = {};
  const name = cleanText(values.fullName);
  if (name && (name.length < 2 || name.length > 120 || TEXT_BAD.test(name))) errors.fullName = 'ob.v.name';
  ['state', 'district'].forEach((f) => { const v = cleanText(values[f]); if (v && (v.length < 2 || v.length > 100 || TEXT_BAD.test(v))) errors[f] = 'ob.v.place'; });
  const dob = String(values.dateOfBirth || '');
  if (dob) {
    const d = new Date(`${dob}T00:00:00`);
    const now = new Date();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dob) || Number.isNaN(d.getTime()) || d >= now || now.getFullYear() - d.getFullYear() > 120) errors.dateOfBirth = 'ob.v.dob';
  }
  const income = values.annualIncome;
  if (income !== '' && income !== null && income !== undefined && !(/^\d+$/.test(String(income).trim()) && Number(income) <= 1_000_000_000)) errors.annualIncome = 'ob.v.income';
  return errors;
}

// Builds the PATCH /me/profile body from the reviewed draft. Only provided values are sent; consent is explicit.
export function toProfilePatch(values) {
  const body = {};
  ['fullName', 'state', 'district'].forEach((f) => { const v = cleanText(values[f]); if (v) body[f] = v; });
  if (values.dateOfBirth) body.dateOfBirth = values.dateOfBirth;
  ['residence', 'occupation', 'education', 'gender', 'category', 'disability'].forEach((f) => { if (values[f]) body[f] = values[f]; });
  if (values.annualIncome !== '' && values.annualIncome !== null && values.annualIncome !== undefined) body.annualIncome = Number(values.annualIncome);
  if (Array.isArray(values.circumstances)) body.circumstances = values.circumstances;
  body.onboardingConsent = true;
  return body;
}

export const isFilled = (values, field) => (field === 'circumstances' ? Array.isArray(values[field]) : values[field] !== undefined && values[field] !== null && values[field] !== '');
export const progressOf = (values, skipped = []) => Math.round((ALL_FIELDS.filter((f) => isFilled(values, f) || skipped.includes(f)).length / ALL_FIELDS.length) * 100);
export const nextMissing = (values, skipped = []) => ALL_FIELDS.find((f) => !isFilled(values, f) && !skipped.includes(f));

// ---- progress persistence (sessionStorage, per tab, 24h) ----
const KEY = 's2a.onboarding.v1';
const TTL = 24 * 3600 * 1000;
export const emptyProgress = () => ({ messages: [], profile: {}, skipped: [], phase: 'intro', awaitingAuth: false });

export function loadProgress() {
  try {
    const raw = JSON.parse(window.sessionStorage.getItem(KEY) || 'null');
    if (!raw || raw.v !== 1 || Date.now() - raw.at > TTL) return null;
    return { ...emptyProgress(), ...raw.data };
  } catch { return null; }
}
export function saveProgress(data) {
  try { window.sessionStorage.setItem(KEY, JSON.stringify({ v: 1, at: Date.now(), data })); } catch { /* storage is optional */ }
}
export function clearProgress() {
  try { window.sessionStorage.removeItem(KEY); } catch { /* storage is optional */ }
}
