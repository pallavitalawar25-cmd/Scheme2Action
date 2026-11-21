import { useEffect, useRef } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { HeartHandshake, LayoutDashboard, LogIn, LogOut, UserPlus, X } from 'lucide-react';
import Logo from '../common/Logo';
import Button from '../common/Button';
import T from '../common/T';
import LanguageSwitch from './LanguageSwitch';
import LargeTextToggle from './LargeTextToggle';
import { publicNav } from '../../data/navigation';
import { categories } from '../../data/categories';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import useEscape from '../../hooks/useEscape';
import useLockBodyScroll from '../../hooks/useLockBodyScroll';

export default function MobileDrawer({ open, onClose }) {
  const { t } = useLanguage();
  const { isAuthenticated, logout } = useAuth();
  const toast = useToast();
  const closeRef = useRef(null);
  useEscape(onClose, open);
  useLockBodyScroll(open);
  useEffect(() => { if (open) closeRef.current?.focus(); }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="drawer-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} aria-hidden="true" />
          <motion.aside className="drawer on-dark-none" role="dialog" aria-modal="true" aria-label={t('nav.main')}
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', stiffness: 360, damping: 38 }}>
            <div className="drawer__head">
              <Logo />
              <button ref={closeRef} type="button" className="icon-btn" onClick={onClose} aria-label={t('nav.closeMenu')}><X size={22} aria-hidden="true" /></button>
            </div>
            <nav aria-label={t('nav.main')} className="drawer__nav">
              <ul>
                {publicNav.map((item, i) => (
                  <motion.li key={item.id} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 + i * 0.04 }}>
                    <NavLink to={item.to} end={item.end} className={({ isActive }) => `drawer__link${isActive ? ' is-active' : ''}`} onClick={onClose}><T k={item.key} /></NavLink>
                    {item.menu && (
                      <ul className="drawer__sub">
                        {categories.map((c) => {
                          const Icon = c.icon;
                          return (
                            <li key={c.slug}>
                              <Link to={`/categories/${c.slug}`} onClick={onClose} style={{ '--cat': c.accent }}>
                                <span className="drawer__subicon"><Icon size={16} aria-hidden="true" /></span><T k={`cat.${c.slug}`} />
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </motion.li>
                ))}
                <li><NavLink to="/helper" className={({ isActive }) => `drawer__link${isActive ? ' is-active' : ''}`} onClick={onClose}><HeartHandshake size={18} aria-hidden="true" /><T k="nav.helper" /></NavLink></li>
              </ul>
            </nav>
            <div className="drawer__tools"><LanguageSwitch /><LargeTextToggle /></div>
            <div className="drawer__cta">
              {isAuthenticated ? (
                <>
                  <Button to="/dashboard" block iconLeft={LayoutDashboard} onClick={onClose}><T k="nav.dashboard" /></Button>
                  <Button variant="secondary" block iconLeft={LogOut} onClick={() => { logout(); onClose(); toast.info(t('toast.signedOut')); }}><T k="nav.logout" /></Button>
                </>
              ) : (
                <>
                  <Button to="/register" variant="accent" block iconLeft={UserPlus} onClick={onClose}><T k="nav.register" /></Button>
                  <Button to="/login" variant="secondary" block iconLeft={LogIn} onClick={onClose}><T k="nav.login" /></Button>
                </>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
