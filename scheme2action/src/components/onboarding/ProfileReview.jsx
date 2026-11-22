import { useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, LogIn, Pencil, ShieldCheck, UserPlus } from 'lucide-react';
import Button from '../common/Button';
import { SelectField, TextField } from '../forms/FormField';
import CheckboxField from '../forms/CheckboxField';
import { useLanguage } from '../../context/LanguageContext';
import { ALL_FIELDS, OPTIONS, isFilled, optionKey, validateProfile } from '../../services/onboardingStore';

const TEXT_FIELDS = ['fullName', 'dateOfBirth', 'state', 'district', 'annualIncome'];
const fmtIncome = (n, lang) => `₹${Number(n).toLocaleString(lang === 'kn' ? 'kn-IN' : 'en-IN')}`;

export default function ProfileReview({ profile, skipped, isAuthenticated, saving, saveError, onChange, onBack, onConfirm }) {
  const { t, language } = useLanguage();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(profile);
  const [consent, setConsent] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const errors = useMemo(() => validateProfile(editing ? draft : profile), [editing, draft, profile]);
  const set = (field, value) => setDraft((d) => ({ ...d, [field]: value }));

  const display = (field) => {
    if (!isFilled(profile, field)) return <span className="obreview__empty">{t(skipped.includes(field) ? 'ob.review.skipped' : 'ob.review.notProvided')}</span>;
    const v = profile[field];
    if (field === 'circumstances') return v.length ? v.map((c) => t(optionKey(field, c))).join(', ') : t('ob.review.none');
    if (field === 'annualIncome') return `${fmtIncome(v, language)} ${t('ob.unit.rupees')}`;
    if (field === 'dateOfBirth') return new Date(`${v}T00:00:00`).toLocaleDateString(language === 'kn' ? 'kn-IN' : 'en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    return OPTIONS[field] ? t(optionKey(field, v)) : v;
  };

  const finishEdit = () => {
    if (Object.keys(validateProfile(draft)).length) { setShowErrors(true); return; }
    const next = { ...profile };
    ALL_FIELDS.forEach((f) => {
      const raw = draft[f];
      if (f === 'circumstances') { if (Array.isArray(raw)) next[f] = raw; else delete next[f]; return; }
      if (raw === '' || raw === undefined || raw === null) { delete next[f]; return; }
      next[f] = f === 'annualIncome' ? Number(raw) : typeof raw === 'string' ? raw.trim() : raw;
    });
    onChange(next);
    setEditing(false); setShowErrors(false);
  };
  const startEdit = () => { setDraft({ ...profile, annualIncome: profile.annualIncome ?? '' }); setEditing(true); setShowErrors(false); };

  const [consentError, setConsentError] = useState(false);
  const confirm = () => {
    if (Object.keys(errors).length) { setShowErrors(true); return; }
    if (!profile.fullName) { setShowErrors(true); return; }
    if (!consent) { setConsentError(true); return; }
    onConfirm();
  };
  const err = (f) => (showErrors && errors[f] ? t(errors[f]) : undefined);
  const select = (field, label) => (
    <SelectField key={field} label={label} value={draft[field] ?? ''} onChange={(e) => set(field, e.target.value)}>
      <option value="">{t('ob.select')}</option>
      {OPTIONS[field].map((o) => <option key={o} value={o}>{t(optionKey(field, o))}</option>)}
    </SelectField>
  );

  return (
    <section className="card obreview" aria-labelledby="obreview-h">
      <header className="obreview__head">
        <div>
          <h2 id="obreview-h">{t('ob.review.title')}</h2>
          <p className="muted">{t('ob.review.desc')}</p>
        </div>
        {!editing && <Button variant="secondary" iconLeft={Pencil} onClick={startEdit}>{t('ob.review.edit')}</Button>}
      </header>

      {!editing ? (
        <dl className="obreview__list">
          {ALL_FIELDS.map((f) => <div key={f} className="obreview__row"><dt>{t(`ob.field.${f}`)}</dt><dd>{display(f)}</dd></div>)}
        </dl>
      ) : (
        <div className="formgrid obreview__form">
          <TextField label={t('ob.field.fullName')} value={draft.fullName ?? ''} onChange={(e) => set('fullName', e.target.value)} error={err('fullName')} autoComplete="name" maxLength={120} />
          <TextField label={t('ob.field.dateOfBirth')} type="date" max={new Date().toISOString().slice(0, 10)} value={draft.dateOfBirth ?? ''} onChange={(e) => set('dateOfBirth', e.target.value)} error={err('dateOfBirth')} />
          <TextField label={t('ob.field.state')} value={draft.state ?? ''} onChange={(e) => set('state', e.target.value)} error={err('state')} maxLength={100} />
          <TextField label={t('ob.field.district')} value={draft.district ?? ''} onChange={(e) => set('district', e.target.value)} error={err('district')} maxLength={100} />
          {select('residence', t('ob.field.residence'))}
          {select('occupation', t('ob.field.occupation'))}
          {select('education', t('ob.field.education'))}
          <TextField label={t('ob.field.annualIncome')} inputMode="numeric" value={draft.annualIncome ?? ''} onChange={(e) => set('annualIncome', e.target.value.replace(/[,\s]/g, ''))} error={err('annualIncome')} maxLength={10} />
          {select('gender', t('ob.field.gender'))}
          {select('category', t('ob.field.category'))}
          {select('disability', t('ob.field.disability'))}
          <fieldset className="obreview__circ">
            <legend>{t('ob.field.circumstances')}</legend>
            {OPTIONS.circumstances.map((c) => (
              <CheckboxField key={c} label={t(optionKey('circumstances', c))} checked={(draft.circumstances || []).includes(c)}
                onChange={(e) => set('circumstances', e.target.checked ? [...(draft.circumstances || []), c] : (draft.circumstances || []).filter((x) => x !== c))} />
            ))}
            <p className="muted obreview__circhint">{Array.isArray(draft.circumstances) && draft.circumstances.length === 0 ? t('ob.circ.none') : ''}</p>
          </fieldset>
        </div>
      )}

      {editing ? (
        <div className="obreview__actions">
          <Button onClick={finishEdit} iconLeft={CheckCircle2}>{t('ob.review.doneEdit')}</Button>
          <Button variant="ghost" onClick={() => { setEditing(false); setShowErrors(false); }}>{t('ob.review.cancelEdit')}</Button>
        </div>
      ) : (
        <>
          {showErrors && (!profile.fullName || Object.keys(errors).length > 0) && <p className="formalert" role="alert">{t(profile.fullName ? 'ob.review.fixErrors' : 'ob.review.needName')}</p>}
          {saveError && <p className="formalert" role="alert">{saveError}</p>}
          {!isAuthenticated ? (
            <aside className="obreview__gate" aria-labelledby="obgate-h">
              <ShieldCheck size={26} aria-hidden="true" />
              <div>
                <h3 id="obgate-h">{t('ob.review.signin.title')}</h3>
                <p>{t('ob.review.signin.desc')}</p>
                <div className="cluster">
                  <Button to="/login" state={{ from: '/onboarding' }} iconLeft={LogIn}>{t('ob.review.signin.login')}</Button>
                  <Button to="/register" state={{ from: '/onboarding' }} variant="secondary" iconLeft={UserPlus}>{t('ob.review.signin.register')}</Button>
                </div>
              </div>
            </aside>
          ) : (
            <>
              <CheckboxField label={t('ob.review.consent')} checked={consent} onChange={(e) => { setConsent(e.target.checked); setConsentError(false); }} error={consentError ? t('ob.review.consentRequired') : undefined} />
              <div className="obreview__actions">
                <Button size="lg" loading={saving} onClick={confirm} iconLeft={CheckCircle2}>{saving ? t('ob.review.saving') : t('ob.review.confirm')}</Button>
              </div>
            </>
          )}
          <div className="obreview__actions obreview__actions--secondary"><Button variant="ghost" iconLeft={ArrowLeft} onClick={onBack}>{t('ob.review.backToChat')}</Button></div>
        </>
      )}
    </section>
  );
}
