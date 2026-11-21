import { Link } from 'react-router-dom';
import { ArrowUpRight, Clock } from 'lucide-react';
import Reveal from '../common/Reveal';
import StatusBadge from '../common/StatusBadge';
import LevelTag from '../schemes/LevelTag';
import T from '../common/T';
import { schemes, schemeKey } from '../../data/schemes';
import { useLanguage } from '../../context/LanguageContext';
import { formatDate } from '../../utils/format';

export default function RecentlyUpdated() {
  const { language, t } = useLanguage();
  const recent = [...schemes].sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated)).slice(0, 5);
  return (
    <section className="section" aria-labelledby="recent-h">
      <div className="container container--narrow">
        <Reveal><h2 id="recent-h"><T k="recent.title" /></h2><p className="muted"><T k="recent.sub" /></p></Reveal>
        <ul className="recent">
          {recent.map((s, i) => (
            <Reveal as="li" key={s.id} delay={i * 0.06}>
              <Link to={`/schemes/${s.id}`} className="recent__row">
                <span className="recent__main">
                  <span className="recent__name"><T k={schemeKey(s.id, 'name')} /></span>
                  <span className="recent__meta"><Clock size={14} aria-hidden="true" />{t('recent.updated', { date: formatDate(s.lastUpdated, language) })}</span>
                </span>
                <LevelTag level={s.level} />
                <StatusBadge status={s.status} size="sm" />
                <ArrowUpRight size={18} aria-hidden="true" className="recent__arrow" />
              </Link>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
