import { useMemo, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import Reveal from '../common/Reveal';
import Button from '../common/Button';
import T from '../common/T';
import LevelTabs from '../schemes/LevelTabs';
import SchemeResults, { SchemeError, SchemeSkeletonGrid } from '../schemes/SchemeResults';
import useSchemes from '../../hooks/useSchemes';

export default function FeaturedSchemes() {
  const { status, data, reload } = useSchemes();
  const [level, setLevel] = useState('all');
  const featured = useMemo(() => data.filter((s) => s.featured).sort((a, b) => a.featured - b.featured), [data]);
  const counts = useMemo(() => ({ all: featured.length, central: featured.filter((s) => s.level === 'central').length, karnataka: featured.filter((s) => s.level === 'karnataka').length }), [featured]);
  const shown = level === 'all' ? featured : featured.filter((s) => s.level === level);
  return (
    <section className="section" aria-labelledby="featured-h">
      <div className="container">
        <Reveal className="sectionhead">
          <div><h2 id="featured-h"><T k="featured.title" /></h2><p className="muted"><T k="featured.sub" /></p></div>
          <LevelTabs value={level} onChange={setLevel} counts={counts} />
        </Reveal>
        {status === 'loading' && <SchemeSkeletonGrid count={6} />}
        {status === 'error' && <SchemeError onRetry={reload} />}
        {status === 'success' && <SchemeResults schemes={shown} />}
        <div className="sectionfoot"><Button to="/schemes" variant="secondary" iconRight={ArrowRight} className="btn--arrow"><T k="featured.viewAll" /></Button></div>
      </div>
    </section>
  );
}
