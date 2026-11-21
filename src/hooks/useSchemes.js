import { useCallback, useEffect, useRef, useState } from 'react';
import { schemes } from '../data/schemes';
import { isBackendConnected } from '../services/api';
import { backendApi } from '../services/backendApi';

// Simulated async data source. Replace the body of `fetchSchemes` with a real API call
// (services/api.js) when the FastAPI backend is ready; the loading/error/success contract stays the same.
let loadedOnce = false;
const fetchSchemes = (shouldFail) => new Promise((resolve, reject) => {
  if (isBackendConnected()) {
    backendApi.schemes({ language: localStorage.getItem('s2a.language') || 'en' }).then((response) => resolve(response.items || []), reject);
    return;
  }
  window.setTimeout(() => {
    if (shouldFail) reject(new Error('Demonstration error'));
    else { loadedOnce = true; resolve(schemes); }
  }, loadedOnce ? 220 : 750);
});

// Add ?simulateError=1 to any scheme page URL to preview the error state once. "Try again" then succeeds.
export default function useSchemes() {
  const [state, setState] = useState({ status: 'loading', data: [] });
  const failOnce = useRef(typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('simulateError'));

  const load = useCallback(() => {
    setState({ status: 'loading', data: [] });
    const fail = failOnce.current;
    failOnce.current = false;
    let cancelled = false;
    fetchSchemes(fail).then(
      (data) => { if (!cancelled) setState({ status: 'success', data }); },
      () => { if (!cancelled) setState({ status: 'error', data: [] }); },
    );
    return () => { cancelled = true; };
  }, []);

  useEffect(() => load(), [load]);
  return { ...state, reload: load };
}
