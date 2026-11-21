import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Bookmark, ClipboardList, FilePenLine, FileX2, PackageCheck } from 'lucide-react';
import Button from '../../components/common/Button';
import T from '../../components/common/T';
import EmptyState from '../../components/common/EmptyState';
import DemoNotice from '../../components/common/DemoNotice';
import Reveal from '../../components/common/Reveal';
import Timeline from '../../components/tracker/Timeline';
import SchemeCard from '../../components/schemes/SchemeCard';
import { SchemeSkeletonGrid } from '../../components/schemes/SchemeResults';
import StatCard from '../../components/citizen/StatCard';
import ApplicationCard from '../../components/citizen/ApplicationCard';
import PendingTasks from '../../components/citizen/PendingTasks';
import ProfileSummary from '../../components/citizen/ProfileSummary';
import ActivityFeed from '../../components/citizen/ActivityFeed';
import useCitizenData from '../../hooks/useCitizenData';
import useSavedSchemes from '../../hooks/useSavedSchemes';
import useSchemes from '../../hooks/useSchemes';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { applicationSteps } from '../../data/navigation';
import { getScheme, schemeKey } from '../../data/schemes';

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { data, summary, completeness } = useCitizenData();
  const { saved } = useSavedSchemes();
  const { status, data: allSchemes } = useSchemes();
  const apps = data.applications || [];
  const activeApps = apps.filter((a) => !a.packetReady);
  const [selected, setSelected] = useState(null);
  useEffect(() => { if (!selected || !apps.find((a) => a.id === selected)) setSelected((activeApps[0] || apps[0])?.id ?? null); }, [apps]); // eslint-disable-line react-hooks/exhaustive-deps
  const current = apps.find((a) => a.id === selected);
  const name = data.profile?.fullName || user?.name || '';

  const journey = useMemo(() => {
    if (!current) return [];
    const doneUpTo = current.packetReady ? 7 : current.stage;
    return applicationSteps.map((s, i) => ({ id: s.id, title: t(s.key), state: i < doneUpTo ? 'done' : i === doneUpTo && !current.packetReady ? 'current' : i === doneUpTo ? 'done' : 'upcoming', track: 'platform' }));
  }, [current, t]);

  const savedSchemes = allSchemes.filter((s) => saved.includes(s.id)).slice(0, 3);
  const docsByApp = (id) => (data.documents || []).filter((d) => d.appId === id);

  return (
    <div className="dash">
      <header className="dash__head">
        <div><h1><T k="dash.welcome" vars={{ name }} /></h1><p className="muted"><T k="dash.sub" /></p></div>
        <Button to="/schemes" iconRight={ArrowRight} className="btn--arrow"><T k="dash.apps.start" /></Button>
      </header>
      <DemoNotice k="dash.demoNote" />

      <ul className="dash__stats">
        <li><StatCard icon={ClipboardList} value={summary.active} label={t('dash.stat.active')} accent="#087d52" to={activeApps[0] ? `/apply/${activeApps[0].schemeId}/eligibility` : '/schemes'} /></li>
        <li><StatCard icon={Bookmark} value={saved.length} label={t('dash.stat.saved')} accent="#d9730d" to="/saved" /></li>
        <li><StatCard icon={FileX2} value={summary.pendingDocs} label={t('dash.stat.docs')} accent="#2f7fd1" to="/profile" /></li>
        <li><StatCard icon={FilePenLine} value={summary.pendingCorrections} label={t('dash.stat.corrections')} accent="#e5593f" to="/profile" /></li>
        <li><StatCard icon={PackageCheck} value={summary.packets} label={t('dash.stat.packets')} accent="#4f46a5" /></li>
      </ul>

      <div className="dash__grid">
        <div className="dash__main">
          <Reveal as="section" className="dashsec" aria-labelledby="apps-h">
            <h2 id="apps-h"><T k="dash.apps.title" /></h2>
            {apps.length === 0 ? (
              <EmptyState icon={ClipboardList} title={<T k="dash.apps.empty.title" />} description={<T k="dash.apps.empty.desc" />} action={<Button to="/schemes" iconRight={ArrowRight}><T k="dash.apps.start" /></Button>} />
            ) : (
              <div className="applist">
                {[...activeApps, ...apps.filter((a) => a.packetReady)].map((a) => {
                  const docs = docsByApp(a.id);
                  return <ApplicationCard key={a.id} app={a} pendingDocs={docs.filter((d) => d.status === 'missing').length} pendingCorrections={docs.filter((d) => d.status === 'needs-correction').length} />;
                })}
              </div>
            )}
          </Reveal>

          {current && (
            <Reveal as="section" className="dashsec card" aria-labelledby="journey-h">
              <h2 id="journey-h"><T k="dash.timeline.title" /></h2>
              {apps.length > 1 && (
                <div className="chips" role="group" aria-label={t('dash.timeline.title')}>
                  {apps.map((a) => <button key={a.id} type="button" className={`chip chip--select${a.id === selected ? ' is-on' : ''}`} aria-pressed={a.id === selected} onClick={() => setSelected(a.id)}>{t(schemeKey(a.schemeId, 'name')).split(' (')[0]}</button>)}
                </div>
              )}
              <p className="muted"><T k="dash.timeline.note" /></p>
              <Timeline key={current.id} items={journey} />
            </Reveal>
          )}

          <Reveal as="section" className="dashsec" aria-labelledby="saved-h">
            <div className="dashsec__head"><h2 id="saved-h"><T k="dash.saved.title" /></h2><Link to="/saved" className="dashsec__link"><T k="dash.viewAll" /><ArrowRight size={16} aria-hidden="true" /></Link></div>
            {status === 'loading' && <SchemeSkeletonGrid count={3} />}
            {status === 'success' && savedSchemes.length === 0 && (
              <EmptyState icon={Bookmark} title={<T k="dash.saved.empty.title" />} description={<T k="dash.saved.empty.desc" />} action={<Button to="/schemes" variant="secondary"><T k="nav.explore" /></Button>} />
            )}
            {status === 'success' && savedSchemes.length > 0 && <ul className="schemegrid schemegrid--3">{savedSchemes.map((s) => <li key={s.id}><SchemeCard scheme={s} /></li>)}</ul>}
          </Reveal>
        </div>

        <aside className="dash__side">
          <ProfileSummary name={name} email={user?.email} profile={data.profile} completeness={completeness} />
          <section className="card" aria-labelledby="tasks-h"><h2 id="tasks-h" className="dash__h3"><T k="dash.tasks.title" /></h2><PendingTasks documents={data.documents || []} profileCompleteness={completeness} /></section>
          <section className="card" aria-labelledby="act-h"><h2 id="act-h" className="dash__h3"><T k="dash.activity.title" /></h2><ActivityFeed items={data.activity || []} /></section>
        </aside>
      </div>
    </div>
  );
}
