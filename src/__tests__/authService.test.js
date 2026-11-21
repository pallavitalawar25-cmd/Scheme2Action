import { describe, expect, it } from 'vitest';
import adapter, { DEMO_IDS } from '../services/auth/demoAdapter';
import { AuthError } from '../services/auth/AuthError';

const reg = (o = {}) => adapter.register({ name: 'Asha K', email: 'asha@example.test', username: 'asha.k', password: 'Secret123', ...o });

describe('demo auth adapter', () => {
  it('registers, starts a session and never stores the plaintext password', async () => {
    const u = await reg();
    expect(u).toMatchObject({ name: 'Asha K', role: 'citizen', demo: true });
    expect(adapter.peekUser()?.id).toBe(u.id);
    expect(window.localStorage.getItem('s2a.demo.accounts')).not.toContain('Secret123');
  });
  it('rejects duplicate email and username', async () => {
    await reg();
    await expect(reg({ username: 'other' })).rejects.toMatchObject({ code: 'email_taken' });
    await expect(reg({ email: 'x@example.test' })).rejects.toMatchObject({ code: 'username_taken' });
  });
  it('logs in by email or username, rejects wrong password with the same error as unknown user', async () => {
    await reg(); await adapter.logout();
    expect((await adapter.login({ identifier: 'ASHA@example.test', password: 'Secret123' })).username).toBe('asha.k');
    await adapter.logout();
    expect((await adapter.login({ identifier: 'asha.k', password: 'Secret123' })).email).toBe('asha@example.test');
    await adapter.logout();
    const wrong = await adapter.login({ identifier: 'asha.k', password: 'nope' }).catch((e) => e);
    const unknown = await adapter.login({ identifier: 'ghost', password: 'nope' }).catch((e) => e);
    expect(wrong).toBeInstanceOf(AuthError); expect(wrong.code).toBe('invalid_credentials'); expect(unknown.code).toBe(wrong.code);
  });
  it('remember me controls where the session lives', async () => {
    await reg(); await adapter.logout();
    await adapter.login({ identifier: 'asha.k', password: 'Secret123', remember: false });
    expect(window.sessionStorage.getItem('s2a.demo.session')).toBeTruthy(); expect(window.localStorage.getItem('s2a.demo.session')).toBeNull();
    await adapter.logout();
    await adapter.login({ identifier: 'asha.k', password: 'Secret123', remember: true });
    expect(window.localStorage.getItem('s2a.demo.session')).toBeTruthy();
  });
  it('logout clears the session', async () => { await reg(); await adapter.logout(); expect(adapter.peekUser()).toBeNull(); });
  it('password reset gives the same answer for unknown emails and sends nothing', async () => {
    expect(await adapter.requestPasswordReset('ghost@example.test')).toEqual({ sent: true, demo: true });
  });
  it('quick login and delete account', async () => {
    expect((await adapter.quickLogin('admin')).role).toBe('admin');
    expect((await adapter.quickLogin('citizen')).id).toBe(DEMO_IDS.citizen);
    const u = await reg(); await adapter.deleteAccount(u.id);
    expect(adapter.peekUser()).toBeNull();
    await expect(adapter.login({ identifier: 'asha.k', password: 'Secret123' })).rejects.toMatchObject({ code: 'invalid_credentials' });
  });
});
