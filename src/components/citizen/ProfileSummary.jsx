import { MapPin, Pencil } from 'lucide-react';
import Button from '../common/Button';
import ProgressRing from '../common/ProgressRing';
import T from '../common/T';
import { useLanguage } from '../../context/LanguageContext';

export default function ProfileSummary({ name, email, profile, completeness }) {
  const { t } = useLanguage();
  const place = [profile?.district, profile?.state].filter(Boolean).join(', ');
  return (
    <section className="profilesum card" aria-label={t('dash.profile.edit')}>
      <div className="profilesum__top">
        <span className="profilesum__avatar" aria-hidden="true">{(name || 'U').trim().charAt(0).toUpperCase()}</span>
        <div className="profilesum__id"><h3>{name}</h3><p className="muted">{email}</p>{place && <p className="profilesum__place"><MapPin size={14} aria-hidden="true" />{place}</p>}</div>
      </div>
      <div className="profilesum__ring">
        <ProgressRing value={completeness} size={72} stroke={8} tone="saffron" label={t('profile.completeness')} />
        <div><strong><T k="profile.completeness" /></strong>{completeness < 100 && <p className="muted"><T k="dash.profile.missing" /></p>}</div>
      </div>
      <Button to="/profile" variant="secondary" size="sm" iconLeft={Pencil} block><T k="dash.profile.edit" /></Button>
    </section>
  );
}
