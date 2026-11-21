import { ArrowRight, FileWarning, FileX2 } from 'lucide-react';
import Button from '../common/Button';
import ProgressRing from '../common/ProgressRing';
import StatusBadge from '../common/StatusBadge';
import T from '../common/T';
import LevelTag from '../schemes/LevelTag';
import { applicationSteps } from '../../data/navigation';
import { getScheme, schemeKey } from '../../data/schemes';
import { applicationProgress } from '../../services/citizenStore';
import { useLanguage } from '../../context/LanguageContext';
import { formatDate } from '../../utils/format';

export default function ApplicationCard({ app, pendingDocs = 0, pendingCorrections = 0 }) {
  const { t, language } = useLanguage();
  const scheme = getScheme(app.schemeId);
  const step = applicationSteps[app.stage] || applicationSteps[0];
  const percent = applicationProgress(app);
  const target = app.packetReady ? 'packet' : step.path;
  return (
    <article className="appcard">
      <ProgressRing value={percent} size={92} stroke={9} tone={app.packetReady ? 'emerald' : 'saffron'} label={t('dash.progress', { percent })} />
      <div className="appcard__body">
        <div className="appcard__tags">{scheme && <LevelTag level={scheme.level} />}{app.packetReady && <StatusBadge status="pass" size="sm" />}</div>
        <h3 className="appcard__name"><T k={schemeKey(app.schemeId, 'name')} /></h3>
        <p className="appcard__stage">
          {app.packetReady ? <T k="dash.packetReady" /> : <><span className="muted"><T k="dash.stage" />:</span> <strong><T k={step.key} /></strong></>}
          <span className="muted"> · <T k="recent.updated" vars={{ date: formatDate(app.updatedAt, language) }} /></span>
        </p>
        {(pendingDocs > 0 || pendingCorrections > 0) && (
          <ul className="appcard__flags">
            {pendingDocs > 0 && <li><FileX2 size={14} aria-hidden="true" /><T k="dash.pendingDocs" vars={{ count: pendingDocs }} /></li>}
            {pendingCorrections > 0 && <li className="is-warn"><FileWarning size={14} aria-hidden="true" /><T k="dash.pendingCorr" vars={{ count: pendingCorrections }} /></li>}
          </ul>
        )}
      </div>
      <Button to={`/apply/${app.schemeId}/${target}`} iconRight={ArrowRight} className="btn--arrow appcard__btn" variant={app.packetReady ? 'secondary' : 'primary'}>
        <T k={app.packetReady ? 'dash.viewPacket' : 'dash.continue'} />
      </Button>
    </article>
  );
}
