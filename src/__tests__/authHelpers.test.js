import { describe, expect, it } from 'vitest';
import { homeFor, safeRedirect } from '../pages/auth/authHelpers';

const citizen = { role: 'citizen' }; const admin = { role: 'admin' };
describe('safeRedirect', () => {
  it('follows internal paths', () => { expect(safeRedirect('/saved', citizen)).toBe('/saved'); expect(safeRedirect('/admin/schemes', admin)).toBe('/admin/schemes'); });
  it('preserves internal query strings and hashes for intended application URLs', () => { expect(safeRedirect('/apply/ssp-post-matric-scholarship/eligibility?from=details#start', citizen)).toBe('/apply/ssp-post-matric-scholarship/eligibility?from=details#start'); });
  it('falls back for admin paths when not admin', () => { expect(safeRedirect('/admin', citizen)).toBe('/dashboard'); });
  it('rejects external, protocol-relative and backslash redirects', () => {
    ['https://evil.test', '//evil.test', '/\\evil.test', '\\\\evil.test', 'javascript:alert(1)', '', null, undefined, 42].forEach((x) => expect(safeRedirect(x, citizen)).toBe('/dashboard'));
  });
  it('home depends on role', () => { expect(homeFor(admin)).toBe('/admin'); expect(homeFor(citizen)).toBe('/dashboard'); });
});
