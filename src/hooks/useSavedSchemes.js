import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import { readJSON, writeJSON } from '../utils/storage';
import { useAuth } from '../context/AuthContext';
import { backendApi } from '../services/backendApi';

// Saved schemes are kept per signed-in user (or "guest") in localStorage. Becomes GET/PUT /me/saved-schemes later.
const stores = new Map();
const listeners = new Set();
const keyFor = (uid) => `s2a.savedSchemes.${uid}`;
const get = (uid) => { if (!stores.has(uid)) stores.set(uid, readJSON(keyFor(uid), [])); return stores.get(uid); };
const subscribe = (l) => { listeners.add(l); return () => listeners.delete(l); };
const EMPTY = [];
export function resetSavedSchemesCache() { stores.clear(); listeners.forEach((l) => l()); } // used by tests

export default function useSavedSchemes() {
  const { user, isDemoAuth } = useAuth();
  const uid = user?.id || 'guest';
  const demoList = useSyncExternalStore(subscribe, () => get(uid), () => EMPTY);
  const [remoteList, setRemoteList] = useState([]);
  const [status, setStatus] = useState(isDemoAuth ? 'ready' : 'loading');
  useEffect(() => {
    if (isDemoAuth) { setStatus('ready'); return undefined; }
    let alive = true;
    setStatus('loading');
    backendApi.savedSchemes().then((result) => { if (alive) { setRemoteList(result.items || []); setStatus('ready'); } }).catch(() => { if (alive) setStatus('error'); });
    return () => { alive = false; };
  }, [isDemoAuth, uid]);
  const list = isDemoAuth ? demoList : remoteList;
  const isSaved = useCallback((id) => list.includes(id), [list]);
  const toggle = useCallback((id) => {
    if (!isDemoAuth) {
      const wasSaved = remoteList.includes(id);
      const next = wasSaved ? remoteList.filter((x) => x !== id) : [...remoteList, id];
      setRemoteList(next);
      backendApi.putSavedSchemes(next).catch(() => { setRemoteList(remoteList); setStatus('error'); });
      return !wasSaved;
    }
    const current = get(uid);
    const wasSaved = current.includes(id);
    const next = wasSaved ? current.filter((x) => x !== id) : [...current, id];
    stores.set(uid, next); writeJSON(keyFor(uid), next); listeners.forEach((l) => l());
    return !wasSaved;
  }, [isDemoAuth, remoteList, uid]);
  const clear = useCallback(() => {
    if (!isDemoAuth) { setRemoteList([]); backendApi.putSavedSchemes([]).catch(() => setStatus('error')); return; }
    stores.set(uid, []); writeJSON(keyFor(uid), []); listeners.forEach((l) => l());
  }, [isDemoAuth, uid]);
  return { saved: list, isSaved, toggle, clear, status };
}
