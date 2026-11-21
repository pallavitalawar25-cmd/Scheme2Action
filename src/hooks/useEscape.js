import { useEffect } from 'react';
export default function useEscape(handler, enabled = true) {
  useEffect(() => {
    if (!enabled) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') handler(e); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [handler, enabled]);
}
