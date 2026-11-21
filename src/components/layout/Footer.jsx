import { Link } from 'react-router-dom';
import { Info } from 'lucide-react';
import Logo from '../common/Logo';
import T from '../common/T';
import FlagMotif from '../decor/FlagMotif';
import HeritageSkyline from '../decor/HeritageSkyline';
import { categories } from '../../data/categories';
import { useLanguage } from '../../context/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="footer on-dark">
      <HeritageSkyline className="footer__skyline" />
      <span className="footer__tricolour" aria-hidden="true" />
      <div className="container footer__grid">
        <div className="footer__brand">
          <Logo light />
          <p className="footer__tag"><T k="brand.tagline" /></p>
          <p className="footer__blurb"><T k="footer.blurb" /></p>
          <p className="footer__made"><FlagMotif /><T k="footer.madeIn" /></p>
        </div>
        <nav aria-label={t('footer.explore')}>
          <h2 className="footer__h"><T k="footer.explore" /></h2>
          <ul>
            <li><Link to="/schemes"><T k="nav.explore" /></Link></li>
            <li><Link to="/categories"><T k="nav.categories" /></Link></li>
            {categories.slice(0, 4).map((c) => <li key={c.slug}><Link to={`/categories/${c.slug}`}><T k={`cat.${c.slug}`} /></Link></li>)}
            <li><Link to="/how-it-works"><T k="nav.how" /></Link></li>
          </ul>
        </nav>
        <nav aria-label={t('footer.citizens')}>
          <h2 className="footer__h"><T k="footer.citizens" /></h2>
          <ul>
            <li><Link to="/login"><T k="nav.login" /></Link></li>
            <li><Link to="/register"><T k="nav.register" /></Link></li>
            <li><Link to="/dashboard"><T k="nav.dashboard" /></Link></li>
            <li><Link to="/helper"><T k="nav.helper" /></Link></li>
          </ul>
        </nav>
        <nav aria-label={t('footer.platform')}>
          <h2 className="footer__h"><T k="footer.platform" /></h2>
          <ul>
            <li><Link to="/about"><T k="nav.about" /></Link></li>
            <li><Link to="/about"><T k="footer.privacy" /></Link></li>
            <li><Link to="/about"><T k="footer.terms" /></Link></li>
            <li><Link to="/admin"><T k="nav.admin.dashboard" /> (demo admin)</Link></li>
          </ul>
        </nav>
      </div>
      <div className="container">
        <div className="footer__disclaimer">
          <Info size={18} aria-hidden="true" />
          <div>
            <strong><T k="disclaimer.independent" /></strong>
            <p><T k="disclaimer.demo" /></p>
          </div>
        </div>
        <p className="footer__copy"><T k="footer.rights" vars={{ year: new Date().getFullYear() }} /></p>
      </div>
    </footer>
  );
}
