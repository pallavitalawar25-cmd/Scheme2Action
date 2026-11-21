import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import T from '../common/T';
import { useLanguage } from '../../context/LanguageContext';

// Mobile bottom navigation for the citizen area (same routes as the desktop sidebar).
export default function BottomNav({ items }) {
  const { t } = useLanguage();
  const { pathname } = useLocation();
  return (
    <nav className="bottomnav" aria-label={t('nav.main')}>
      <ul>
        {items.filter((i) => i.mobile !== false).map((item) => {
          const Icon = item.icon;
          const active = item.match ? pathname.startsWith(item.match) : pathname === item.to;
          return (
            <li key={item.to + item.key}>
              <NavLink to={item.to} className={`bottomnav__link${active ? ' is-active' : ''}`} aria-current={active ? 'page' : undefined}>
                {active && <motion.span layoutId="bottom-active" className="bottomnav__active" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
                <Icon size={22} aria-hidden="true" />
                <span><T k={item.key} /></span>
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
