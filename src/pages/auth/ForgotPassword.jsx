import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, FlaskConical, Mail, MailCheck } from 'lucide-react';
import Button from '../../components/common/Button';
import T from '../../components/common/T';
import { TextField } from '../../components/forms/FormField';
import useForm from '../../hooks/useForm';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { collect, email } from '../../utils/validators';

const validate = (v) => collect({ email: email(v.email) });

export default function ForgotPassword() {
  const { requestPasswordReset, isDemoAuth } = useAuth();
  const { t } = useLanguage();
  const [sentTo, setSentTo] = useState(null);
  const [busy, setBusy] = useState(false);
  const form = useForm({ initial: { email: '' }, validate });

  const onSubmit = form.handleSubmit(async (v) => {
    setBusy(true);
    try { await requestPasswordReset(v.email.trim()); } catch { /* same response either way, so existence is never revealed */ } finally { setBusy(false); setSentTo(v.email.trim()); }
  });

  if (sentTo) {
    return (
      <motion.div className="authform" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}>
        <span className="authform__badge"><MailCheck size={30} aria-hidden="true" /></span>
        <h1><T k="auth.forgot.sent.title" /></h1>
        <p><T k="auth.forgot.sent.body" vars={{ email: sentTo }} /></p>
        {isDemoAuth && <p className="demonotice"><FlaskConical size={17} aria-hidden="true" /><T k="auth.forgot.demo" /></p>}
        <Button to="/login" variant="secondary" iconLeft={ArrowLeft}><T k="auth.backToLogin" /></Button>
      </motion.div>
    );
  }
  return (
    <div className="authform">
      <header><h1><T k="auth.forgot.title" /></h1><p className="muted"><T k="auth.forgot.sub" /></p></header>
      <p className="demonotice"><FlaskConical size={17} aria-hidden="true" /><T k="auth.forgot.demo" /></p>
      <form onSubmit={onSubmit} noValidate className="authform__fields" aria-label={t('auth.forgot.title')}>
        <TextField label={t('auth.email')} type="email" icon={Mail} autoComplete="email" required {...form.bind('email')} />
        <Button type="submit" size="lg" block loading={busy}><T k="auth.forgot.send" /></Button>
      </form>
      <p className="authform__switch"><Link to="/login"><T k="auth.backToLogin" /></Link></p>
    </div>
  );
}
