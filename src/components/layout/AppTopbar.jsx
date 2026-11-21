import { useNavigate } from 'react-router-dom';
import { LogOut, Menu } from 'lucide-react';
import LanguageSwitch from '../navigation/LanguageSwitch';
import LargeTextToggle from '../navigation/LargeTextToggle';
import Tooltip from '../common/Tooltip';
import Logo from '../common/Logo';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';

// Slim top bar for signed-in areas (citizen, application, admin).
export default function AppTopbar({ onMenu, showLogo = false, children }) {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const toast = useToast();
  const navigate = useNavigate();
  const initial = (user?.name || 'U').trim().charAt(0).toUpperCase();
  return (
    <div className="apptop">
      {onMenu && <button type="button" className="icon-btn apptop__menu" onClick={onMenu} aria-label={t('nav.menu')}><Menu size={22} aria-hidden="true" /></button>}
      {showLogo && <Logo />}
      <div className="apptop__slot">{children}</div>
      <div className="apptop__right">
        <LargeTextToggle />
        <LanguageSwitch />
        <span className="avatar" aria-label={user?.name}>{initial}</span>
        <Tooltip label={t('nav.logout')}>
          <button type="button" className="icon-btn" aria-label={t('nav.logout')} onClick={() => { logout(); toast.info(t('toast.signedOut')); navigate('/'); }}>
            <LogOut size={20} aria-hidden="true" />
          </button>
        </Tooltip>
      </div>
    </div>
  );
}
