import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { AlertCircle, AtSign, Mail, User } from 'lucide-react';
import Button from '../../components/common/Button';
import T from '../../components/common/T';
import { TextField } from '../../components/forms/FormField';
import PasswordField from '../../components/forms/PasswordField';
import PasswordStrength from '../../components/forms/PasswordStrength';
import CheckboxField from '../../components/forms/CheckboxField';
import DemoAuthNotice from '../../components/auth/DemoAuthNotice';
import useForm from '../../hooks/useForm';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { checked, collect, email, fullName, matches, password, username } from '../../utils/validators';
import { authErrorKey, homeFor } from './authHelpers';

const validate = (v) => collect({
  name: fullName(v.name), email: email(v.email), username: username(v.username),
  password: password(v.password), confirm: matches(v.password)(v.confirm), consent: checked(v.consent),
});

export default function Register() {
  const { register, isAuthenticated, user } = useAuth();
  const { t } = useLanguage();
  const toast = useToast();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState(null);
  const [busy, setBusy] = useState(false);
  const form = useForm({ initial: { name: '', email: '', username: '', password: '', confirm: '', consent: false }, validate });

  if (isAuthenticated && !busy) return <Navigate to={homeFor(user)} replace />;

  const onSubmit = form.handleSubmit(async (v) => {
    setBusy(true); setServerError(null);
    try {
      const u = await register({ name: v.name, email: v.email, username: v.username, password: v.password });
      toast.success(t('toast.accountCreated'), 2600);
      navigate(homeFor(u), { replace: true });
    } catch (e) { setServerError(authErrorKey(e)); setBusy(false); }
  });

  return (
    <div className="authform">
      <header><h1><T k="auth.register.title" /></h1><p className="muted"><T k="auth.register.sub" /></p></header>
      <DemoAuthNotice />
      <form onSubmit={onSubmit} noValidate className="authform__fields" aria-label={t('auth.createAccount')}>
        {serverError && <p className="formalert" role="alert"><AlertCircle size={18} aria-hidden="true" /><T k={serverError} /></p>}
        <TextField label={t('auth.fullName')} icon={User} autoComplete="name" required {...form.bind('name')} />
        <TextField label={t('auth.email')} type="email" icon={Mail} autoComplete="email" required {...form.bind('email')} />
        <TextField label={t('auth.username')} icon={AtSign} autoComplete="username" hint={t('auth.username.hint')} required {...form.bind('username')} />
        <div>
          <PasswordField label={t('auth.password')} autoComplete="new-password" hint={t('auth.password.hint')} required {...form.bind('password')} />
          <PasswordStrength value={form.values.password} />
        </div>
        <PasswordField label={t('auth.confirmPassword')} autoComplete="new-password" required {...form.bind('confirm')} />
        <CheckboxField label={<T k="auth.consent" />} {...form.bindCheck('consent')} />
        <p className="muted authform__hint"><T k="auth.consent.note" /></p>
        <Button type="submit" size="lg" block loading={busy}><T k="auth.createAccount" /></Button>
      </form>
      <p className="authform__switch"><T k="auth.haveAccount" /> <Link to="/login"><T k="nav.login" /></Link></p>
    </div>
  );
}
