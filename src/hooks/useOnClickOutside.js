import { useEffect } from 'react';
export default function useOnClickOutside(ref, handler, enabled = true) {
  useEffect(() => {
    if (!enabled) return undefined;
    const listener = (e) => { if (ref.current && !ref.current.contains(e.target)) handler(e); };
    document.addEventListener('pointerdown', listener);
    return () => document.removeEventListener('pointerdown', listener);
  }, [ref, handler, enabled]);
}
