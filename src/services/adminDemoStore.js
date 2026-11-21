// Browser-only admin prototype. Replace these storage operations with authenticated API calls;
// the backend must enforce roles, version writes and review permissions.
import { schemes as catalogue } from '../data/schemes';
import { schemeKey } from '../data/schemes';
import en from '../translations/en';
import kn from '../translations/kn';

const STORAGE_KEY = 's2a.admin.demo.v1';
const stamp = '2026-11-21T00:00:00.000Z';
export const seedAdminData = () => ({
  schemes: catalogue.map((scheme) => ({ ...scheme, nameEn: en[schemeKey(scheme.id, 'name')], nameKn: kn[schemeKey(scheme.id, 'name')] || en[schemeKey(scheme.id, 'name')], version: 1, history: [{ version: 1, at: scheme.lastUpdated || stamp, actor: 'Demo Admin', summary: 'Initial demonstration record' }] })),
  rules: [
    { id: 'draft-ssp-01', schemeId: 'ssp-post-matric-scholarship', title: 'Student and study level questions', status: 'draft', origin: 'ai', source: 'https://ssp.karnataka.gov.in', updatedAt: stamp, description: 'Example draft only; requires source review and human approval.', history: [{ status: 'draft', actor: 'AI draft (demonstration)', at: stamp }] },
    { id: 'draft-kisan-01', schemeId: 'pm-kisan', title: 'Applicant and land record checks', status: 'draft', origin: 'ai', source: 'https://pmkisan.gov.in', updatedAt: stamp, description: 'Example draft only; do not use as an eligibility rule.', history: [{ status: 'draft', actor: 'AI draft (demonstration)', at: stamp }] },
    { id: 'approved-ssp-demo', schemeId: 'ssp-post-matric-scholarship', title: 'Document list placeholder', status: 'approved', origin: 'human', source: 'https://ssp.karnataka.gov.in', updatedAt: stamp, description: 'Demonstration record; not an official verified requirement.', history: [{ status: 'approved', actor: 'Demo Admin', at: stamp }] },
  ],
  policies: [
    { id: 'policy-ssp-2026-01', schemeId: 'ssp-post-matric-scholarship', title: 'Scholarship application guidance update', before: 'Previous demonstration summary: no reviewed update recorded.', after: 'Proposed demonstration change: source guidance needs a new review.', source: 'https://ssp.karnataka.gov.in', status: 'pending', updatedAt: stamp },
    { id: 'policy-pm-kisan-2026-01', schemeId: 'pm-kisan', title: 'Portal notice review', before: 'Current catalogue summary is marked information verified.', after: 'Proposed status: review the latest official portal notice.', source: 'https://pmkisan.gov.in', status: 'pending', updatedAt: stamp },
  ],
});

export function readAdminData() {
  try {
    const value = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || 'null');
    if (value?.version === 1 && value.data?.schemes && value.data?.rules && value.data?.policies) return value.data;
  } catch { /* use seeded demonstration data when storage is unavailable */ }
  return seedAdminData();
}

export function writeAdminData(data) {
  try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, data })); } catch { /* demo actions remain in memory */ }
  return data;
}
