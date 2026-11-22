import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight, CheckCircle2, CircleHelp, ExternalLink, Pencil, ShieldAlert, Sparkles, XCircle } from 'lucide-react';
import Button from '../../components/common/Button';
import PageHeader from '../../components/common/PageHeader';
import { CardSkeleton } from '../../components/common/Skeleton';
import { useLanguage } from '../../context/LanguageContext';
import { backendApi } from '../../services/backendApi';

// Maps the deterministic backend outcome to the four labels shown to citizens. Nothing here decides eligibility.
export const groupOf = (item) => (item.outcome === 'PASS' ? 'likely' : item.outcome === 'FAIL' ? 'not' : item.missing?.length ? 'needsInfo' : 'needsVerification');
const ORDER = ['likely', 'needsInfo', 'needsVerification', 'not'];
const ICON = { likely: CheckCircle2, needsInfo: CircleHelp, needsVerification: ShieldAlert, not: XCircle };
const ruleLabel = (r, language) => (language === 'kn' && r.question_kn ? r.question_kn : r.question_en || r.code);

export default function OnboardingResults() {
  const { t, language } = useLanguage();
  const [state, setState] = useState({ status: 'loading', data: null });
  const load = useCallback(() => {
    setState({ status: 'loading', data: null });
    backendApi.schemeMatches(language).then((data) => setState({ status: 'ready', data })).catch(() => setState({ status: 'error', data: null }));
  }, [language]);
  useEffect(load, [load]);

  const { status, data } = state;
  const groups = ORDER.map((g) => [g, (data?.items || []).filter((i) => groupOf(i) === g)]).filter(([, list]) => list.length);

  return (
    <div className="onresults">
      <PageHeader icon={Sparkles} title={t('ob.results.title')} description={t('ob.results.desc')}
        actions={<><Button to="/profile" variant="secondary" iconLeft={Pencil}>{t('ob.results.editProfile')}</Button><Button to="/onboarding" variant="ghost">{t('ob.results.redo')}</Button></>} />

      {status === 'loading' && <div role="status" aria-label={t('ob.results.loading')} className="onresults__skeletons"><CardSkeleton /><CardSkeleton /><span className="sr-only">{t('ob.results.loading')}</span></div>}
      {status === 'error' && <div className="oberror" role="alert"><AlertTriangle size={20} aria-hidden="true" /><div><strong>{t('ob.results.error')}</strong></div><Button size="sm" variant="secondary" onClick={load}>{t('ob.results.retry')}</Button></div>}
      {status === 'ready' && !data.profile_confirmed && (
        <div className="callout" role="status"><p>{t('ob.results.unconfirmed')}</p><Button to="/onboarding" size="sm">{t('ob.results.startOnboarding')}</Button></div>
      )}
      {status === 'ready' && data.items.length === 0 && <p className="muted">{t('ob.results.empty')}</p>}
      {status === 'ready' && groups.map(([g, list]) => {
        const Icon = ICON[g];
        return (
          <section key={g} className="onres-group" aria-labelledby={`g-${g}`}>
            <h2 id={`g-${g}`} className={`onres-group__title onres-group__title--${g}`}><Icon size={22} aria-hidden="true" />{t(`ob.results.group.${g}`)} <span className="onres-count">{list.length}</span></h2>
            <p className="muted">{t(`ob.results.groupHint.${g}`)}</p>
            <ul className="onres-list">
              {list.map((item) => (
                <li key={item.scheme.id} className={`card onres-card onres-card--${g}`}>
                  <header><h3>{item.scheme.name}</h3><span className={`onres-badge onres-badge--${g}`}>{t(`ob.results.group.${g}`)}</span></header>
                  <p className="muted">{item.scheme.summary}</p>
                  <RuleList title={t('ob.results.matched')} items={item.passed} language={language} kind="ok" />
                  <RuleList title={t('ob.results.notMet')} items={item.failed} language={language} kind="no" />
                  <RuleList title={t('ob.results.missing')} items={item.missing} language={language} kind="gap" />
                  <p className="onres-next"><strong>{t('ob.results.next')}:</strong> {item.next_action}</p>
                  <div className="cluster">
                    <Button to={`/schemes/${item.scheme.id}`} size="sm" variant="secondary">{t('ob.results.view')}</Button>
                    <Button to={`/apply/${item.scheme.id}/eligibility`} size="sm" iconRight={ArrowRight}>{t('ob.results.prepare')}</Button>
                    {item.scheme.source_url && <a className="onres-source" href={item.scheme.source_url} target="_blank" rel="noopener noreferrer">{t('ob.results.source')} <ExternalLink size={14} aria-hidden="true" /></a>}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
      {status === 'ready' && <p className="muted onres-disclaimer"><ShieldAlert size={16} aria-hidden="true" /> {t('ob.results.disclaimer')}</p>}
    </div>
  );
}

function RuleList({ title, items, language, kind }) {
  if (!items?.length) return null;
  return (
    <div className={`onres-rules onres-rules--${kind}`}>
      <h4>{title}</h4>
      <ul>{items.map((r) => <li key={r.code}>{ruleLabel(r, language)}{r.source_url && <> <a href={r.source_url} target="_blank" rel="noopener noreferrer" aria-label={`${r.code} source`}><ExternalLink size={12} aria-hidden="true" /></a></>}</li>)}</ul>
    </div>
  );
}
