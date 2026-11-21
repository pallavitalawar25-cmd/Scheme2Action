import { Link } from 'react-router-dom';
import { ArrowRight, Compass, FileUp, HeartHandshake, Info, PlayCircle, Bookmark } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import T from '../../components/common/T';
import { SelectField, TextField } from '../../components/forms/FormField';
import CheckboxField from '../../components/forms/CheckboxField';
import SegmentedChoice from '../../components/forms/SegmentedChoice';
import useForm from '../../hooks/useForm';
import useCitizenData from '../../hooks/useCitizenData';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { usePreferences } from '../../context/PreferencesContext';
import { useToast } from '../../context/ToastContext';
import { applicationSteps } from '../../data/navigation';
import { checked, collect, fullName } from '../../utils/validators';
import { formatDate } from '../../utils/format';

const validate = (v) => collect({ citizenName: fullName(v.citizenName), helperName: fullName(v.helperName), c1: checked(v.c1) && 'hw.err', c2: checked(v.c2) && 'hw.err', c3: checked(v.c3) && 'hw.err' });

export default function HelperWorkspace() {
  const { user } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const { textSize, setTextSize } = usePreferences();
  const { data, setHelperSession, logActivity } = useCitizenData();
  const toast = useToast();
  const session = data.helperSession;
  const form = useForm({ initial: { citizenName: '', helperName: user?.name || '', relationship: 'family', c1: false, c2: false, c3: false }, validate });

  const begin = form.handleSubmit((v) => {
    setHelperSession({ citizenName: v.citizenName.trim(), helperName: v.helperName.trim(), relationship: v.relationship, consentedAt: new Date().toISOString(), prevTextSize: textSize });
    logActivity({ type: 'helperStart' });
    if (textSize === 'normal') setTextSize('large');
    toast.success(t('hw.started'));
  });
  const end = () => { setHelperSession(null); logActivity({ type: 'helperEnd' }); if (session?.prevTextSize) setTextSize(session.prevTextSize); toast.info(t('hw.ended')); };

  if (!session) {
    return (
      <div>
        <PageHeader icon={HeartHandshake} title={<T k="hw.title" />} description={<T k="hw.consent.title" />} />
        <form className="card consentform" onSubmit={begin} noValidate aria-label={t('hw.consent.title')}>
          <p className="demonotice"><Info size={17} aria-hidden="true" /><T k="helper.noverify" /></p>
          <div className="formgrid">
            <TextField label={t('hw.citizenName')} required {...form.bind('citizenName')} />
            <TextField label={t('hw.helperName')} required autoComplete="name" {...form.bind('helperName')} />
            <SelectField label={t('hw.relationship')} {...form.bind('relationship')}>
              {['family', 'friend', 'volunteer', 'other'].map((r) => <option key={r} value={r}>{t(`rel.${r}`)}</option>)}
            </SelectField>
          </div>
          <fieldset className="consentform__checks">
            <legend className="sr-only"><T k="hw.consent.title" /></legend>
            {['c1', 'c2', 'c3'].map((c) => <CheckboxField key={c} label={<T k={`hw.${c}`} />} {...form.bindCheck(c)} />)}
          </fieldset>
          <Button type="submit" size="lg" iconRight={ArrowRight}><T k="hw.begin" /></Button>
        </form>
      </div>
    );
  }

  const firstActive = data.applications.find((a) => !a.packetReady);
  const tiles = [
    { to: '/schemes', icon: Compass, key: 'dash.apps.start', c: '#087d52' },
    firstActive
      ? { to: `/apply/${firstActive.schemeId}/${applicationSteps[firstActive.stage].path}`, icon: PlayCircle, key: 'dash.continue', c: '#2f7fd1' }
      : { to: '/schemes', icon: PlayCircle, key: 'hw.noApp', c: '#2f7fd1', muted: true },
    { to: firstActive ? `/apply/${firstActive.schemeId}/upload` : '/schemes', icon: FileUp, key: 'hw.t.upload', c: '#d9730d' },
    { to: '/saved', icon: Bookmark, key: 'dash.stat.saved', c: '#c2468b' },
  ];

  return (
    <div className="hw">
      <PageHeader icon={HeartHandshake} title={<T k="hw.title" />} description={<T k="hw.helping" vars={{ name: session.citizenName }} />} />
      <section className="card hwsession" aria-label={t('hw.active')}>
        <div><span className="badge badge--emerald"><T k="hw.active" /></span>
          <p><T k="hw.relationshipLabel" vars={{ rel: t(`rel.${session.relationship}`) }} /> · <T k="hw.since" vars={{ date: formatDate(session.consentedAt, language) }} /></p></div>
        <Button variant="secondary" onClick={end}><T k="hw.end" /></Button>
      </section>

      <h2 className="hw__what"><T k="hw.what" /></h2>
      <ul className="hwtiles">
        {tiles.map((tile) => { const Icon = tile.icon; return (
          <li key={tile.key}><Link to={tile.to} className={`hwtile${tile.muted ? ' is-muted' : ''}`} style={{ '--c': tile.c }}>
            <span className="hwtile__icon"><Icon size={34} aria-hidden="true" /></span><span className="hwtile__label"><T k={tile.key} /></span><ArrowRight size={22} aria-hidden="true" className="hwtile__go" />
          </Link></li>); })}
      </ul>

      <section className="card hwdisplay" aria-labelledby="hw-disp">
        <h2 id="hw-disp"><T k="hw.display" /></h2>
        <p className="setsec__label"><T k="nav.language" /></p>
        <SegmentedChoice large label={t('nav.language')} value={language} onChange={setLanguage} options={[{ value: 'en', label: 'English', lang: 'en' }, { value: 'kn', label: 'ಕನ್ನಡ', lang: 'kn' }]} />
        <p className="setsec__label"><T k="settings.textSize" /></p>
        <SegmentedChoice large label={t('settings.textSize')} value={textSize} onChange={setTextSize} options={[{ value: 'normal', label: t('size.normal') }, { value: 'large', label: t('size.large') }, { value: 'xl', label: t('size.xl') }]} />
        <p className="demonotice"><Info size={17} aria-hidden="true" /><T k="hw.demoNote" /></p>
      </section>
    </div>
  );
}
