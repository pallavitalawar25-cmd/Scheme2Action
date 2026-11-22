import { beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, screen, waitFor, within } from '@testing-library/react';
import { mount, WAIT } from '../test/utils';
import { ApiError } from '../services/api';
import { backendApi } from '../services/backendApi';
import { groupOf } from '../pages/onboarding/OnboardingResults';
import { toProfilePatch, validateProfile, progressOf } from '../services/onboardingStore';

vi.mock('../services/backendApi', () => ({
  backendApi: { onboardingMessage: vi.fn(), patchProfile: vi.fn(), schemeMatches: vi.fn(), workspace: vi.fn(), schemes: vi.fn(), scheme: vi.fn() },
}));

const FULL = { fullName: 'Asha Rao', dateOfBirth: '2004-06-15', state: 'Karnataka', district: 'Mysuru', residence: 'urban', occupation: 'student', education: 'higher_secondary', annualIncome: 120000 };
const reply = (text, profile = {}, extra = {}) => ({ reply: text, profile, skipped: [], missing: [], progress: 30, ready: false, rejected: [], ...extra });
const type = (label, value) => fireEvent.change(screen.getByLabelText(label), { target: { value } });

beforeEach(() => { cleanup(); window.sessionStorage.clear(); window.localStorage.clear(); vi.clearAllMocks(); });

describe('AI onboarding: homepage', () => {
  it('shows the AI Citizen Onboarding card linking to the real route', async () => {
    await mount('/');
    expect((await screen.findAllByText('AI Citizen Onboarding', {}, WAIT)).length).toBeGreaterThan(0);
    expect(screen.getByText(/Tell us about yourself\. We.ll help you find the right government schemes\./)).toBeTruthy();
    expect(screen.getByText(/Answer a few simple questions in a conversation/)).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Start AI Onboarding' }).getAttribute('href')).toBe('/onboarding');
    expect(screen.getAllByRole('link', { name: 'AI Onboarding' }).length).toBeGreaterThan(0); // navigation link
  });
  it('renders in Kannada', async () => {
    await mount('/', { lang: 'kn' });
    expect((await screen.findAllByText('AI ಆನ್‌ಬೋರ್ಡಿಂಗ್ ಆರಂಭಿಸಿ', {}, WAIT)).length).toBeGreaterThan(0);
  });
});

describe('AI onboarding: conversation', () => {
  it('starts with an empty state, then the AI opens the conversation', async () => {
    backendApi.onboardingMessage.mockResolvedValueOnce(reply('Hello! What is your name?'));
    await mount('/onboarding');
    expect(await screen.findByText('Let’s prepare your citizen profile', {}, WAIT)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Start conversation' }));
    expect(await screen.findByText('Hello! What is your name?', {}, WAIT)).toBeTruthy();
    expect(backendApi.onboardingMessage).toHaveBeenCalledWith(expect.objectContaining({ language: 'en', message: '', history: [] }));
  });

  it('sends history + draft, shows loading, and rejected values are surfaced', async () => {
    backendApi.onboardingMessage.mockResolvedValueOnce(reply('What is your name?'));
    let release;
    backendApi.onboardingMessage.mockImplementationOnce(() => new Promise((r) => { release = r; }));
    await mount('/onboarding');
    fireEvent.click(await screen.findByRole('button', { name: 'Start conversation' }));
    await screen.findByText('What is your name?', {}, WAIT);
    type('Your answer', 'I am Asha Rao');
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));
    expect(await screen.findByText('I am Asha Rao')).toBeTruthy();
    expect(screen.getAllByText('The assistant is typing…').length).toBeGreaterThan(0); // loading state
    release(reply('Nice to meet you. When were you born?', { fullName: 'Asha Rao' }, { rejected: [{ field: 'dateOfBirth', reason: 'invalid_value' }] }));
    expect(await screen.findByText('Nice to meet you. When were you born?', {}, WAIT)).toBeTruthy();
    expect(screen.getByText(/could not accept the value for “Date of birth”/)).toBeTruthy();
    expect(backendApi.onboardingMessage.mock.calls[1][0]).toMatchObject({ message: 'I am Asha Rao', history: [{ role: 'assistant', content: 'What is your name?' }], profile: {} });
  });

  it('shows a clear error when Gemini is unavailable and retries without duplicating the message', async () => {
    backendApi.onboardingMessage.mockResolvedValueOnce(reply('What is your name?'));
    backendApi.onboardingMessage.mockRejectedValueOnce(new ApiError(502, { code: 'ai_unavailable', detail: 'secret internal detail' }));
    backendApi.onboardingMessage.mockResolvedValueOnce(reply('Thanks!', { fullName: 'Asha Rao' }));
    await mount('/onboarding');
    fireEvent.click(await screen.findByRole('button', { name: 'Start conversation' }));
    await screen.findByText('What is your name?', {}, WAIT);
    type('Your answer', 'Asha Rao');
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));
    const alert = await screen.findByRole('alert', {}, WAIT);
    expect(within(alert).getByText(/AI assistant is unavailable/)).toBeTruthy();
    expect(screen.queryByText(/secret internal detail/)).toBeNull();
    fireEvent.click(within(alert).getByRole('button', { name: 'Try again' }));
    expect(await screen.findByText('Thanks!', {}, WAIT)).toBeTruthy();
    expect(screen.getAllByText('Asha Rao')).toHaveLength(1); // user bubble not duplicated
    expect(backendApi.onboardingMessage.mock.calls[2][0].message).toBe('Asha Rao');
  });

  it('explains that AI onboarding needs the live server in offline demo mode', async () => {
    const err = Object.assign(new Error('Backend not connected (demo mode).'), { code: 'NO_BACKEND' });
    backendApi.onboardingMessage.mockRejectedValueOnce(err);
    await mount('/onboarding');
    fireEvent.click(await screen.findByRole('button', { name: 'Start conversation' }));
    expect(await screen.findByText(/needs the live server/, {}, WAIT)).toBeTruthy();
  });

  it('is fully available in Kannada', async () => {
    backendApi.onboardingMessage.mockResolvedValueOnce(reply('ನಮಸ್ಕಾರ! ನಿಮ್ಮ ಹೆಸರೇನು?'));
    await mount('/onboarding', { lang: 'kn' });
    fireEvent.click(await screen.findByRole('button', { name: 'ಸಂಭಾಷಣೆ ಆರಂಭಿಸಿ' }));
    expect(await screen.findByText('ನಮಸ್ಕಾರ! ನಿಮ್ಮ ಹೆಸರೇನು?', {}, WAIT)).toBeTruthy();
    expect(backendApi.onboardingMessage).toHaveBeenCalledWith(expect.objectContaining({ language: 'kn' }));
    expect(screen.getAllByText('ಪ್ರೊಫೈಲ್ ಪ್ರಗತಿ').length).toBeGreaterThan(0);
  });
});

const seedProgress = (extra = {}) => window.sessionStorage.setItem('s2a.onboarding.v1', JSON.stringify({ v: 1, at: Date.now(), data: { messages: [{ id: 'a', role: 'assistant', content: 'Hi' }], profile: FULL, skipped: ['category'], phase: 'review', awaitingAuth: false, ...extra } }));

describe('AI onboarding: review, confirmation and saving', () => {
  it('unauthenticated visitors see the sign-in gate and keep their progress', async () => {
    seedProgress();
    await mount('/onboarding');
    expect(await screen.findByText('Sign in to save your profile', {}, WAIT)).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Confirm and Save Profile' })).toBeNull();
    expect(screen.getByRole('link', { name: /Sign in/ }).getAttribute('href')).toBe('/login');
    expect(screen.getByText('Asha Rao')).toBeTruthy();
    expect(JSON.parse(window.sessionStorage.getItem('s2a.onboarding.v1')).data.awaitingAuth).toBe(true);
    expect(backendApi.patchProfile).not.toHaveBeenCalled();
  });

  it('shows missing and skipped fields honestly and lets the user edit a field before confirming', async () => {
    seedProgress();
    await mount('/onboarding', { user: 'citizen' });
    expect(await screen.findByText('Review your profile', {}, WAIT)).toBeTruthy();
    expect(screen.getAllByText('Skipped by you').length).toBe(1); // category
    expect(screen.getAllByText('Not provided').length).toBe(3); // gender, disability, circumstances: never silently assumed
    expect(screen.getByText('₹1,20,000 per year')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Edit Profile' }));
    type('District', 'Mandya'); type('Annual family income (₹)', 'abc');
    fireEvent.click(screen.getByRole('button', { name: 'Done editing' }));
    expect(await screen.findByText(/Enter a whole number in rupees/)).toBeTruthy(); // validation blocks bad edit
    type('Annual family income (₹)', '95000');
    fireEvent.click(screen.getByRole('button', { name: 'Done editing' }));
    expect(await screen.findByText('Mandya')).toBeTruthy();
    expect(screen.getByText('₹95,000 per year')).toBeTruthy();
  });

  it('requires explicit consent, saves through the profile endpoint, then opens scheme results', async () => {
    seedProgress();
    backendApi.patchProfile.mockResolvedValue({ profile: {} });
    backendApi.schemeMatches.mockResolvedValue({ profile_confirmed: true, disclaimer: 'x', items: [] });
    await mount('/onboarding', { user: 'citizen' });
    await screen.findByText('Review your profile', {}, WAIT);
    fireEvent.click(screen.getByRole('button', { name: 'Confirm and Save Profile' }));
    expect(await screen.findByText('Please tick the box to confirm before saving.')).toBeTruthy();
    expect(backendApi.patchProfile).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('checkbox', { name: /I confirm this information is correct/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Confirm and Save Profile' }));
    await waitFor(() => expect(backendApi.patchProfile).toHaveBeenCalledTimes(1), WAIT);
    expect(backendApi.patchProfile).toHaveBeenCalledWith({ ...FULL, onboardingConsent: true });
    expect(await screen.findByRole('heading', { name: 'Schemes for your profile' }, WAIT)).toBeTruthy();
    expect(window.sessionStorage.getItem('s2a.onboarding.v1')).toBeNull(); // progress cleared after save
  });

  it('keeps answers and shows an error when saving fails', async () => {
    seedProgress();
    backendApi.patchProfile.mockRejectedValueOnce(new ApiError(500, { detail: 'boom' }));
    await mount('/onboarding', { user: 'citizen' });
    await screen.findByText('Review your profile', {}, WAIT);
    fireEvent.click(screen.getByRole('checkbox', { name: /I confirm this information is correct/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Confirm and Save Profile' }));
    expect(await screen.findByText(/could not save your profile/, {}, WAIT)).toBeTruthy();
    expect(screen.getByText('Asha Rao')).toBeTruthy();
    expect(window.sessionStorage.getItem('s2a.onboarding.v1')).not.toBeNull();
  });
});

describe('AI onboarding: results', () => {
  const item = (id, outcome, extra = {}) => ({ scheme: { id, name: `Scheme ${id}`, summary: 's', source_url: 'https://example.gov.in' }, outcome, passed: [], failed: [], missing: [], next_action: 'Do the next thing', sources: [], ...extra });
  it('groups deterministic outcomes into the four labels with reasons', async () => {
    backendApi.schemeMatches.mockResolvedValue({ profile_confirmed: true, disclaimer: 'x', items: [
      item('a', 'PASS', { passed: [{ code: 'karnataka', question_en: 'Are you a resident of Karnataka?' }] }),
      item('b', 'FAIL', { failed: [{ code: 'student', question_en: 'Are you a student?' }] }),
      item('c', 'NEEDS_VERIFICATION', { missing: [{ code: 'postMatric', question_en: 'Post-matric course?' }] }),
      item('d', 'NEEDS_VERIFICATION'),
    ] });
    await mount('/onboarding/results', { user: 'citizen' });
    for (const label of ['Likely Eligible', 'Not Eligible', 'Needs More Information', 'Needs Verification']) expect((await screen.findAllByText(label, {}, WAIT)).length).toBeGreaterThan(0);
    expect(screen.getByText('Are you a resident of Karnataka?')).toBeTruthy();
    expect(screen.getByText('Post-matric course?')).toBeTruthy();
    expect(screen.getAllByRole('link', { name: 'Prepare application' })[0].getAttribute('href')).toBe('/apply/a/eligibility');
    expect(backendApi.schemeMatches).toHaveBeenCalledWith('en');
  });
  it('nudges unconfirmed profiles and handles load errors with retry', async () => {
    backendApi.schemeMatches.mockRejectedValueOnce(new Error('x')).mockResolvedValueOnce({ profile_confirmed: false, disclaimer: 'x', items: [item('d', 'NEEDS_VERIFICATION')] });
    await mount('/onboarding/results', { user: 'citizen' });
    fireEvent.click(await screen.findByRole('button', { name: 'Try again' }, WAIT));
    expect(await screen.findByText(/has not been confirmed through AI onboarding/, {}, WAIT)).toBeTruthy();
  });
  it('requires sign-in', async () => {
    await mount('/onboarding/results');
    expect(await screen.findByText('Log in to continue your applications.', {}, WAIT)).toBeTruthy(); // redirected to login
    expect(screen.queryByRole('heading', { name: 'Schemes for your profile' })).toBeNull();
    expect(backendApi.schemeMatches).not.toHaveBeenCalled();
  });
});

describe('onboarding helpers', () => {
  it('validates like the server', () => {
    expect(validateProfile({ fullName: 'A', dateOfBirth: '2999-01-01', state: 'K4', annualIncome: '-5' })).toEqual({ fullName: 'ob.v.name', dateOfBirth: 'ob.v.dob', state: 'ob.v.place', annualIncome: 'ob.v.income' });
    expect(validateProfile(FULL)).toEqual({});
    expect(validateProfile({})).toEqual({});
  });
  it('builds a consented patch with only provided values', () => {
    expect(toProfilePatch({ fullName: ' Asha  Rao ', annualIncome: '0', circumstances: [], district: '' })).toEqual({ fullName: 'Asha Rao', annualIncome: 0, circumstances: [], onboardingConsent: true });
  });
  it('computes progress and groups outcomes', () => {
    expect(progressOf({}, [])).toBe(0);
    expect(progressOf(FULL, ['category'])).toBe(Math.round((9 / 12) * 100));
    expect(groupOf({ outcome: 'NEEDS_VERIFICATION', missing: [] })).toBe('needsVerification');
    expect(groupOf({ outcome: 'NEEDS_VERIFICATION', missing: [{}] })).toBe('needsInfo');
  });
});
