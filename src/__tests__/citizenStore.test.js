import { describe, expect, it } from 'vitest';
import { applicationProgress, getData, missingProfileFields, profileCompleteness, summarize, updateData } from '../services/citizenStore';

const demo = { id: 'demo-citizen', name: 'Demo Citizen' };
const fresh = { id: 'u-new', name: 'New Person' };

describe('citizen store', () => {
  it('seeds the demo citizen with sample applications', () => {
    const d = getData(demo);
    expect(summarize(d)).toEqual({ active: 2, packets: 1, pendingDocs: 2, pendingCorrections: 1 });
    expect(d.applications).toHaveLength(3);
  });
  it('gives new users an empty workspace with only a "joined" activity', () => {
    const d = getData(fresh);
    expect(d.applications).toEqual([]); expect(d.documents).toEqual([]);
    expect(d.activity.map((a) => a.type)).toEqual(['joined']);
    expect(summarize(d)).toEqual({ active: 0, packets: 0, pendingDocs: 0, pendingCorrections: 0 });
  });
  it('persists updates to localStorage', () => {
    updateData(fresh, (d) => ({ ...d, profile: { ...d.profile, phone: '9876543210' } }));
    expect(JSON.parse(window.localStorage.getItem('s2a.citizen.u-new')).profile.phone).toBe('9876543210');
  });
  it('computes profile completeness and progress', () => {
    expect(profileCompleteness({})).toBe(0);
    const p = getData(fresh).profile;
    expect(profileCompleteness(p)).toBe(25);
    expect(missingProfileFields(p)).toContain('phone');
    const [a1, , a3] = getData(demo).applications;
    expect(applicationProgress(a1)).toBe(25); expect(applicationProgress(a3)).toBe(100);
  });
});
