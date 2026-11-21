import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { readString, writeString } from '../utils/storage';

const PreferencesContext = createContext(null);
const SIZE_KEY = 's2a.textSize';
const MOTION_KEY = 's2a.reduceMotion';
const SIZES = ['normal', 'large', 'xl'];

export function PreferencesProvider({ children }) {
  const [textSize, setTextSizeState] = useState(() => {
    const stored = readString(SIZE_KEY);
    if (SIZES.includes(stored)) return stored;
    return readString('s2a.largeText') === '1' ? 'large' : 'normal'; // migrate batch 1 setting
  });
  const [reduceMotion, setReduceMotionState] = useState(() => readString(MOTION_KEY) === '1');

  useEffect(() => { document.documentElement.dataset.textsize = textSize; writeString(SIZE_KEY, textSize); }, [textSize]);
  useEffect(() => { document.documentElement.dataset.motion = reduceMotion ? 'reduce' : 'full'; writeString(MOTION_KEY, reduceMotion ? '1' : '0'); }, [reduceMotion]);

  const setTextSize = useCallback((s) => setTextSizeState(SIZES.includes(s) ? s : 'normal'), []);
  const toggleLargeText = useCallback(() => setTextSizeState((s) => (s === 'normal' ? 'large' : 'normal')), []);
  const setReduceMotion = useCallback((v) => setReduceMotionState(Boolean(v)), []);

  const value = useMemo(() => ({ textSize, largeText: textSize !== 'normal', setTextSize, toggleLargeText, reduceMotion, setReduceMotion }), [textSize, setTextSize, toggleLargeText, reduceMotion, setReduceMotion]);
  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error('usePreferences must be used inside PreferencesProvider');
  return ctx;
}
