import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import Logo from '../common/Logo';
import T from '../common/T';
import { useLanguage } from '../../context/LanguageContext';
import useLockBodyScroll from '../../hooks/useLockBodyScroll';
import useEscape from '../../hooks/useEscape';

// variant: 'light' (citizen) | 'dark' (admin). mobile: 'hidden' | 'drawer'.
export default function Sidebar({ items, variant = 'light', mobile = 'hidden', open = false, onClose, title, layoutId = 'sidebar-active' }) {
  const { t } = useLanguage();
  const { pathname } = useLocation();
  useLockBodyScroll(mobile === 'drawer' && open);
  useEscape(() => onClose?.(), mobile === 'drawer' && open);

  return (
    <>
      {mobile === 'drawer' && <div className={`sidebar-overlay${open ? ' is-open' : ''}`} onClick={onClose} aria-hidden="true" />}
      <aside className={`sidebar sidebar--${variant} sidebar--m-${mobile}${open ? ' is-open' : ''}${variant === 'dark' ? ' on-dark' : ''}`}>
        <div className="sidebar__head">
          <Logo light={variant === 'dark'} />
          {mobile === 'drawer' && <button type="button" className="icon-btn sidebar__close" onClick={onClose} aria-label={t('common.close')}><X size={20} aria-hidden="true" /></button>}
        </div>
        {title && <p className="sidebar__title"><T k={title} /></p>}
        <nav aria-label={t('nav.main')}>
          <ul className="sidebar__list">
            {items.map((item) => {
              const Icon = item.icon;
              const current = item.match ? pathname.startsWith(item.match) : undefined;
              return (
                <li key={item.to + item.key}>
                  <NavLink to={item.to} end={item.end} className={({ isActive }) => `sidebar__link${(current ?? isActive) ? ' is-active' : ''}`} onClick={onClose}>
                    {({ isActive }) => (
                      <>
                        {(current ?? isActive) && <motion.span layoutId={layoutId} className="sidebar__active" transition={{ type: 'spring', stiffness: 420, damping: 36 }} />}
                        <Icon size={20} aria-hidden="true" className="sidebar__icon" />
                        <span className="sidebar__text"><T k={item.key} /></span>
                      </>
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
}
