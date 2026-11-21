import { describe, expect, it } from 'vitest';
import * as v from '../utils/validators';

describe('validators', () => {
  it('required / name', () => {
    expect(v.required('')).toBe('v.required'); expect(v.required('  ')).toBe('v.required'); expect(v.required('x')).toBeNull();
    expect(v.fullName('A')).toBe('v.name'); expect(v.fullName('Asha K')).toBeNull();
  });
  it('email', () => {
    ['', 'a', 'a@b', 'a@b.c', 'a b@c.com'].forEach((x) => expect(v.email(x)).toBe('v.email'));
    ['a@b.co', 'first.last@example.org'].forEach((x) => expect(v.email(x)).toBeNull());
  });
  it('username', () => {
    ['ab', 'has space', 'x'.repeat(21), 'bad$'].forEach((x) => expect(v.username(x)).toBe('v.username'));
    ['abc', 'asha.k_1'].forEach((x) => expect(v.username(x)).toBeNull());
  });
  it('password rules and strength', () => {
    expect(v.password('short1')).toBe('v.passwordLen'); expect(v.password('abcdefgh')).toBe('v.passwordMix'); expect(v.password('12345678')).toBe('v.passwordMix');
    expect(v.password('abcdefg1')).toBeNull();
    expect(v.passwordStrength('')).toBe(0); expect(v.passwordStrength('abc')).toBe(1); expect(v.passwordStrength('abcdefg1')).toBe(2); expect(v.passwordStrength('Abcdefg1!xyz')).toBe(3);
  });
  it('match / checked', () => {
    expect(v.matches('a')('b')).toBe('v.match'); expect(v.matches('a')('a')).toBeNull();
    expect(v.checked(false)).toBe('v.consent'); expect(v.checked(true)).toBeNull();
  });
  it('optional phone, pincode, date', () => {
    expect(v.optionalPhone('')).toBeNull(); expect(v.optionalPhone('12345')).toBe('v.phone'); expect(v.optionalPhone('5876543210')).toBe('v.phone'); expect(v.optionalPhone('9876543210')).toBeNull();
    expect(v.optionalPincode('12345')).toBe('v.pincode'); expect(v.optionalPincode('560001')).toBeNull();
    expect(v.optionalPastDate('2999-01-01')).toBe('v.date'); expect(v.optionalPastDate('nope')).toBe('v.date'); expect(v.optionalPastDate('2000-05-05')).toBeNull();
  });
  it('collect drops nulls', () => { expect(v.collect({ a: null, b: 'x' })).toEqual({ b: 'x' }); });
});
