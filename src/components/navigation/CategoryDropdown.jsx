import { useCallback, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { categories } from '../../data/categories';
import T from '../common/T';
import { useLanguage } from '../../context/LanguageContext';
import useOnClickOutside from '../../hooks/useOnClickOutside';
import useEscape from '../../hooks/useEscape';

export default function CategoryDropdown({ active }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const timer = useRef(null);
  const { t } = useLanguage();
  const { pathname } = useLocation();
  const close = useCallback(() => setOpen(false), []);
  useOnClickOutside(ref, close, open);
  useEscape(close, open);

  const enter = () => { clearTimeout(timer.current); if (window.matchMedia('(hover: hover)').matches) setOpen(true); };
  const leave = () => { timer.current = setTimeout(close, 140); };

  return (
    <div className="catmenu" ref={ref} onMouseEnter={enter} onMouseLeave={leave}>
      <button type="button" className={`nav-link${active ? ' is-active' : ''}`} aria-expanded={open} aria-haspopup="true" onClick={() => setOpen((o) => !o)}>
        <T k="nav.categories" />
        <ChevronDown size={15} aria-hidden="true" className={`nav-link__chev${open ? ' is-open' : ''}`} />
        {active && <motion.span layoutId="nav-bar" className="nav-link__bar" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div className="catmenu__panel" initial={{ opacity: 0, y: -10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}>
            <ul className="catmenu__grid" aria-label={t('nav.categories')}>
              {categories.map((c) => {
                const Icon = c.icon;
                return (
                  <li key={c.slug}>
                    <Link to={`/categories/${c.slug}`} className={`catmenu__item${pathname === `/categories/${c.slug}` ? ' is-current' : ''}`} style={{ '--cat': c.accent }} onClick={close}>
                      <span className="catmenu__icon"><Icon size={20} aria-hidden="true" /></span>
                      <span className="catmenu__text"><strong><T k={`cat.${c.slug}`} /></strong></span>
                    </Link>
                  </li>
                );
              })}
            </ul>
            <Link to="/categories" className="catmenu__all" onClick={close}><T k="nav.allCategories" /><ArrowRight size={16} aria-hidden="true" /></Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
