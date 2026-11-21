import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';
import { LanguageProvider } from '../context/LanguageContext';
import { AuthProvider } from '../context/AuthContext';
import { PreferencesProvider } from '../context/PreferencesContext';
import { ToastProvider } from '../context/ToastContext';
import demoAdapter from '../services/auth/demoAdapter';

// Mounts the full app at a path. user: 'citizen' | 'admin' signs in through the demo adapter first.
export async function mount(path, { lang, user } = {}) {
  if (lang) window.localStorage.setItem('s2a.language', lang);
  if (user) await demoAdapter.quickLogin(user);
  const query = path.split('?')[1];
  if (query) window.history.pushState({}, '', `/?${query}`);
  return render(
    <MemoryRouter initialEntries={[path]}>
      <LanguageProvider><PreferencesProvider><AuthProvider><ToastProvider><App /></ToastProvider></AuthProvider></PreferencesProvider></LanguageProvider>
    </MemoryRouter>,
  );
}
export const WAIT = { timeout: 8000 };
