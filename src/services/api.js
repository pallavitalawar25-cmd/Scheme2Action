// Single place for backend calls. Swap demo adapters for real FastAPI calls by setting VITE_API_BASE_URL.
// Never put secret keys here: this code ships to the browser.
const BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(status, body) {
    super(body?.detail || body?.message || `Request failed with status ${status}`);
    this.name = 'ApiError';
    this.status = status;
    this.code = body?.code;
    this.body = body;
  }
}

export const isBackendConnected = () => Boolean(BASE_URL);

export async function apiRequest(path, { method = 'GET', body, headers = {} } = {}) {
  if (!BASE_URL) {
    const error = new Error('Backend not connected (demo mode).');
    error.code = 'NO_BACKEND';
    throw error;
  }
  const formData = typeof FormData !== 'undefined' && body instanceof FormData;
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    credentials: 'include', // session lives in an httpOnly cookie set by the server, never in JS-readable storage
    headers: { Accept: 'application/json', ...(body && !formData ? { 'Content-Type': 'application/json' } : {}), ...headers },
    body: body ? (formData || typeof body === 'string' ? body : JSON.stringify(body)) : undefined,
  });
  const text = await res.text();
  const data = text ? safeJson(text) : null;
  if (!res.ok) throw new ApiError(res.status, data);
  return data;
}

export async function apiBlob(path) {
  if (!BASE_URL) {
    const error = new Error('Backend not connected (demo mode).');
    error.code = 'NO_BACKEND';
    throw error;
  }
  const response = await fetch(`${BASE_URL}${path}`, { credentials: 'include', headers: { Accept: 'application/pdf, application/octet-stream' } });
  if (!response.ok) {
    const body = await response.text();
    throw new ApiError(response.status, safeJson(body) || { detail: body });
  }
  return response.blob();
}

const safeJson = (t) => { try { return JSON.parse(t); } catch { return null; } };
