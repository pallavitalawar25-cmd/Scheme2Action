import { MotionConfig } from 'framer-motion';
import AppRoutes from './routes';
import { usePreferences } from './context/PreferencesContext';

// reducedMotion="user" honours the OS setting; the in-app "Reduce motion" switch forces it on.
export default function App() {
  const { reduceMotion } = usePreferences();
  return (
    <MotionConfig reducedMotion={reduceMotion ? 'always' : 'user'}>
      <AppRoutes />
    </MotionConfig>
  );
}
