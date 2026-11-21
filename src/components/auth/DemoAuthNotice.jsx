import { ShieldAlert } from 'lucide-react';
import T from '../common/T';
import { useAuth } from '../../context/AuthContext';

// Shown on every auth screen while the demo adapter is active. Never claims the demo login is secure.
export default function DemoAuthNotice() {
  const { isDemoAuth } = useAuth();
  if (!isDemoAuth) return null;
  return (
    <aside className="authnotice" role="note">
      <ShieldAlert size={20} aria-hidden="true" />
      <div><strong><T k="auth.demo.title" /></strong><p><T k="auth.demo.body" /></p></div>
    </aside>
  );
}
