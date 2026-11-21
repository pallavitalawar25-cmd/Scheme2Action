import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { useAuth } from '../context/AuthContext';
import { EMPTY, getData, resetData, seedFor, subscribe, summarize, updateData, profileCompleteness } from '../services/citizenStore';
import { backendApi } from '../services/backendApi';

// Demo sessions use browser storage. API sessions hydrate and persist through the authenticated REST API.
export default function useCitizenData() {
  const { user, isDemoAuth } = useAuth();
  const demoData = useSyncExternalStore(subscribe, () => getData(user), () => EMPTY);
  const [remoteData, setRemoteData] = useState(() => user ? seedFor(user) : EMPTY);
  const [status, setStatus] = useState(isDemoAuth ? 'ready' : 'loading');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isDemoAuth || !user) { setStatus('ready'); return undefined; }
    let alive = true;
    setStatus('loading'); setError(null);
    backendApi.workspace().then((workspace) => {
      if (alive) {
        setRemoteData({ v: 1, profile: workspace.profile || { fullName: user.name, state: 'Karnataka' }, settings: workspace.settings || {}, saved: workspace.saved || [], applications: workspace.applications || [], documents: workspace.documents || [], activity: workspace.activity || [], helperSession: workspace.helperSession || null });
        setStatus('ready');
      }
    }).catch((reason) => { if (alive) { setError(reason); setStatus('error'); } });
    return () => { alive = false; };
  }, [isDemoAuth, user?.id]);

  const data = isDemoAuth ? demoData : remoteData;
  const update = useCallback((fn) => isDemoAuth ? updateData(user, fn) : setRemoteData((current) => fn(current)), [isDemoAuth, user]);
  const updateProfile = useCallback((patch) => {
    if (isDemoAuth) return update((d) => ({ ...d, profile: { ...d.profile, ...patch } }));
    setRemoteData((d) => ({ ...d, profile: { ...d.profile, ...patch } }));
    return backendApi.patchProfile(patch).catch((reason) => { setError(reason); setStatus('error'); throw reason; });
  }, [isDemoAuth, update]);
  const updateSettings = useCallback((group, patch) => {
    if (isDemoAuth) return update((d) => ({ ...d, settings: { ...d.settings, [group]: { ...d.settings[group], ...patch } } }));
    setRemoteData((d) => ({ ...d, settings: { ...d.settings, [group]: { ...d.settings[group], ...patch } } }));
    return backendApi.patchSettings({ [group]: patch }).catch((reason) => { setError(reason); setStatus('error'); });
  }, [isDemoAuth, update]);
  const logActivity = useCallback((entry) => update((d) => ({ ...d, activity: [{ id: `a-${Date.now()}`, at: new Date().toISOString(), ...entry }, ...(d.activity || [])].slice(0, 30) })), [update]);
  const removeDocument = useCallback((id) => {
    if (isDemoAuth) return update((d) => ({ ...d, documents: d.documents.filter((x) => x.id !== id) }));
    const doc = remoteData.documents.find((item) => item.id === id);
    if (!doc || String(id).startsWith('missing-')) return Promise.resolve();
    setRemoteData((d) => ({ ...d, documents: d.documents.filter((item) => item.id !== id) }));
    return backendApi.deleteDocument(doc.appId || doc.app_id, id).catch((reason) => { setError(reason); setStatus('error'); });
  }, [isDemoAuth, remoteData.documents, update]);
  const setHelperSession = useCallback((session) => {
    if (isDemoAuth) return update((d) => ({ ...d, helperSession: session }));
    setRemoteData((d) => ({ ...d, helperSession: session }));
    return backendApi.patchWorkspace({ helper_session: session }).catch((reason) => { setError(reason); setStatus('error'); });
  }, [isDemoAuth, update]);
  const reset = useCallback(() => {
    if (isDemoAuth) return resetData(user);
    return backendApi.workspace().then((workspace) => setRemoteData((d) => ({ ...d, ...workspace })));
  }, [isDemoAuth, user]);

  const summary = useMemo(() => (data.empty ? { active: 0, packets: 0, pendingDocs: 0, pendingCorrections: 0 } : summarize(data)), [data]);
  const completeness = useMemo(() => (data.empty ? 0 : profileCompleteness(data.profile)), [data]);
  return { data, summary, completeness, updateProfile, updateSettings, logActivity, removeDocument, setHelperSession, reset, status, error, isDemoAuth };
}
