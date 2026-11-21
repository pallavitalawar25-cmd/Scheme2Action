import { Link } from 'react-router-dom';
import { CheckCircle2, ChevronRight, FilePenLine, UploadCloud, UserRound } from 'lucide-react';
import T from '../common/T';
import { schemeKey } from '../../data/schemes';
import { useLanguage } from '../../context/LanguageContext';

export default function PendingTasks({ documents, profileCompleteness }) {
  const { t } = useLanguage();
  const tasks = [];
  documents.filter((d) => d.status === 'needs-correction').forEach((d) => tasks.push({ id: d.id, icon: FilePenLine, tone: 'warn', title: t('task.correct', { doc: t(d.docKey) }), sub: t('task.for', { scheme: t(schemeKey(d.schemeId, 'name')) }), to: `/apply/${d.schemeId}/corrections` }));
  documents.filter((d) => d.status === 'missing').forEach((d) => tasks.push({ id: d.id, icon: UploadCloud, tone: 'info', title: t('task.upload', { doc: t(d.docKey) }), sub: t('task.for', { scheme: t(schemeKey(d.schemeId, 'name')) }), to: `/apply/${d.schemeId}/upload` }));
  if (profileCompleteness < 100) tasks.push({ id: 'profile', icon: UserRound, tone: 'info', title: t('task.profile'), sub: t('dash.profile.complete', { percent: profileCompleteness }), to: '/profile' });

  if (!tasks.length) return <p className="alldone"><CheckCircle2 size={20} aria-hidden="true" /><T k="dash.tasks.empty" /></p>;
  return (
    <ul className="tasklist">
      {tasks.map((task) => {
        const Icon = task.icon;
        return (
          <li key={task.id}>
            <Link to={task.to} className={`task task--${task.tone}`}>
              <span className="task__icon"><Icon size={18} aria-hidden="true" /></span>
              <span className="task__text"><strong>{task.title}</strong><small>{task.sub}</small></span>
              <ChevronRight size={18} aria-hidden="true" className="task__go" />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
