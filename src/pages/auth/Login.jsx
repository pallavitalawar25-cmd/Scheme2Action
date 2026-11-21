import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, ShieldCheck, User, UserRound } from 'lucide-react';
import Button from '../../components/common/Button';
import T from '../../components/common/T';
import { TextField } from '../../components/forms/FormField';
import PasswordField from '../../components/forms/PasswordField';
import CheckboxField from '../../components/forms/CheckboxField';
import DemoAuthNotice from '../../components/auth/DemoAuthNotice';
import useForm from '../../hooks/useForm';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { collect, required } from '../../utils/validators';
import { authErrorKey, safeRedirect } from './authHelpers';

const validate = (v) => collect({ identifier: required(v.identifier), password: required(v.password) });

export default function Login() {
  const { login, quickLogin, isAuthenticated, user, canQuickLogin } = useAuth();
  const { t } = useLanguage();
  const toast = useToast();
  const navigate = useNavigate();
  const from = useLocation().state?.from;
  const [serverError, setServerError] = useState(null);
  const [busy, setBusy] = useState(false);
  const form = useForm({ initial: { identifier: '', password: '', remember: false }, validate });

  if (isAuthenticated) return <Navigate to={safeRedirect(from, user)} replace />;

  const finish = (u) => { toast.success(t('toast.welcome', { name: u.name }), 2600); navigate(safeRedirect(from, u), { replace: true }); };
  const onSubmit = form.handleSubmit(async (v) => {
    setBusy(true); setServerError(null);
    try { finish(await login(v)); } catch (e) { setServerError(authErrorKey(e)); } finally { setBusy(false); }
  });
  const demo = async (role) => { setBusy(true); try { finish(await quickLogin(role)); } finally { setBusy(false); } };

  return (
    <div className="authform">
      <header><h1><T k="auth.loginTitle" /></h1><p className="muted"><T k="auth.login.sub" /></p></header>
      <DemoAuthNotice />
      <form onSubmit={onSubmit} noValidate className="authform__fields" aria-label={t('auth.loginBtn')}>
        {serverError && <p className="formalert" role="alert"><AlertCircle size={18} aria-hidden="true" /><T k={serverError} /></p>}
        <TextField label={t('auth.identifier')} icon={User} autoComplete="username" required {...form.bind('identifier')} />
        <PasswordField label={t('auth.password')} required {...form.bind('password')} />
        <div className="authform__row">
          <CheckboxField label={<T k="auth.remember" />} {...form.bindCheck('remember')} />
          <Link to="/forgot-password" className="authform__link"><T k="auth.forgot" /></Link>
        </div>
        <Button type="submit" size="lg" block loading={busy}><T k="auth.loginBtn" /></Button>
      </form>
      {canQuickLogin && (
        <div className="authform__demo">
          <p className="authform__or"><span><T k="auth.or" /></span></p>
          <div className="authform__demobtns">
            <Button variant="primary" size="lg" block iconLeft={UserRound} onClick={() => demo('citizen')} disabled={busy}><T k="auth.demoCitizen" /></Button>
            <Button variant="ghost" iconLeft={ShieldCheck} onClick={() => demo('admin')} disabled={busy}><T k="auth.demoAdmin" /></Button>
          </div>
          <p className="muted authform__hint"><T k="auth.demoHint" /></p>
        </div>
      )}
      <p className="authform__switch"><T k="auth.noAccount" /> <Link to="/register"><T k="auth.createAccount" /></Link></p>
    </div>
  );
}
