// Safe localStorage helpers (never throw in private mode / blocked storage)
export function readJSON(key, fallback = null) {
  try { const raw = window.localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch { return fallback; }
}
export function writeJSON(key, value) {
  try { window.localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ }
}
export function readString(key, fallback = null) {
  try { return window.localStorage.getItem(key) ?? fallback; } catch { return fallback; }
}
export function writeString(key, value) {
  try { window.localStorage.setItem(key, value); } catch { /* ignore */ }
}
export function removeKey(key) {
  try { window.localStorage.removeItem(key); } catch { /* ignore */ }
}
