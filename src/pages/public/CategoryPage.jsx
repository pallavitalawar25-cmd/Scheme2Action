import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import SearchBar from '../../components/common/SearchBar';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import DemoNotice from '../../components/common/DemoNotice';
import T from '../../components/common/T';
import LevelTag from '../../components/schemes/LevelTag';
import SchemeResults, { SchemeError, SchemeSkeletonGrid } from '../../components/schemes/SchemeResults';
import ChakraGeometry from '../../components/decor/ChakraGeometry';
import useSchemes from '../../hooks/useSchemes';
import { categories, getCategory } from '../../data/categories';
import { verificationOrder } from '../../data/schemes';
import { filterSchemes, sortSchemes } from '../../utils/schemeSearch';
import { useLanguage } from '../../context/LanguageContext';
import NotFound from '../NotFound';

// One reusable page for all eight categories. Each gets its own accent, icon watermark and hero.
export default function CategoryPage() {
  const { slug } = useParams();
  const cat = getCategory(slug);
  const { status, data, reload } = useSchemes();
  const { t, language } = useLanguage();
  const [q, setQ] = useState('');
  const [statuses, setStatuses] = useState([]);

  const inCategory = useMemo(() => data.filter((s) => s.category === slug), [data, slug]);
  const groups = useMemo(() => {
    const filtered = sortSchemes(filterSchemes(inCategory, { q, statuses }), 'relevance', language);
    return { central: filtered.filter((s) => s.level === 'central'), karnataka: filtered.filter((s) => s.level === 'karnataka') };
  }, [inCategory, q, statuses, language]);

  if (!cat) return <NotFound />;
  const Icon = cat.icon;
  const toggleStatus = (s) => setStatuses((cur) => (cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s]));

  return (
    <div className="catpage" style={{ '--cat': cat.accent }}>
      <section className="cathero on-dark">
        <ChakraGeometry size={420} className="cathero__chakra" />
        <Icon className="cathero__mark" size={300} strokeWidth={1} aria-hidden="true" />
        <div className="container cathero__inner">
          <nav aria-label="Breadcrumb" className="crumbs crumbs--light">
            <ol>
              <li><Link to="/">{t('nav.home')}</Link></li>
              <li><Link to="/categories">{t('nav.categories')}</Link></li>
              <li><span aria-current="page">{t(`cat.${slug}`)}</span></li>
            </ol>
          </nav>
          <span className="cathero__icon"><Icon size={36} aria-hidden="true" /></span>
          <h1><T k={`cat.${slug}`} /></h1>
          <p className="cathero__desc"><T k={`cat.${slug}.desc`} /></p>
          {status === 'success' && <p className="cathero__count"><T k="catpage.count" vars={{ count: inCategory.length }} /></p>}
        </div>
      </section>

      <div className="container section catpage__body">
        <div className="catpage__tools">
          <SearchBar size="md" initial={q} onChange={setQ} onSearch={setQ} suggestionKeys={[]} placeholderKey="catpage.search" />
          <div className="cluster" role="group" aria-label={t('filters.verification')}>
            {verificationOrder.map((s) => (
              <button key={s} type="button" className={`statuschip${statuses.includes(s) ? ' is-on' : ''}`} aria-pressed={statuses.includes(s)} onClick={() => toggleStatus(s)}><StatusBadge status={s} size="sm" /></button>
            ))}
          </div>
        </div>
        <DemoNotice />

        {status === 'loading' && <SchemeSkeletonGrid count={3} />}
        {status === 'error' && <SchemeError onRetry={reload} />}
        {status === 'success' && inCategory.length === 0 && (
          <EmptyState icon={Icon} title={<T k="catpage.none" />} description={<T k="catpage.noneDesc" />} action={<Button to="/categories" variant="secondary"><T k="nav.categories" /></Button>} />
        )}
        {status === 'success' && inCategory.length > 0 && ['central', 'karnataka'].map((lvl) => (
          <section key={lvl} className={`levelgroup levelgroup--${lvl}`} aria-labelledby={`lg-${lvl}`}>
            <div className="levelgroup__head">
              <LevelTag level={lvl} />
              <h2 id={`lg-${lvl}`}><T k={`catpage.${lvl}`} /></h2>
              <span className="levelgroup__count">{groups[lvl].length}</span>
            </div>
            {groups[lvl].length ? <SchemeResults schemes={groups[lvl]} /> : <p className="muted levelgroup__none"><T k="catpage.noneLevel" vars={{ level: t(`level.${lvl}`) }} /></p>}
          </section>
        ))}

        <nav className="othercats" aria-label={t('catpage.other')}>
          <h2><T k="catpage.other" /></h2>
          <ul>
            {categories.filter((c) => c.slug !== slug).map((c) => {
              const CI = c.icon;
              return <li key={c.slug}><Link to={`/categories/${c.slug}`} style={{ '--cat': c.accent }}><CI size={16} aria-hidden="true" /><T k={`cat.${c.slug}`} /><ArrowRight size={14} aria-hidden="true" /></Link></li>;
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
}
