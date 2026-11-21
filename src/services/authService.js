// Facade the UI talks to. Chooses the demo adapter, or the real FastAPI adapter when VITE_API_BASE_URL is set.
import demoAdapter from './auth/demoAdapter';
import apiAdapter from './auth/apiAdapter';
import { isBackendConnected } from './api';

export { AuthError } from './auth/AuthError';
const authService = isBackendConnected() ? apiAdapter : demoAdapter;
export const AUTH_MODE = authService.mode; // 'demo' | 'api'
export default authService;
