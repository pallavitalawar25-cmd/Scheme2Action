import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, Bot, ClipboardCheck, Lock, MessageCircle, RotateCcw, SendHorizontal, ShieldCheck, Sparkles, UserRound } from 'lucide-react';
import Button from '../../components/common/Button';
import PageHeader from '../../components/common/PageHeader';
import ProfileReview from '../../components/onboarding/ProfileReview';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { ApiError } from '../../services/api';
import { backendApi } from '../../services/backendApi';
import { OPTIONS, clearProgress, emptyProgress, loadProgress, nextMissing, optionKey, progressOf, saveProgress, toProfilePatch } from '../../services/onboardingStore';

const QUICK_FIELDS = ['residence', 'occupation', 'education', 'gender', 'category', 'disability'];
const OPTIONAL = ['gender', 'category', 'disability', 'circumstances'];
let nextId = 1;
const mid = () => `m${Date.now()}-${nextId++}`;

// Maps any thrown error to a translation key (never shows raw server or stack text).
const errorKey = (e) => {
  if (e?.code === 'NO_BACKEND') return 'ob.err.demo';
  if (e instanceof ApiError) return ['ai_not_configured', 'ai_unavailable', 'rate_limited'].includes(e.code) ? `ob.err.${e.code}` : e.status === 429 ? 'ob.err.rate_limited' : 'ob.err.generic';
  return 'ob.err.network';
};

export default function AIOnboarding() {
  const { t, language } = useLanguage();
  const { isAuthenticated, status: authStatus, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [initial] = useState(() => loadProgress() || emptyProgress());
  const [messages, setMessages] = useState(initial.messages);
  const [profile, setProfile] = useState(initial.profile);
  const [skipped, setSkipped] = useState(initial.skipped);
  const [phase, setPhase] = useState(initial.phase);
  const [restored, setRestored] = useState(Boolean(initial.awaitingAuth) && initial.phase === 'review');
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null); // { key, retry }
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const endRef = useRef(null);
  const inputRef = useRef(null);
  const progress = progressOf(profile, skipped);

  // Persist progress so a visitor can sign in/register and return. Cleared after a successful save.
  useEffect(() => { if (phase !== 'done') saveProgress({ messages, profile, skipped, phase, awaitingAuth: restored ? true : !isAuthenticated && phase === 'review' }); }, [messages, profile, skipped, phase, isAuthenticated, restored]);
  useEffect(() => { endRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'end' }); }, [messages, busy, error]);
  useEffect(() => { if (!busy && phase === 'chat') inputRef.current?.focus(); }, [busy, phase]);

  const ask = useCallback(async ({ text, history }) => {
    setBusy(true); setError(null); setNotice('');
    try {
      const res = await backendApi.onboardingMessage({ language, message: text, history: history.slice(-20), profile, skipped });
      setMessages((m) => [...m, { id: mid(), role: 'assistant', content: res.reply }]);
      setProfile(res.profile); setSkipped(res.skipped);
      if (res.rejected?.length) setNotice(t('ob.rejected', { field: res.rejected.map((r) => t(`ob.field.${r.field}`) === `ob.field.${r.field}` ? r.field : t(`ob.field.${r.field}`)).join(', ') }));
    } catch (e) {
      setError({ key: errorKey(e), retry: () => ask({ text, history }) });
    } finally { setBusy(false); }
  }, [language, profile, skipped, t]);

  const start = () => { setPhase('chat'); ask({ text: '', history: [] }); };
  const send = (raw) => {
    const text = (raw ?? input).trim();
    if (!text || busy) return;
    const history = messages.filter((m) => m.content).map(({ role, content }) => ({ role, content }));
    setMessages((m) => [...m, { id: mid(), role: 'user', content: text.slice(0, 1000) }]);
    setInput('');
    ask({ text: text.slice(0, 1000), history });
  };
  const restart = () => {
    if (messages.length && !window.confirm(t('ob.restart.confirm'))) return;
    clearProgress(); const e = emptyProgress();
    setMessages(e.messages); setProfile(e.profile); setSkipped(e.skipped); setPhase('intro'); setError(null); setNotice(''); setRestored(false); setSaveError('');
  };

  const confirmSave = async () => {
    setSaving(true); setSaveError('');
    try {
      await backendApi.patchProfile(toProfilePatch(profile)); // the existing authenticated profile endpoint
      clearProgress(); setPhase('done');
      toast.success(t('ob.review.saved'));
      navigate('/onboarding/results', { replace: true });
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) { setSaveError(t('ob.review.sessionExpired')); try { await logout(); } catch { /* already signed out */ } } else setSaveError(t('ob.review.saveError'));
    } finally { setSaving(false); }
  };

  const missing = nextMissing(profile, skipped);
  const quick = phase === 'chat' && !busy && !error && QUICK_FIELDS.includes(missing) ? missing : null;
  const lastIsAssistant = messages[messages.length - 1]?.role === 'assistant';

  return (
    <div className="container section onboard">
      <PageHeader icon={Sparkles} title={t('ob.page.title')} description={t('ob.page.desc')} actions={<Button to="/" variant="ghost" iconLeft={ArrowLeft}>{t('ob.back')}</Button>} />

      {phase === 'intro' && (
        <section className="card obintro" aria-labelledby="obintro-h">
          <span className="obintro__art" aria-hidden="true"><MessageCircle size={40} /></span>
          <h2 id="obintro-h">{t('ob.empty.title')}</h2>
          <p>{t('ob.empty.desc')}</p>
          <ul className="obintro__pts">
            <li><Lock size={18} aria-hidden="true" />{t('ob.empty.p1')}</li>
            <li><ClipboardCheck size={18} aria-hidden="true" />{t('ob.empty.p2')}</li>
            <li><ShieldCheck size={18} aria-hidden="true" />{t('ob.empty.p3')}</li>
          </ul>
          <Button size="lg" iconLeft={Sparkles} onClick={start} loading={busy}>{t('ob.empty.start')}</Button>
          {error && <ErrorBanner error={error} t={t} />}
        </section>
      )}

      {phase === 'review' && (
        <>
          {restored && isAuthenticated && <p className="callout" role="status">{t('ob.restored')}</p>}
          <ProfileReview profile={profile} skipped={skipped} isAuthenticated={isAuthenticated && authStatus === 'ready'} saving={saving} saveError={saveError}
            onChange={(next) => { setProfile(next); setSkipped((s) => s.filter((f) => !(f in next))); }} onBack={() => setPhase('chat')} onConfirm={confirmSave} />
        </>
      )}

      {phase === 'chat' && (
        <div className="obchat card">
          <div className="obchat__top">
            <div className="obprogress" role="group" aria-label={t('ob.progress.label')}>
              <div className="obprogress__meta"><strong>{t('ob.progress.label')}</strong><span>{t('ob.progress.value', { percent: progress })}</span></div>
              <div className="obprogress__bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow={progress} aria-label={t('ob.progress.label')}><span style={{ width: `${progress}%` }} /></div>
            </div>
            <Button variant="ghost" size="sm" iconLeft={RotateCcw} onClick={restart}>{t('ob.btn.restart')}</Button>
          </div>

          <div className="obchat__log" role="log" aria-live="polite" aria-label={t('ob.chat.label')}>
            {messages.map((m) => (
              <div key={m.id} className={`obmsg obmsg--${m.role}`}>
                <span className="obmsg__avatar" aria-hidden="true">{m.role === 'user' ? <UserRound size={18} /> : <Bot size={18} />}</span>
                <div className="obmsg__bubble"><span className="sr-only">{t(m.role === 'user' ? 'ob.chat.you' : 'ob.chat.assistant')}: </span>{m.content}</div>
              </div>
            ))}
            {busy && <div className="obmsg obmsg--assistant" role="status"><span className="obmsg__avatar" aria-hidden="true"><Bot size={18} /></span><div className="obmsg__bubble obmsg__typing" aria-label={t('ob.chat.typing')}><i /><i /><i /><span className="sr-only">{t('ob.chat.typing')}</span></div></div>}
            {notice && <p className="obnotice" role="status">{notice}</p>}
            {error && <ErrorBanner error={error} t={t} busy={busy} />}
            <div ref={endRef} />
          </div>

          {quick && lastIsAssistant && (
            <div className="obquick" role="group" aria-label={t('ob.chat.quick')}>
              {OPTIONS[quick].map((o) => <button type="button" key={o} className="chip chip--select" onClick={() => send(t(optionKey(quick, o)))}>{t(optionKey(quick, o))}</button>)}
              {OPTIONAL.includes(quick) && <button type="button" className="chip chip--select obquick__skip" onClick={() => send(t('ob.chat.skip'))}>{t('ob.chat.skip')}</button>}
            </div>
          )}

          <form className="obchat__form" onSubmit={(e) => { e.preventDefault(); send(); }}>
            <label htmlFor="ob-input" className="sr-only">{t('ob.chat.inputLabel')}</label>
            <input id="ob-input" ref={inputRef} className="input" value={input} maxLength={1000} autoComplete="off" disabled={busy || Boolean(error)} placeholder={t('ob.chat.placeholder')} onChange={(e) => setInput(e.target.value)} />
            <Button type="submit" iconLeft={SendHorizontal} disabled={!input.trim() || busy || Boolean(error)}>{t('ob.chat.send')}</Button>
          </form>
          <p className="obchat__privacy"><Lock size={14} aria-hidden="true" /> {t('ob.chat.privacy')}</p>
          <div className="obchat__foot">
            <Button variant={progress === 100 ? 'primary' : 'secondary'} iconLeft={ClipboardCheck} disabled={busy || Object.keys(profile).length === 0} onClick={() => setPhase('review')}>{t('ob.btn.review')}</Button>
          </div>
        </div>
      )}
    </div>
  );
}

function ErrorBanner({ error, t, busy }) {
  return (
    <div className="oberror" role="alert">
      <AlertTriangle size={20} aria-hidden="true" />
      <div><strong>{t('ob.err.title')}</strong><p>{t(error.key)}</p></div>
      {error.key !== 'ob.err.demo' && <Button size="sm" variant="secondary" iconLeft={RotateCcw} disabled={busy} onClick={error.retry}>{t('ob.err.retry')}</Button>}
    </div>
  );
}
