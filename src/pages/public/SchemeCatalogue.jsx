import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowDownAZ, Clock, Compass, LayoutGrid, List, SlidersHorizontal, Sparkles, X } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import SearchBar from '../../components/common/SearchBar';
import Dropdown from '../../components/common/Dropdown';
import Button from '../../components/common/Button';
import DemoNotice from '../../components/common/DemoNotice';
import T from '../../components/common/T';
import LevelTabs from '../../components/schemes/LevelTabs';
import SchemeFilters from '../../components/schemes/SchemeFilters';
import FilterSheet from '../../components/schemes/FilterSheet';
import SchemeResults, { SchemeEmpty, SchemeError, SchemeSkeletonGrid } from '../../components/schemes/SchemeResults';
import useSchemes from '../../hooks/useSchemes';
import { useLanguage } from '../../context/LanguageContext';
import { filterSchemes, sortSchemes } from '../../utils/schemeSearch';
import { categories } from '../../data/categories';
import { verificationOrder } from '../../data/schemes';

const PAGE_SIZE = 9;
const list = (v) => (v || '').split(',').filter(Boolean);

export default function SchemeCatalogue() {
  const { status, data, reload } = useSchemes();
  const { t, language } = useLanguage();
  const [params, setParams] = useSearchParams();
  const [sheet, setSheet] = useState(false);
  const [visible, setVisible] = useState(PAGE_SIZE);

  const q = params.get('q') || '';
  const cats = list(params.get('cat'));
  const statuses = list(params.get('ver'));
  const level = ['central', 'karnataka'].includes(params.get('level')) ? params.get('level') : 'all';
  const sort = ['name', 'updated'].includes(params.get('sort')) ? params.get('sort') : 'relevance';
  const view = params.get('view') === 'list' ? 'list' : 'grid';

  // Single place that writes filter state to the URL (shareable, back-button friendly).
  const update = (patch) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) => {
      const empty = v == null || v === '' || (Array.isArray(v) && !v.length) || v === 'all' || (k === 'sort' && v === 'relevance') || (k === 'view' && v === 'grid');
      if (empty) next.delete(k); else next.set(k, Array.isArray(v) ? v.join(',') : v);
    });
    setParams(next, { replace: true });
  };
  const toggle = (arr, v) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const results = useMemo(() => sortSchemes(filterSchemes(data, { q, categories: cats, level, statuses }), sort, language), [data, q, params, language]); // eslint-disable-line react-hooks/exhaustive-deps
  const counts = useMemo(() => {
    const base = filterSchemes(data, { q, categories: [], level, statuses }).map((e) => e.s);
    const forStatus = filterSchemes(data, { q, categories: cats, level, statuses: [] }).map((e) => e.s);
    const forLevel = filterSchemes(data, { q, categories: cats, level: 'all', statuses }).map((e) => e.s);
    const category = {}; categories.forEach((c) => { category[c.slug] = base.filter((s) => s.category === c.slug).length; });
    const st = {}; verificationOrder.forEach((v) => { st[v] = forStatus.filter((s) => s.status === v).length; });
    return { category, status: st, level: { all: forLevel.length, central: forLevel.filter((s) => s.level === 'central').length, karnataka: forLevel.filter((s) => s.level === 'karnataka').length } };
  }, [data, q, params]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => setVisible(PAGE_SIZE), [q, params.get('cat'), params.get('ver'), level, sort]);

  const activeCount = cats.length + statuses.length + (q ? 1 : 0);
  const filterCount = cats.length + statuses.length;
  const clearAll = () => setParams(new URLSearchParams(), { replace: true });
  const clearFilters = () => update({ cat: [], ver: [] });
  const shown = results.slice(0, visible);

  const filters = (
    <SchemeFilters selectedCategories={cats} selectedStatuses={statuses} counts={counts} activeCount={filterCount}
      onToggleCategory={(c) => update({ cat: toggle(cats, c) })} onToggleStatus={(s) => update({ ver: toggle(statuses, s) })} onClear={clearFilters} />
  );
  const sortOptions = [{ value: 'relevance', label: t('sort.relevance') }, { value: 'name', label: t('sort.name') }, { value: 'updated', label: t('sort.updated') }];
  const sortIcon = sort === 'name' ? ArrowDownAZ : sort === 'updated' ? Clock : Sparkles;

  return (
    <div className="container section catalogue">
      <PageHeader icon={Compass} title={<T k="page.schemes" />} description={<T k="catalogue.desc" />} />
      <div className="catalogue__search">
        <SearchBar size="md" initial={q} onChange={(v) => update({ q: v })} onSearch={(v) => update({ q: v })} suggestionKeys={[]} />
      </div>

      <div className="catalogue__layout">
        <aside className="catalogue__aside" aria-label={t('filters.title')}>{filters}</aside>

        <section className="catalogue__main" aria-label={t('page.schemes')}>
          <div className="toolbar">
            <LevelTabs value={level} onChange={(v) => update({ level: v })} counts={counts.level} />
            <div className="toolbar__right">
              <Button variant="secondary" size="sm" iconLeft={SlidersHorizontal} className="toolbar__filterbtn" onClick={() => setSheet(true)}>
                <T k="filters.open" />{filterCount > 0 && <span className="toolbar__badge">{filterCount}</span>}
              </Button>
              <Dropdown label={t('sort.label')} value={sort} options={sortOptions} onChange={(v) => update({ sort: v })} icon={sortIcon} />
              <div className="viewtoggle" role="group" aria-label={t('view.label')}>
                <button type="button" className={view === 'grid' ? 'is-active' : ''} aria-pressed={view === 'grid'} aria-label={t('view.grid')} onClick={() => update({ view: 'grid' })}><LayoutGrid size={18} aria-hidden="true" /></button>
                <button type="button" className={view === 'list' ? 'is-active' : ''} aria-pressed={view === 'list'} aria-label={t('view.list')} onClick={() => update({ view: 'list' })}><List size={18} aria-hidden="true" /></button>
              </div>
            </div>
          </div>

          {status === 'success' && (
            <div className="resultsbar">
              <p className="resultsbar__count"><strong><T k={results.length === 1 ? 'results.one' : 'results.many'} vars={{ count: results.length }} /></strong></p>
              {activeCount > 0 && (
                <ul className="chips" aria-label={t('filters.title')}>
                  {q && <li><button type="button" className="chip" onClick={() => update({ q: '' })}>“{q}” <X size={14} aria-hidden="true" /><span className="sr-only">{t('common.close')}</span></button></li>}
                  {cats.map((c) => <li key={c}><button type="button" className="chip" onClick={() => update({ cat: toggle(cats, c) })}>{t(`cat.${c}`)} <X size={14} aria-hidden="true" /><span className="sr-only">{t('common.close')}</span></button></li>)}
                  {statuses.map((s) => <li key={s}><button type="button" className="chip" onClick={() => update({ ver: toggle(statuses, s) })}>{t(`status.${s}`)} <X size={14} aria-hidden="true" /><span className="sr-only">{t('common.close')}</span></button></li>)}
                </ul>
              )}
            </div>
          )}
          <p className="sr-only" aria-live="polite">{status === 'success' ? t('results.live', { count: results.length }) : ''}</p>
          <DemoNotice />

          {status === 'loading' && <SchemeSkeletonGrid view={view} count={6} />}
          {status === 'error' && <SchemeError onRetry={reload} />}
          {status === 'success' && (results.length === 0 ? <SchemeEmpty onClear={clearAll} /> : (
            <>
              <SchemeResults schemes={shown} view={view} />
              <div className="loadmore">
                <p className="muted"><T k="results.showing" vars={{ shown: shown.length, total: results.length }} /></p>
                {visible < results.length && <Button variant="secondary" onClick={() => setVisible((v) => v + PAGE_SIZE)}><T k="loadMore" /></Button>}
              </div>
            </>
          ))}
        </section>
      </div>

      <FilterSheet open={sheet} onClose={() => setSheet(false)} resultCount={results.length}>{filters}</FilterSheet>
    </div>
  );
}
