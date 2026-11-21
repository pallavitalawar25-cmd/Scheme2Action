import { describe, expect, it } from 'vitest';
import { assessEligibility } from '../services/eligibilityRules';

describe('demonstration eligibility rules', () => {
  it('returns needs verification when answers are incomplete', () => {
    expect(assessEligibility('ssp-post-matric-scholarship', { student: 'yes' }).outcome).toBe('unknown');
  });
  it('returns likely only when all configured conditions pass', () => {
    expect(assessEligibility('ssp-post-matric-scholarship', { student: 'yes', karnataka: 'yes', postMatric: 'yes', incomeKnown: 'yes' }).outcome).toBe('likely');
  });
  it('returns not eligible under demo rules when an answer fails', () => {
    const result = assessEligibility('ssp-post-matric-scholarship', { student: 'no', karnataka: 'yes', postMatric: 'yes' });
    expect(result.outcome).toBe('not'); expect(result.failed).toContain('student');
  });
  it('returns needs verification for schemes without configured rules', () => {
    expect(assessEligibility('unknown-scheme', {}).outcome).toBe('unknown');
  });
});
