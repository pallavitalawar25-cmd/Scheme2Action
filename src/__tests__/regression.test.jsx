// Batch 1 + 2 behaviour must keep working after every later batch.
import { describe, expect, it } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { mount, WAIT } from '../test/utils';

const has = (re) => waitFor(() => expect(screen.getAllByText(re).length).toBeGreaterThan(0), WAIT);

describe('Batch 1-2 regression', () => {
  it('home renders hero + featured schemes + sections', async () => {
    await mount('/');
    expect(await screen.findByRole('heading', { level: 1, name: /Find the Support You May Be Entitled To/ }, WAIT)).toBeTruthy();
    expect((await screen.findAllByText(/PM-KISAN/, {}, WAIT)).length).toBeGreaterThan(0);
    expect(screen.getAllByText('AI Assists. Verified Rules Decide.').length).toBeGreaterThan(0);
  });
  it('home in Kannada', async () => {
    await mount('/', { lang: 'kn' });
    expect(await screen.findByText('ನಿಮಗೆ ಅರ್ಹವಾಗಬಹುದಾದ ಸಹಾಯವನ್ನು ಹುಡುಕಿ.', {}, WAIT)).toBeTruthy();
  });
  [
    ['/schemes', /11 schemes/], ['/schemes?q=scholarship', /^2 schemes$/], ['/schemes?q=ವಿದ್ಯಾರ್ಥಿವೇತನ', /^2 schemes$/],
    ['/schemes?level=karnataka', /^5 schemes$/], ['/schemes?level=central', /^6 schemes$/], ['/schemes?cat=pension', /^2 schemes$/],
    ['/schemes?ver=verified', /^1 scheme$/], ['/schemes?level=karnataka&cat=education&ver=verified', /^1 scheme$/],
  ].forEach(([path, re]) => it(`catalogue ${path}`, async () => { await mount(path); await has(re); }));
  it('catalogue empty + error + retry', async () => {
    await mount('/schemes?q=zzzzqq');
    expect(await screen.findByText('No schemes match your search', {}, WAIT)).toBeTruthy();
  });
  it('catalogue error then retry', async () => {
    await mount('/schemes?simulateError=1');
    expect(await screen.findByText('We could not load schemes', {}, WAIT)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Try again/ }));
    await has(/11 schemes/);
  });
  it('catalogue live search, load more, list view', async () => {
    await mount('/schemes'); await has(/11 schemes/);
    expect(screen.getByText(/Showing 9 of 11/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Load more schemes/ }));
    await waitFor(() => expect(screen.getByText(/Showing 11 of 11/)).toBeTruthy());
    fireEvent.change(screen.getAllByRole('combobox')[0], { target: { value: 'farmer' } });
    await has(/^1 scheme$/);
    fireEvent.click(screen.getByRole('button', { name: 'List view' }));
  });
  it('catalogue in Kannada', async () => { await mount('/schemes?level=karnataka', { lang: 'kn' }); await has('5 ಯೋಜನೆಗಳು'); });
  ['education', 'agriculture', 'healthcare', 'women-children', 'housing', 'pension', 'employment', 'food'].forEach((slug) => it(`category ${slug}`, async () => {
    await mount(`/categories/${slug}`);
    expect(await screen.findByText('Central Government schemes', {}, WAIT)).toBeTruthy();
    expect(screen.getByText('Karnataka State Government schemes')).toBeTruthy();
  }));
  it('unknown category -> not found', async () => { await mount('/categories/nope'); expect(await screen.findByText('Page not found', {}, WAIT)).toBeTruthy(); });
  it('details: sample document list only for the scholarship demo', async () => {
    await mount('/schemes/ssp-post-matric-scholarship');
    expect(await screen.findByRole('heading', { level: 1, name: /Post-Matric Scholarship/ }, WAIT)).toBeTruthy();
    expect(screen.getByText('Aadhaar card')).toBeTruthy(); expect(screen.getByText('Sample list for demonstration')).toBeTruthy();
  });
  it('details: pending scheme invents no rules', async () => {
    await mount('/schemes/pm-kisan');
    expect(await screen.findByText(/Detailed eligibility conditions are still being verified/, {}, WAIT)).toBeTruthy();
    expect(screen.getByText(/official document list is being verified/)).toBeTruthy();
  });
  it('details: not found and Kannada', async () => {
    await mount('/schemes/nope'); expect(await screen.findByText('Scheme not found', {}, WAIT)).toBeTruthy();
  });
  it('details in Kannada', async () => {
    await mount('/schemes/gruha-lakshmi', { lang: 'kn' });
    expect((await screen.findAllByText('ಗೃಹ ಲಕ್ಷ್ಮಿ', {}, WAIT)).length).toBeGreaterThan(0);
    expect(screen.getAllByText('ನನ್ನ ಅರ್ಹತೆ ಪರಿಶೀಲಿಸಿ').length).toBeGreaterThan(0);
  });
  it('how-it-works, about, categories index, design system', async () => {
    await mount('/how-it-works'); await has('Discover a scheme');
  });
  it('about page', async () => { await mount('/about'); expect(await screen.findByText('Independent, and clear about it', {}, WAIT)).toBeTruthy(); });
  it('categories index', async () => { await mount('/categories'); await has('Food & Ration'); });
  it('design system', async () => { await mount('/design-system'); expect(await screen.findByText('Design system', {}, WAIT)).toBeTruthy(); });
  it('application journey placeholders keep working when signed in', async () => {
    await mount('/apply/ssp-post-matric-scholarship/upload', { user: 'citizen' });
    expect(await screen.findByText('Document Upload', {}, WAIT)).toBeTruthy();
    expect(screen.getAllByText(/Step 4 of 9/).length).toBeGreaterThan(0);
  });
  it('scheme eligibility CTA survives demo login and opens the selected scheme questionnaire', async () => {
    await mount('/schemes/ssp-post-matric-scholarship');
    fireEvent.click((await screen.findAllByRole('link', { name: /Check My Eligibility/ }, WAIT))[0]);
    fireEvent.click(await screen.findByRole('button', { name: /Continue as demo citizen/ }, WAIT));
    expect(await screen.findByRole('heading', { name: /Eligibility questionnaire/ }, WAIT)).toBeTruthy();
    expect(screen.getByText(/Post-Matric Scholarship/)).toBeTruthy();
  });
  it('needs verification results explain missing rules and keep all result sections populated', async () => {
    await mount('/apply/pmay/results', { user: 'citizen' });
    expect(await screen.findByRole('heading', { name: 'Needs verification' }, WAIT)).toBeTruthy();
    expect(screen.getByText(/No conditions were evaluated because reviewed demonstration rules are not available/)).toBeTruthy();
    expect(screen.getByText(/No conditions were confirmed as passed/)).toBeTruthy();
    expect(screen.getByText(/No conditions were confirmed as not satisfied/)).toBeTruthy();
    expect(screen.getByText(/Check the official scheme guidance/)).toBeTruthy();
  });
  it('pass and fail result layouts show evaluated conditions and meaningful empty states', async () => {
    const appKey = 's2a.application.demo-citizen.ssp-post-matric-scholarship';
    window.localStorage.setItem(appKey, JSON.stringify({ answers: { student: 'yes', karnataka: 'yes', postMatric: 'yes', incomeKnown: 'yes' } }));
    const { unmount } = await mount('/apply/ssp-post-matric-scholarship/results', { user: 'citizen' });
    expect(await screen.findByRole('heading', { name: /Likely eligible/ }, WAIT)).toBeTruthy();
    expect(screen.getByText('Are you currently a student?')).toBeTruthy();
    unmount();
    window.localStorage.setItem(appKey, JSON.stringify({ answers: { student: 'no', karnataka: 'no', postMatric: 'no' } }));
    await mount('/apply/ssp-post-matric-scholarship/results', { user: 'citizen' });
    expect(await screen.findByRole('heading', { name: /Not eligible under these demo rules/ }, WAIT)).toBeTruthy();
    expect(screen.getByText('No required information is currently missing.')).toBeTruthy();
  });
  it('admin routes are available only to demo admin and render their real pages', async () => {
    for (const [path, title] of [['/admin', 'Administration overview'], ['/admin/schemes', 'Scheme management'], ['/admin/schemes/new', 'Add a scheme record'], ['/admin/schemes/ssp-post-matric-scholarship/edit', 'Edit scheme record'], ['/admin/schemes/ssp-post-matric-scholarship/history', 'Scheme version history'], ['/admin/schemes/ssp-post-matric-scholarship/sources', 'Official source management'], ['/admin/sources', 'Official source management'], ['/admin/rulebook', 'Rulebook verification'], ['/admin/rulebook/draft-ssp-01/history', 'Rule review history'], ['/admin/policy-changes', 'Policy change review']]) {
      const { unmount } = await mount(path, { user: 'admin' });
      expect((await screen.findAllByText(title, {}, WAIT)).length).toBeGreaterThan(0);
      unmount();
    }
  });
  it('admin human review and scheme version actions are explicit and browser-local', async () => {
    const { unmount } = await mount('/admin/rulebook', { user: 'admin' });
    fireEvent.click(await screen.findAllByRole('button', { name: /Approve after review/ }, WAIT).then((buttons) => buttons[0]));
    expect((await screen.findAllByText('Human approved (demo)', {}, WAIT)).length).toBeGreaterThan(1);
    unmount();
    await mount('/admin/schemes/ssp-post-matric-scholarship/edit', { user: 'admin' });
    fireEvent.change(screen.getByLabelText('Scheme name — English'), { target: { value: 'Test Scholarship Name' } });
    fireEvent.click(screen.getByRole('button', { name: /Save demonstration record/ }));
    expect(await screen.findByText('v2', {}, WAIT)).toBeTruthy();
  });
});
