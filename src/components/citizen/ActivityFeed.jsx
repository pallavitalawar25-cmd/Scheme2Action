import { Bookmark, FileUp, HeartHandshake, ListChecks, PlayCircle, UserPlus, UserRound } from 'lucide-react';
import T from '../common/T';
import { schemeKey } from '../../data/schemes';
import { useLanguage } from '../../context/LanguageContext';
import { formatDate } from '../../utils/format';

const ICONS = { saved: Bookmark, started: PlayCircle, uploaded: FileUp, eligibility: ListChecks, joined: UserPlus, helperStart: HeartHandshake, helperEnd: HeartHandshake, profile: UserRound };

export default function ActivityFeed({ items }) {
  const { t, language } = useLanguage();
  if (!items.length) return <p className="muted"><T k="dash.activity.empty" /></p>;
  return (
    <ol className="feed">
      {items.slice(0, 6).map((a) => {
        const Icon = ICONS[a.type] || PlayCircle;
        const text = t(`act.${a.type}`, { scheme: a.schemeId ? t(schemeKey(a.schemeId, 'name')) : '', doc: a.docKey ? t(a.docKey) : '' });
        return (
          <li key={a.id} className="feed__item">
            <span className="feed__icon"><Icon size={16} aria-hidden="true" /></span>
            <div><p className="feed__text">{text}</p><time className="feed__time" dateTime={a.at}>{formatDate(a.at, language)}</time></div>
          </li>
        );
      })}
    </ol>
  );
}
