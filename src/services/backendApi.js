import { apiBlob, apiRequest } from './api';

const json = (method, body) => ({ method, body });
const query = (params = {}) => {
  const value = new URLSearchParams(Object.entries(params).filter(([, item]) => item !== undefined && item !== null && item !== ''));
  return value.size ? `?${value}` : '';
};

export const backendApi = {
  schemes: (params) => apiRequest(`/schemes${query(params)}`),
  scheme: (id, language) => apiRequest(`/schemes/${encodeURIComponent(id)}${query({ language })}`),
  questions: (id, language) => apiRequest(`/schemes/${encodeURIComponent(id)}/eligibility/questions${query({ language })}`),
  checklist: (id, language) => apiRequest(`/schemes/${encodeURIComponent(id)}/documents${query({ language })}`),
  workspace: () => apiRequest('/me/workspace'),
  patchWorkspace: (body) => apiRequest('/me/workspace', json('PATCH', body)),
  patchProfile: (body) => apiRequest('/me/profile', json('PATCH', body)),
  patchSettings: (body) => apiRequest('/me/settings', json('PATCH', body)),
  savedSchemes: () => apiRequest('/me/saved-schemes'),
  putSavedSchemes: (items) => apiRequest('/me/saved-schemes', json('PUT', { items })),
  applications: () => apiRequest('/applications'),
  application: (id) => apiRequest(`/applications/${encodeURIComponent(id)}`),
  createApplication: (scheme_id, assessment_id) => apiRequest('/applications', json('POST', { scheme_id, assessment_id })),
  patchApplication: (id, body) => apiRequest(`/applications/${encodeURIComponent(id)}`, json('PATCH', body)),
  assess: (id, answers) => apiRequest(`/applications/${encodeURIComponent(id)}/eligibility`, json('POST', { answers })),
  upload: (id, documentType, file) => {
    const body = new FormData();
    body.append('document_type', documentType);
    body.append('file', file);
    return apiRequest(`/applications/${encodeURIComponent(id)}/documents`, { method: 'POST', body });
  },
  deleteDocument: (appId, docId) => apiRequest(`/applications/${encodeURIComponent(appId)}/documents/${encodeURIComponent(docId)}`, { method: 'DELETE' }),
  extract: (appId, docId, language, consent) => apiRequest(`/applications/${encodeURIComponent(appId)}/documents/${encodeURIComponent(docId)}/extract${query({ language })}`, json('POST', { consent })),
  correction: (id, body) => apiRequest(`/applications/${encodeURIComponent(id)}/corrections`, json('POST', body)),
  finalReview: (id, body) => apiRequest(`/applications/${encodeURIComponent(id)}/review`, json('POST', body)),
  packet: (id, language) => apiBlob(`/applications/${encodeURIComponent(id)}/packet.pdf${query({ language })}`),
  tracker: (id, language) => apiRequest(id ? `/applications/${encodeURIComponent(id)}/tracker${query({ language })}` : `/applications/tracker${query({ language })}`),
  adminDashboard: () => apiRequest('/admin/dashboard'),
  adminSchemes: () => apiRequest('/admin/schemes'),
  saveScheme: (body, id) => apiRequest(id ? `/admin/schemes/${encodeURIComponent(id)}` : '/admin/schemes', json(id ? 'PUT' : 'POST', body)),
  schemeHistory: (id) => apiRequest(`/admin/schemes/${encodeURIComponent(id)}/history`),
  reviewSchemeChange: (id, decision, note = '') => apiRequest(`/admin/scheme-changes/${encodeURIComponent(id)}/review`, json('POST', { decision, note })),
  adminSources: (params) => apiRequest(`/admin/sources${query(params)}`),
  addSource: (id, body) => apiRequest(`/admin/schemes/${encodeURIComponent(id)}/sources`, json('POST', body)),
  removeSource: (id) => apiRequest(`/admin/sources/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  reviewSource: (id, decision, note = '') => apiRequest(`/admin/sources/${encodeURIComponent(id)}/review`, json('POST', { decision, note })),
  adminRules: (params) => apiRequest(`/admin/rulebook${query(params)}`),
  addRule: (schemeId, body) => apiRequest(`/admin/schemes/${encodeURIComponent(schemeId)}/rules`, json('POST', body)),
  reviewRule: (id, decision, note = '') => apiRequest(`/admin/rules/${encodeURIComponent(id)}/review`, json('POST', { decision, note })),
  ruleHistory: (id) => apiRequest(`/admin/rules/${encodeURIComponent(id)}/history`),
  adminPolicies: (params) => apiRequest(`/admin/policy-changes${query(params)}`),
  addPolicy: (body) => apiRequest('/admin/policy-changes', json('POST', body)),
  reviewPolicy: (id, decision, note = '') => apiRequest(`/admin/policy-changes/${encodeURIComponent(id)}/review`, json('POST', { decision, note })),
};
