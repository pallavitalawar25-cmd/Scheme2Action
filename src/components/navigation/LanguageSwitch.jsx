import { useId } from 'react';
import { motion } from 'framer-motion';
import { Languages } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';

// The ONE global language selector. English = English only; Kannada = Kannada with English beneath.
export default function LanguageSwitch({ onDark = false }) {
  const { language, setLanguage, t, tEn } = useLanguage();
  const toast = useToast();
  const pillId = useId();
  const options = [{ code: 'en', label: 'EN', name: 'English' }, { code: 'kn', label: 'ಕನ್ನಡ', name: 'ಕನ್ನಡ' }];

  const choose = (code) => {
    if (code === language) return;
    setLanguage(code);
    toast.success(code === 'kn' ? 'ಭಾಷೆಯನ್ನು ಕನ್ನಡಕ್ಕೆ ಬದಲಾಯಿಸಲಾಗಿದೆ' : tEn('toast.langChanged'), 2500);
  };

  return (
    <div className={`langswitch${onDark ? ' langswitch--dark' : ''}`} role="group" aria-label={t('nav.language')}>
      <Languages size={16} aria-hidden="true" className="langswitch__icon" />
      {options.map((o) => (
        <button key={o.code} type="button" className={`langswitch__btn${language === o.code ? ' is-active' : ''}`} aria-pressed={language === o.code} lang={o.code} aria-label={o.name} onClick={() => choose(o.code)}>
          {language === o.code && <motion.span layoutId={`lang-pill-${pillId}`} className="langswitch__pill" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
          <span className="langswitch__text">{o.label}</span>
        </button>
      ))}
    </div>
  );
}
