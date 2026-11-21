import { forwardRef, useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { TextField } from './FormField';
import { useLanguage } from '../../context/LanguageContext';

const PasswordField = forwardRef(function PasswordField({ autoComplete = 'current-password', ...rest }, ref) {
  const [shown, setShown] = useState(false);
  const { t } = useLanguage();
  return (
    <TextField ref={ref} type={shown ? 'text' : 'password'} icon={Lock} autoComplete={autoComplete} {...rest}
      trailing={(
        <button type="button" className="icon-btn pw-toggle" onClick={() => setShown((s) => !s)} aria-pressed={shown} aria-label={shown ? t('auth.hide') : t('auth.show')}>
          {shown ? <EyeOff size={19} aria-hidden="true" /> : <Eye size={19} aria-hidden="true" />}
        </button>
      )} />
  );
});
export default PasswordField;
