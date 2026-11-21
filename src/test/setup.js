import { afterEach, beforeEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import { webcrypto } from 'node:crypto';
import { clearAllCache } from '../services/citizenStore';
import { resetSavedSchemesCache } from '../hooks/useSavedSchemes';

if (!globalThis.crypto?.subtle) Object.defineProperty(globalThis, 'crypto', { value: webcrypto, configurable: true });

// Elements "intersect" immediately so whileInView / useInView animations run in tests.
class IO {
  constructor(cb) { this.cb = cb; }
  observe(target) { setTimeout(() => this.cb([{ isIntersecting: true, target, boundingClientRect: { top: 0 } }]), 0); }
  unobserve() {} disconnect() {}
}

beforeEach(() => {
  window.localStorage.clear();
  window.sessionStorage.clear();
  clearAllCache();
  resetSavedSchemesCache();
  window.IntersectionObserver = IO;
  window.scrollTo = () => {};
  window.HTMLElement.prototype.scrollIntoView = () => {};
  window.matchMedia = window.matchMedia || ((q) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }));
  window.history.pushState({}, '', '/');
  document.documentElement.removeAttribute('data-textsize');
  document.documentElement.removeAttribute('data-motion');
});
afterEach(() => cleanup());
