import { Settings, Trash2, UserRound } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import ProgressRing from '../../components/common/ProgressRing';
import T from '../../components/common/T';
import { SelectField, TextField } from '../../components/forms/FormField';
import useForm from '../../hooks/useForm';
import useCitizenData from '../../hooks/useCitizenData';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { collect, fullName, optionalPastDate, optionalPhone, optionalPincode } from '../../utils/validators';
import { profileCompleteness } from '../../services/citizenStore';
import { schemeKey } from '../../data/schemes';

const validate = (v) => collect({ fullName: fullName(v.fullName), phone: optionalPhone(v.phone), dateOfBirth: optionalPastDate(v.dateOfBirth), pincode: optionalPincode(v.pincode) });
const GENDERS = ['female', 'male', 'other', 'na'];
const OCCUPATIONS = ['student', 'farmer', 'homemaker', 'employed', 'self', 'unemployed', 'retired'];

export default function Profile() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const toast = useToast();
  const { data, updateProfile, logActivity, removeDocument } = useCitizenData();
  const form = useForm({ initial: data.profile, validate });
  const live = profileCompleteness(form.values);

  const onSubmit = form.handleSubmit((v) => {
    updateProfile({ ...v, fullName: v.fullName.trim(), phone: v.phone.trim(), pincode: v.pincode.trim(), district: v.district.trim() });
    logActivity({ type: 'profile' });
    toast.success(t('profile.saved'));
  });

  return (
    <div>
      <PageHeader icon={UserRound} title={<T k="page.profile" />} description={<T k="profile.desc" />}
        actions={<Button to="/settings" variant="secondary" iconLeft={Settings}><T k="profile.toSettings" /></Button>} />
      <div className="profilegrid">
        <form className="card profileform" onSubmit={onSubmit} noValidate aria-label={t('profile.personal')}>
          <h2><T k="profile.personal" /></h2>
          <div className="formgrid">
            <TextField label={t('auth.fullName')} required autoComplete="name" {...form.bind('fullName')} />
            <TextField label={t('auth.email')} value={user?.email || ''} readOnly hint={t('profile.emailLocked')} />
            <TextField label={t('profile.phone')} inputMode="numeric" autoComplete="tel-national" maxLength={10} {...form.bind('phone')} />
            <TextField label={t('profile.dob')} type="date" max={new Date().toISOString().slice(0, 10)} autoComplete="bday" {...form.bind('dateOfBirth')} />
            <SelectField label={t('profile.gender')} {...form.bind('gender')}>
              <option value="">{t('profile.select')}</option>
              {GENDERS.map((g) => <option key={g} value={g}>{t(`gender.${g}`)}</option>)}
            </SelectField>
            <SelectField label={t('profile.occupation')} {...form.bind('occupation')}>
              <option value="">{t('profile.select')}</option>
              {OCCUPATIONS.map((o) => <option key={o} value={o}>{t(`occ.${o}`)}</option>)}
            </SelectField>
            <SelectField label={t('profile.state')} {...form.bind('state')}>
              <option value="Karnataka">{t('level.karnataka')}</option>
              <option value="Other">{t('rel.other')}</option>
            </SelectField>
            <TextField label={t('profile.district')} autoComplete="address-level2" {...form.bind('district')} />
            <TextField label={t('profile.pincode')} inputMode="numeric" maxLength={6} autoComplete="postal-code" {...form.bind('pincode')} />
          </div>
          <p className="muted"><T k="profile.why" /></p>
          <Button type="submit" size="lg"><T k="profile.save" /></Button>
        </form>

        <aside className="profileside">
          <section className="card profileside__ring">
            <ProgressRing value={live} size={96} stroke={10} tone="saffron" label={t('profile.completeness')} />
            <div><h2 className="dash__h3"><T k="profile.completeness" /></h2><p className="muted"><T k="dash.profile.complete" vars={{ percent: live }} /></p></div>
          </section>
          <section className="card" aria-labelledby="docs-h">
            <h2 id="docs-h" className="dash__h3"><T k="profile.docs.title" /></h2>
            <p className="muted"><T k="profile.docs.desc" /></p>
            {data.documents.length === 0 ? <p className="muted"><T k="profile.docs.empty" /></p> : (
              <ul className="doclist">
                {data.documents.map((d) => (
                  <li key={d.id} className="docrow">
                    <div><strong><T k={d.docKey} /></strong><small><T k={schemeKey(d.schemeId, 'name')} /></small></div>
                    <span className={`docpill docpill--${d.status}`}><T k={`docstatus.${d.status}`} /></span>
                    <button type="button" className="icon-btn" aria-label={`${t('profile.docs.remove')}: ${t(d.docKey)}`} onClick={() => { removeDocument(d.id); toast.info(t('toast.docRemoved')); }}><Trash2 size={18} aria-hidden="true" /></button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
