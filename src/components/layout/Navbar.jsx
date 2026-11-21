import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, useScroll, useSpring } from 'framer-motion';
import { ArrowRight, HeartHandshake, LayoutDashboard, Menu } from 'lucide-react';
import Logo from '../common/Logo';
import Button from '../common/Button';
import T from '../common/T';
import CategoryDropdown from '../navigation/CategoryDropdown';
import LanguageSwitch from '../navigation/LanguageSwitch';
import LargeTextToggle from '../navigation/LargeTextToggle';
import MobileDrawer from '../navigation/MobileDrawer';
import { publicNav } from '../../data/navigation';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import useScrolled from '../../hooks/useScrolled';

export default function Navbar() {
  const { pathname } = useLocation();
  const scrolled = useScrolled(12);
  const [drawer, setDrawer] = useState(false);
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 26, restDelta: 0.001 });

  useEffect(() => setDrawer(false), [pathname]);

  const isActive = (item) => (item.end ? pathname === '/' : pathname.startsWith(item.to));

  return (
    <header className={`navbar${scrolled ? ' is-scrolled' : ''}`}>
      <div className="container navbar__inner">
        <Logo />
        <nav className="navbar__desktop" aria-label={t('nav.main')}>
          <ul className="navbar__links">
            {publicNav.map((item) => (
              <li key={item.id}>
                {item.menu ? (
                  <CategoryDropdown active={isActive(item)} />
                ) : (
                  <Link to={item.to} className={`nav-link${isActive(item) ? ' is-active' : ''}`} aria-current={isActive(item) ? 'page' : undefined}>
                    <T k={item.key} />
                    {isActive(item) && <motion.span layoutId="nav-bar" className="nav-link__bar" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>
        <div className="navbar__actions">
          <div className="navbar__extras"><LargeTextToggle /></div>
          <LanguageSwitch />
          <div className="navbar__desktop navbar__ctas">
            <Link to="/helper" className="helper-pill"><HeartHandshake size={17} aria-hidden="true" /><T k="nav.helper" /></Link>
            {isAuthenticated ? (
              <Button to="/dashboard" size="sm" iconLeft={LayoutDashboard}><T k="nav.dashboard" /></Button>
            ) : (
              <>
                <Link to="/login" className="nav-link nav-link--plain"><T k="nav.login" /></Link>
                <Button to="/register" variant="accent" size="sm" iconRight={ArrowRight} className="btn--arrow"><T k="nav.register" /></Button>
              </>
            )}
          </div>
          <button type="button" className="icon-btn navbar__burger" onClick={() => setDrawer(true)} aria-label={t('nav.menu')} aria-expanded={drawer}>
            <Menu size={24} aria-hidden="true" />
          </button>
        </div>
      </div>
      <motion.span className="navbar__progress" style={{ scaleX: progress }} aria-hidden="true" />
      <MobileDrawer open={drawer} onClose={() => setDrawer(false)} />
    </header>
  );
}
