import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Bookmark, BookmarkCheck, CalendarCheck, ExternalLink, FileQuestion, Share2, ShieldAlert, Check } from 'lucide-react';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import Skeleton from '../../components/common/Skeleton';
import DemoNotice from '../../components/common/DemoNotice';
import T from '../../components/common/T';
import LevelTag from '../../components/schemes/LevelTag';
import Reveal from '../../components/common/Reveal';
import Timeline from '../../components/tracker/Timeline';
import useSchemes from '../../hooks/useSchemes';
import useSavedSchemes from '../../hooks/useSavedSchemes';
import { getCategory } from '../../data/categories';
import { sampleDocuments, schemeKey } from '../../data/schemes';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../utils/format';

const SECTIONS = ['overview', 'benefits', 'eligibility', 'documents', 'conditions', 'process', 'sources'];

function SectionNav({ active, variant }) {
  const { t } = useLanguage();
  return (
    <nav className={`dnav dnav--${variant}`} aria-label={t('detail.onPage')}>
      {variant === 'side' && <p className="dnav__title"><T k="detail.onPage" /></p>}
      <ul>
        {SECTIONS.map((s) => (
          <li key={s}><a href={`#${s}`} className={active === s ? 'is-active' : ''} aria-current={active === s ? 'location' : undefined}>
            {active === s && variant === 'side' && <motion.span layoutId="dnav-active" className="dnav__marker" />}
            <T k={`detail.s.${s}`} />
          </a></li>
        ))}
      </ul>
    </nav>
  );
}

function DetailSkeleton() {
  return (
    <div className="container section" role="status" aria-label="Loading">
      <Skeleton width="40%" height={16} /><div style={{ height: 20 }} />
      <Skeleton width="75%" height={44} /><div style={{ height: 14 }} />
      <Skeleton width="90%" height={18} /><div style={{ height: 28 }} />
      <Skeleton height={220} />
    </div>
  );
}

export default function SchemeDetails() {
  const { id } = useParams();
  const { status, data, reload } = useSchemes();
  const { t, language } = useLanguage();
  const toast = useToast();
  const { isSaved, toggle } = useSavedSchemes();
  const [active, setActive] = useState('overview');
  const scheme = data.find((s) => s.id === id);

  useEffect(() => {
    if (!scheme) return undefined;
    const obs = new IntersectionObserver((entries) => {
      const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (visible) setActive(visible.target.id);
    }, { rootMargin: '-20% 0px -65% 0px' });
    SECTIONS.forEach((s) => { const el = document.getElementById(s); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, [scheme]);

  if (status === 'loading') return <DetailSkeleton />;
  if (status === 'error') {
    return <div className="container section"><EmptyState icon={ShieldAlert} title={<T k="error.title" />} description={<T k="error.desc" />} action={<Button onClick={reload}><T k="error.retry" /></Button>} /></div>;
  }
  if (!scheme) {
    return <div className="container section"><EmptyState icon={FileQuestion} title={<T k="detail.notFound.title" />} description={<T k="detail.notFound.desc" />} action={<Button to="/schemes" iconLeft={ArrowLeft}><T k="detail.back" /></Button>} /></div>;
  }

  const cat = getCategory(scheme.category);
  const CatIcon = cat.icon;
  const saved = isSaved(scheme.id);
  const docs = sampleDocuments[scheme.id];
  const name = t(schemeKey(scheme.id, 'name'));
  const eligibilityHref = `/apply/${scheme.id}/eligibility`;

  const onSave = () => toast.success(toggle(scheme.id) ? t('toast.schemeSaved') : t('toast.schemeRemoved'), 2400);
  const onShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: name, url });
      else { await navigator.clipboard.writeText(url); toast.success(t('detail.shareCopied'), 2600); }
    } catch (e) { if (e?.name !== 'AbortError') toast.warning(t('detail.shareFail')); }
  };

  const steps = [1, 2, 3, 4, 5].map((n) => ({ id: n, title: t(`how.${n}.title`), desc: t(`how.${n}.desc`), state: 'upcoming' }));

  return (
    <div className="details" style={{ '--cat': cat.accent }}>
      <header className="dhero">
        <div className="container dhero__inner">
          <nav aria-label="Breadcrumb" className="crumbs">
            <ol>
              <li><Link to="/">{t('nav.home')}</Link></li>
              <li><Link to="/schemes">{t('page.schemes')}</Link></li>
              <li><span aria-current="page">{name}</span></li>
            </ol>
          </nav>
          <div className="dhero__tags">
            <LevelTag level={scheme.level} full />
            <Link to={`/categories/${cat.slug}`} className="cattag"><CatIcon size={15} aria-hidden="true" /><T k={`cat.${cat.slug}`} /></Link>
            <StatusBadge status={scheme.status} />
          </div>
          <h1 className="dhero__title"><T k={schemeKey(scheme.id, 'name')} /></h1>
          <p className="dhero__short"><T k={schemeKey(scheme.id, 'short')} /></p>
          <dl className="dhero__meta">
            <div><dt><T k="detail.department" /></dt><dd><T k={schemeKey(scheme.id, 'dept')} /></dd></div>
            <div><dt><T k="detail.readiness" /></dt><dd><T k={`readiness.${scheme.readiness}`} /></dd></div>
            <div><dt><T k="detail.lastVerified" /></dt><dd><CalendarCheck size={15} aria-hidden="true" />{scheme.lastVerified ? formatDate(scheme.lastVerified, language) : <T k="detail.notVerified" />}</dd></div>
          </dl>
          <div className="dhero__actions">
            <Button to={eligibilityHref} size="lg" iconRight={ArrowRight} className="btn--arrow"><T k="detail.check" /></Button>
            <Button variant="secondary" size="lg" iconLeft={saved ? BookmarkCheck : Bookmark} onClick={onSave} aria-pressed={saved}><T k={saved ? 'detail.saved' : 'detail.save'} /></Button>
            <Button variant="ghost" size="lg" iconLeft={Share2} onClick={onShare}><T k="detail.share" /></Button>
            <Button to="/schemes" variant="ghost" size="lg" iconLeft={ArrowLeft}><T k="detail.back" /></Button>
          </div>
        </div>
      </header>

      <div className="container dbody">
        <DemoNotice />
        <SectionNav active={active} variant="chips" />
        <div className="dgrid">
          <div className="dmain">
            <Reveal as="section" id="overview" className="dsec"><h2><T k="detail.s.overview" /></h2>
              <p><T k={schemeKey(scheme.id, 'short')} /></p><p className="muted"><T k="detail.overview.note" /></p></Reveal>

            <Reveal as="section" id="benefits" className="dsec"><h2><T k="detail.s.benefits" /></h2>
              <p className="dfact"><span><T k="detail.benefits.type" /></span><strong><T k={`benefit.${scheme.benefitType}`} /></strong></p>
              <p className="callout"><T k="detail.benefits.pending" /></p></Reveal>

            <Reveal as="section" id="eligibility" className="dsec"><h2><T k="detail.s.eligibility" /></h2>
              <p><T k="detail.elig.intro" vars={{ audience: t(schemeKey(scheme.id, 'audience')) }} /></p>
              <p className="callout"><T k="detail.elig.pending" /></p></Reveal>

            <Reveal as="section" id="documents" className="dsec"><h2><T k="detail.s.documents" /></h2>
              {docs ? (
                <>
                  <p className="muted"><StatusBadge status="mock" size="sm" /> <T k="notice.sampleList" /></p>
                  <ul className="docgrid">
                    {docs.map((d) => (
                      <li key={d.key} className="doccard">
                        <span className="doccard__name"><T k={d.key} /></span>
                        <span className="doccard__why"><T k={`${d.key}.why`} /></span>
                        <span className="doccard__meta">
                          <span className={`doccard__req${d.mandatory ? ' is-req' : ''}`}>{d.mandatory && <Check size={13} aria-hidden="true" />}<T k={d.mandatory ? 'detail.docs.mandatory' : 'detail.docs.optional'} /></span>
                          <span className="doccard__fmt"><T k="detail.docs.formats" /></span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </>
              ) : <p className="callout"><T k="detail.docs.pending" /></p>}
            </Reveal>

            <Reveal as="section" id="conditions" className="dsec"><h2><T k="detail.s.conditions" /></h2>
              <ul className="notelist">{[1, 2, 3].map((n) => <li key={n}><ShieldAlert size={18} aria-hidden="true" /><T k={`detail.cond.${n}`} /></li>)}</ul></Reveal>

            <Reveal as="section" id="process" className="dsec"><h2><T k="detail.s.process" /></h2>
              <p className="muted"><T k="detail.process.note" /></p><Timeline items={steps} /></Reveal>

            <Reveal as="section" id="sources" className="dsec"><h2><T k="detail.s.sources" /></h2>
              <div className="sourcecard">
                <div><p className="sourcecard__label"><T k="detail.sources.portal" /></p><p className="sourcecard__url">{scheme.source.replace(/^https?:\/\//, '')}</p>
                  <p className="muted sourcecard__note"><T k="detail.sources.unchecked" /></p></div>
                <Button href={scheme.source} target="_blank" rel="noopener noreferrer" variant="secondary" iconRight={ExternalLink}><T k="detail.sources.open" /><span className="sr-only"> ({t('detail.sources.new')})</span></Button>
              </div>
              <p className="muted"><T k="detail.sources.note" /></p></Reveal>
          </div>

          <aside className="dside"><SectionNav active={active} variant="side" />
            <div className="dside__cta"><Button to={eligibilityHref} block iconRight={ArrowRight} className="btn--arrow"><T k="detail.check" /></Button></div>
          </aside>
        </div>
      </div>

      <div className="ctabar"><Button to={eligibilityHref} block size="lg" iconRight={ArrowRight}><T k="detail.ctaBar" /></Button></div>
    </div>
  );
}
