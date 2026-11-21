import { HeartHandshake } from 'lucide-react';
import Button from '../common/Button';
import T from '../common/T';
import useCitizenData from '../../hooks/useCitizenData';
import { usePreferences } from '../../context/PreferencesContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';

// Persistent banner while a helper session is active, so the citizen can always see and end it.
export default function HelperBanner() {
  const { data, setHelperSession, logActivity } = useCitizenData();
  const { setTextSize } = usePreferences();
  const { t } = useLanguage();
  const toast = useToast();
  const s = data.helperSession;
  if (!s) return null;
  const end = () => { setHelperSession(null); logActivity({ type: 'helperEnd' }); if (s.prevTextSize) setTextSize(s.prevTextSize); toast.info(t('hw.ended')); };
  return (
    <div className="helperbanner" role="status">
      <HeartHandshake size={20} aria-hidden="true" />
      <p><strong><T k="hw.banner" vars={{ name: s.citizenName }} /></strong></p>
      <Button size="sm" variant="accent" onClick={end}><T k="hw.end" /></Button>
    </div>
  );
}
