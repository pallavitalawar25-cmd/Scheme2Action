import { Type } from 'lucide-react';
import { usePreferences } from '../../context/PreferencesContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import Tooltip from '../common/Tooltip';

export default function LargeTextToggle() {
  const { largeText, toggleLargeText } = usePreferences();
  const { t } = useLanguage();
  const toast = useToast();
  return (
    <Tooltip label={t('nav.largeText')}>
      <button type="button" className={`icon-btn${largeText ? ' is-on' : ''}`} aria-pressed={largeText} aria-label={t('nav.largeText')}
        onClick={() => { toggleLargeText(); toast.info(largeText ? t('toast.textNormal') : t('toast.textLarge'), 2200); }}>
        <Type size={20} aria-hidden="true" />
      </button>
    </Tooltip>
  );
}
