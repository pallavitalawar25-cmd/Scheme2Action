import { describe, expect, it } from 'vitest';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { mount, WAIT } from '../test/utils';
import demoAdapter from '../services/auth/demoAdapter';
import { getData } from '../services/citizenStore';

const type = (label, value) => fireEvent.change(screen.getByLabelText(label), { target: { value } });
const has = (re) => waitFor(() => expect(screen.getAllByText(re).length).toBeGreaterThan(0), WAIT);
const registerViaService = async () => { await demoAdapter.register({ name: 'Test User', email: 'test@example.test', username: 'test.user', password: 'Secret123' }); await demoAdapter.logout(); };

describe('login', () => {
  it('shows the demo-not-secure notice and validates empty fields', async () => {
    await mount('/login');
    expect(await screen.findByText('Browser-based demonstration authentication', {}, WAIT)).toBeTruthy();
    expect(screen.getByText(/not production authentication/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Log in' }));
    await waitFor(() => expect(screen.getAllByText('This field is required')).toHaveLength(2));
  });
  it('rejects wrong credentials with a generic message', async () => {
    await registerViaService(); await mount('/login');
    type(/Email or username/, 'test.user'); type(/^Password/, 'wrongpass1');
    fireEvent.click(screen.getByRole('button', { name: 'Log in' }));
    expect(await screen.findByText(/is not correct/, {}, WAIT)).toBeTruthy();
  });
  it('logs in with valid credentials and opens the dashboard', async () => {
    await registerViaService(); await mount('/login');
    type(/Email or username/, 'test@example.test'); type(/^Password/, 'Secret123');
    fireEvent.click(screen.getByRole('button', { name: 'Log in' }));
    expect(await screen.findByRole('heading', { level: 1, name: /Welcome, Test User/ }, WAIT)).toBeTruthy();
  });
  it('show/hide password toggles the input type', async () => {
    await mount('/login');
    const input = await screen.findByLabelText(/^Password/, {}, WAIT);
    expect(input.type).toBe('password');
    fireEvent.click(screen.getByRole('button', { name: 'Show password' }));
    expect(input.type).toBe('text');
  });
  it('demo quick access reaches the dashboard', async () => {
    await mount('/login');
    fireEvent.click(await screen.findByRole('button', { name: /Continue as demo citizen/ }, WAIT));
    expect(await screen.findByRole('heading', { level: 1, name: /Welcome, Demo Citizen/ }, WAIT)).toBeTruthy();
  });
  it('is fully translated in Kannada', async () => {
    await mount('/login', { lang: 'kn' });
    expect((await screen.findAllByText('ಪಾಸ್‌ವರ್ಡ್ ಮರೆತಿರಾ?', {}, WAIT)).length).toBeGreaterThan(0);
  });
});

describe('registration', () => {
  it('validates every field', async () => {
    await mount('/register');
    fireEvent.click(await screen.findByRole('button', { name: 'Create account' }, WAIT));
    await has('Enter your full name (at least 2 letters)'); await has('Enter a valid email address');
    await has('Use 3–20 letters, numbers, dots or underscores'); await has('Use at least 8 characters'); await has('You need to agree to continue');
    type(/^Password/, 'abcdefg1'); type(/Confirm password/, 'different1');
    await has('Passwords do not match');
    expect(screen.getByText(/Password strength/)).toBeTruthy();
  });
  it('creates an account, signs in and shows an empty dashboard', async () => {
    await mount('/register');
    type(/Full name/, 'New Person'); type(/^Email/, 'new@example.test'); type(/^Username/, 'new.person');
    type(/^Password/, 'Secret123'); type(/Confirm password/, 'Secret123'); fireEvent.click(screen.getByLabelText(/I agree/));
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }));
    expect(await screen.findByRole('heading', { level: 1, name: /Welcome, New Person/ }, WAIT)).toBeTruthy();
    expect(await screen.findByText('No active applications yet', {}, WAIT)).toBeTruthy();
    await has('No saved schemes yet');
  });
  it('blocks a duplicate email', async () => {
    await registerViaService(); await mount('/register');
    type(/Full name/, 'Other One'); type(/^Email/, 'test@example.test'); type(/^Username/, 'other.one');
    type(/^Password/, 'Secret123'); type(/Confirm password/, 'Secret123'); fireEvent.click(screen.getByLabelText(/I agree/));
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }));
    expect(await screen.findByText('An account with this email already exists.', {}, WAIT)).toBeTruthy();
  });
});

describe('forgot password', () => {
  it('validates the email, then shows a clearly labelled demo confirmation', async () => {
    await mount('/forgot-password');
    fireEvent.click(await screen.findByRole('button', { name: 'Send reset link' }, WAIT));
    await has('Enter a valid email address');
    type(/^Email/, 'anyone@example.test');
    fireEvent.click(screen.getByRole('button', { name: 'Send reset link' }));
    expect(await screen.findByText('Check your email', {}, WAIT)).toBeTruthy();
    expect(screen.getByText(/Demo only: no email is sent/)).toBeTruthy();
  });
});

describe('route protection', () => {
  it('redirects guests from the dashboard to login', async () => {
    await mount('/dashboard');
    expect(await screen.findByRole('heading', { level: 1, name: /Welcome back/ }, WAIT)).toBeTruthy();
  });
  it('redirects citizens away from admin pages', async () => {
    await mount('/admin', { user: 'citizen' });
    expect(await screen.findByRole('heading', { level: 1, name: /Welcome, Demo Citizen/ }, WAIT)).toBeTruthy();
  });
  it('redirects signed-in users away from /login', async () => {
    await mount('/login', { user: 'citizen' });
    expect(await screen.findByRole('heading', { level: 1, name: /Welcome, Demo Citizen/ }, WAIT)).toBeTruthy();
  });
});

describe('dashboard', () => {
  it('shows stats, applications, tasks, timeline, profile and activity for the demo citizen', async () => {
    await mount('/dashboard', { user: 'citizen' });
    expect(await screen.findByText('Pending documents', {}, WAIT)).toBeTruthy();
    expect(screen.getByText('Pending corrections')).toBeTruthy(); expect(screen.getByText('Completed packets')).toBeTruthy();
    expect(screen.getAllByRole('link', { name: /Continue application/ })).toHaveLength(2);
    expect(screen.getAllByRole('link', { name: /View packet/ })).toHaveLength(1);
    expect(screen.getByText('Pending tasks')).toBeTruthy();
    expect(screen.getByText('Upload Income certificate')).toBeTruthy();
    expect(screen.getByText('Review and correct Previous marks card')).toBeTruthy();
    expect(screen.getByText('Application journey')).toBeTruthy();
    expect(screen.getByText(/Government processing is tracked separately/)).toBeTruthy();
    expect(screen.getByText('Recent activity')).toBeTruthy();
    expect(screen.getByText('Profile completeness')).toBeTruthy();
  });
  it('continue links go to the correct step of the application', async () => {
    await mount('/dashboard', { user: 'citizen' });
    const links = await screen.findAllByRole('link', { name: /Continue application/ }, WAIT);
    expect(links.map((l) => l.getAttribute('href'))).toEqual(['/apply/ssp-post-matric-scholarship/documents', '/apply/pm-kisan/eligibility']);
  });
  it('renders in Kannada', async () => {
    await mount('/dashboard', { user: 'citizen', lang: 'kn' });
    expect((await screen.findAllByText('ಸ್ವಾಗತ, Demo Citizen', {}, WAIT)).length).toBeGreaterThan(0);
    expect(screen.getAllByText('ಬಾಕಿ ಕಾರ್ಯಗಳು').length).toBeGreaterThan(0);
  });
});

describe('saved schemes', () => {
  it('saving from a scheme page shows it on the saved page and dashboard, and can be cleared', async () => {
    const first = await mount('/schemes/pm-kisan', { user: 'citizen' });
    fireEvent.click(await screen.findByRole('button', { name: /Save Scheme/ }, WAIT));
    await has('Scheme saved (demo)');
    first.unmount();
    const second = await mount('/saved');
    expect((await screen.findAllByText(/PM-KISAN/, {}, WAIT)).length).toBeGreaterThan(0);
    expect(screen.getByText('1 saved')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Remove all/ }));
    const dialog = await screen.findByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: /Remove all/ }));
    expect((await screen.findAllByText('No saved schemes yet', {}, WAIT)).length).toBeGreaterThan(0);
    second.unmount();
  });
  it('saved schemes are per account', async () => {
    const first = await mount('/schemes/pm-kisan', { user: 'citizen' });
    fireEvent.click(await screen.findByRole('button', { name: /Save Scheme/ }, WAIT));
    first.unmount();
    await mount('/saved', { user: 'admin' });
    expect((await screen.findAllByText('No saved schemes yet', {}, WAIT)).length).toBeGreaterThan(0);
  });
});

describe('profile', () => {
  it('validates phone, PIN and saves valid data persistently', async () => {
    await mount('/profile', { user: 'citizen' });
    expect(await screen.findByText('Personal information', {}, WAIT)).toBeTruthy();
    type(/Mobile number/, '12345'); type(/PIN code/, '12');
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
    await has('Enter a 10-digit mobile number'); await has('Enter a 6-digit PIN code');
    type(/Mobile number/, '9876543210'); type(/PIN code/, '570001');
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
    await has('Profile saved (demo)');
    expect(getData({ id: 'demo-citizen' }).profile).toMatchObject({ phone: '9876543210', pincode: '570001' });
    expect(JSON.parse(window.localStorage.getItem('s2a.citizen.demo-citizen')).profile.phone).toBe('9876543210');
  });
  it('lists documents and removes one', async () => {
    await mount('/profile', { user: 'citizen' });
    fireEvent.click(await screen.findByRole('button', { name: /Remove: Aadhaar card/ }, WAIT));
    await waitFor(() => expect(getData({ id: 'demo-citizen' }).documents).toHaveLength(4));
  });
});

describe('settings', () => {
  it('changes text size, reduce motion and language', async () => {
    await mount('/settings', { user: 'citizen' });
    fireEvent.click(await screen.findByRole('radio', { name: 'Extra large' }, WAIT));
    expect(document.documentElement.dataset.textsize).toBe('xl');
    fireEvent.click(screen.getByRole('switch', { name: 'Reduce motion' }));
    expect(document.documentElement.dataset.motion).toBe('reduce');
    fireEvent.click(screen.getByRole('radio', { name: 'ಕನ್ನಡ' }));
    await waitFor(() => expect(document.documentElement.lang).toBe('kn'));
  });
  it('persists notification and privacy switches', async () => {
    await mount('/settings', { user: 'citizen' });
    fireEvent.click(await screen.findByRole('switch', { name: 'SMS reminders' }, WAIT));
    fireEvent.click(screen.getByRole('switch', { name: 'Allow AI to read my uploaded documents' }));
    const s = getData({ id: 'demo-citizen' }).settings;
    expect(s.notifications.sms).toBe(true); expect(s.privacy.ai).toBe(false);
  });
  it('resets sample data and logs out', async () => {
    await mount('/settings', { user: 'citizen' });
    fireEvent.click(await screen.findByRole('button', { name: /Reset sample data/ }, WAIT));
    await has('Sample data restored');
    fireEvent.click(within(screen.getByRole('main')).getByRole('button', { name: /Log out/ }));
    expect(await screen.findByRole('heading', { level: 1, name: /Find the Support/ }, WAIT)).toBeTruthy();
    expect(demoAdapter.peekUser()).toBeNull();
  });
  it('deleting a demo account removes it', async () => {
    await registerViaService();
    await demoAdapter.login({ identifier: 'test.user', password: 'Secret123' });
    await mount('/settings');
    fireEvent.click(await screen.findByRole('button', { name: /Delete this demo account/ }, WAIT));
    const dialog = await screen.findByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Delete account' }));
    await waitFor(() => expect(demoAdapter.peekUser()).toBeNull(), WAIT);
  });
});

describe('helper mode', () => {
  it('intro explains consent and that identity is not verified', async () => {
    await mount('/helper');
    expect(await screen.findByRole('heading', { level: 1, name: 'Helper Mode' }, WAIT)).toBeTruthy();
    expect(await screen.findByText(/does not verify anyone’s identity/, {}, WAIT)).toBeTruthy();
    expect(screen.getByText(/never ask for passwords, OTPs or bank PINs/)).toBeTruthy();
  });
  it('requires all consent statements, then runs and ends a session', async () => {
    await mount('/helper/workspace', { user: 'citizen' });
    fireEvent.click(await screen.findByRole('button', { name: /Begin session/ }, WAIT));
    await has('Enter your full name (at least 2 letters)'); await has('Please confirm all three statements.');
    type(/Name of the person you are helping/, 'Lakshmi Devi');
    ['The citizen has agreed that I may help them.', 'I will not ask for or use their passwords, OTPs or bank PINs.', 'The citizen knows they can stop the session at any time.'].forEach((l) => fireEvent.click(screen.getByLabelText(l)));
    fireEvent.click(screen.getByRole('button', { name: /Begin session/ }));
    expect(await screen.findByText('You are helping Lakshmi Devi.', {}, WAIT)).toBeTruthy();
    expect(document.documentElement.dataset.textsize).toBe('large');
    expect(screen.getByText('Helper session: helping Lakshmi Devi')).toBeTruthy();
    expect(getData({ id: 'demo-citizen' }).helperSession.citizenName).toBe('Lakshmi Devi');
    fireEvent.click(screen.getByRole('radio', { name: 'ಕನ್ನಡ' }));
    await waitFor(() => expect(document.documentElement.lang).toBe('kn'));
    fireEvent.click(screen.getAllByRole('button', { name: /ಸೆಷನ್ ಮುಗಿಸಿ/ })[0]);
    await waitFor(() => expect(getData({ id: 'demo-citizen' }).helperSession).toBeNull());
    expect(document.documentElement.dataset.textsize).toBe('normal');
  });
  it('workspace requires login', async () => {
    await mount('/helper/workspace');
    expect(await screen.findByRole('heading', { level: 1, name: /Welcome back/ }, WAIT)).toBeTruthy();
  });
});
