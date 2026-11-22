import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { PreferencesProvider } from './context/PreferencesContext';
import { ToastProvider } from './context/ToastContext';
import './styles/variables.css';
import './styles/global.css';
import './styles/animations.css';
import './styles/components.css';
import './styles/layout.css';
import './styles/pages.css';
import './styles/schemes.css';
import './styles/home.css';
import './styles/citizen.css';
import './styles/admin.css';
import './styles/onboarding.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <PreferencesProvider>
          <AuthProvider>
            <ToastProvider>
              <App />
            </ToastProvider>
          </AuthProvider>
        </PreferencesProvider>
      </LanguageProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
