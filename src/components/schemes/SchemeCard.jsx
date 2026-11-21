import { Link } from 'react-router-dom';
import { ArrowRight, Bookmark, BookmarkCheck } from 'lucide-react';
import LevelTag from './LevelTag';
import StatusBadge from '../common/StatusBadge';
import T from '../common/T';
import { getCategory } from '../../data/categories';
import { schemeKey } from '../../data/schemes';
import useSavedSchemes from '../../hooks/useSavedSchemes';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';

// Reusable scheme card. view: 'grid' | 'list'
export default function SchemeCard({ scheme, view = 'grid' }) {
  const cat = getCategory(scheme.category);
  const CatIcon = cat.icon;
  const { isSaved, toggle } = useSavedSchemes();
  const { t } = useLanguage();
  const toast = useToast();
  const saved = isSaved(scheme.id);
  const name = t(schemeKey(scheme.id, 'name'));

  const onSave = () => {
    const nowSaved = toggle(scheme.id);
    toast.success(nowSaved ? t('toast.schemeSaved') : t('toast.schemeRemoved'), 2400);
  };

  return (
    <article className={`schemecard schemecard--${view}`} style={{ '--cat': cat.accent }}>
      <div className="schemecard__top">
        <LevelTag level={scheme.level} />
        <button type="button" className={`schemecard__save${saved ? ' is-saved' : ''}`} onClick={onSave} aria-pressed={saved} aria-label={`${saved ? t('card.unsave') : t('card.save')}: ${name}`}>
          {saved ? <BookmarkCheck size={19} aria-hidden="true" /> : <Bookmark size={19} aria-hidden="true" />}
        </button>
      </div>
      <div className="schemecard__body">
        <p className="schemecard__cat"><span className="schemecard__caticon"><CatIcon size={15} aria-hidden="true" /></span><T k={`cat.${scheme.category}`} /></p>
        <h3 className="schemecard__name">
          <Link to={`/schemes/${scheme.id}`} className="schemecard__link"><T k={schemeKey(scheme.id, 'name')} /></Link>
        </h3>
        <p className="schemecard__short"><T k={schemeKey(scheme.id, 'short')} /></p>
        <p className="schemecard__benefit">
          <span className="schemecard__benefitlabel"><T k="card.supportType" /></span>
          <strong><T k={`benefit.${scheme.benefitType}`} /></strong>
        </p>
      </div>
      <div className="schemecard__foot">
        <StatusBadge status={scheme.status} size="sm" />
        <span className="schemecard__go" aria-hidden="true"><T k="card.view" /><ArrowRight size={17} /></span>
      </div>
    </article>
  );
}
