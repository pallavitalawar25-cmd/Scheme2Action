import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BadgeCheck, BookOpenCheck, Clock3, FilePlus2, FileText, GitCompareArrows, Globe2, History, Library, Plus, Search, ShieldAlert, ShieldCheck, XCircle } from 'lucide-react';
import Button from '../../components/common/Button';
import DemoNotice from '../../components/common/DemoNotice';
import PageHeader from '../../components/common/PageHeader';
import T from '../../components/common/T';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { getCategory } from '../../data/categories';
import { schemeKey } from '../../data/schemes';
import { readAdminData, writeAdminData } from '../../services/adminDemoStore';
import { backendApi } from '../../services/backendApi';

const dateLabel = (value, locale) => value ? new Date(value).toLocaleDateString(locale === 'kn' ? 'kn-IN' : 'en-IN') : '—';
const statusKeys = { verified: 'admin.status.verified', 'info-verified': 'admin.status.infoVerified', pending: 'admin.status.pending', draft: 'admin.status.draft', approved: 'admin.status.approved', rejected: 'admin.status.rejected' };

export default function AdminPanel() {
  const location = useLocation(); const navigate = useNavigate(); const params = useParams(); const { user, isDemoAuth } = useAuth(); const { t, language } = useLanguage();
  const [data, setData] = useState(readAdminData); const [search, setSearch] = useState(''); const [filter, setFilter] = useState('all'); const [sourceForm, setSourceForm] = useState({ schemeId: '', url: '', note: '' });
  const [apiStatus, setApiStatus] = useState(isDemoAuth ? 'ready' : 'loading'); const [apiError, setApiError] = useState(null);
  const commit = (next) => { setData(writeAdminData(next)); };
  const refreshApiData = useCallback(async () => {
    setApiStatus('loading'); setApiError(null);
    try {
      const [schemeResult, ruleResult, policyResult, sourceResult] = await Promise.all([backendApi.adminSchemes(), backendApi.adminRules(), backendApi.adminPolicies(), backendApi.adminSources()]);
      const schemes = (schemeResult.items || []).map((item) => ({ ...item, nameEn: item.name_en || item.nameEn, nameKn: item.name_kn || item.nameKn, level: item.government_level || item.level, status: item.verification_status || item.status, source: item.source_url || item.source, pendingChange: item.pending_change, history: [] }));
      const rules = (ruleResult.items || []).map((item) => ({ id: String(item.id), schemeId: item.scheme_id, title: item.question_en, description: item.source_evidence, source: item.source_url, status: item.status, origin: item.origin, updatedAt: item.updated_at, reviewedBy: item.reviewed_by ? String(item.reviewed_by) : '', history: [] }));
      const policies = (policyResult.items || []).map((item) => ({ id: String(item.id), schemeId: item.scheme_id, title: item.title, before: item.before, after: item.after, source: item.source_url, status: item.status, updatedAt: item.created_at, reviewedBy: item.reviewed_by ? String(item.reviewed_by) : '' }));
      const extraSources = (sourceResult.items || []).map((item) => ({ id: String(item.id), schemeId: item.scheme_id, url: item.url, note: item.note, verificationStatus: item.verification_status }));
      const [schemeHistories, ruleHistories] = await Promise.all([Promise.all(schemes.map((item) => backendApi.schemeHistory(item.id).catch(() => ({ versions: [], changes: [] })))), Promise.all(rules.map((item) => backendApi.ruleHistory(item.id).catch(() => ({ items: [] }))))]);
      schemes.forEach((item, index) => { const history = schemeHistories[index]; item.history = (history.versions || []).map((version) => ({ version: version.version, at: version.created_at, actor: `Admin ${version.actor_id}`, summary: version.summary || version.status })); });
      rules.forEach((item, index) => { item.history = (ruleHistories[index].items || []).map((entry) => ({ status: entry.event, at: entry.created_at, actor: `Admin ${entry.actor_id}`, version: entry.version })); });
      setData({ schemes, rules, policies, extraSources }); setApiStatus('ready');
    } catch (error) { setApiError(error); setApiStatus('error'); }
  }, []);
  useEffect(() => { if (!isDemoAuth) refreshApiData(); }, [isDemoAuth, refreshApiData]);
  const path = location.pathname;
  const route = path === '/admin' ? 'dashboard' : path.includes('/rulebook/') && path.includes('/history') ? 'ruleHistory' : path.includes('/history') ? 'history' : path.includes('/new') || path.endsWith('/edit') ? 'editor' : path.includes('/sources') ? 'sources' : path.includes('/rulebook') ? 'rulebook' : path.includes('/policy-changes') ? 'policies' : 'schemes';
  const { schemeId, ruleId } = params;
  const scheme = data.schemes.find((item) => item.id === schemeId);
  const displayName = (item) => language === 'kn' ? item.nameKn || t(schemeKey(item.id, 'name')) : item.nameEn || t(schemeKey(item.id, 'name'));
  const matchesSearch = (value) => `${value.title || ''} ${value.id || ''} ${value.nameEn || ''} ${value.schemeId || ''} ${value.url || ''} ${value.source || ''} ${value.note || ''} ${value.description || ''} ${value.before || ''} ${value.after || ''}`.toLowerCase().includes(search.toLowerCase());
  const stats = useMemo(() => ({ schemes: data.schemes.length, pending: data.schemes.filter((s) => s.status === 'pending').length, drafts: data.rules.filter((r) => r.status === 'draft').length, policies: data.policies.filter((p) => p.status === 'pending').length }), [data]);

  const saveScheme = async (event) => {
    event.preventDefault(); const values = Object.fromEntries(new FormData(event.currentTarget)); const id = values.id.trim().toLowerCase();
    const previous = data.schemes.find((item) => item.id === id);
    if (!isDemoAuth) {
      try { await backendApi.saveScheme({ id, name_en: values.nameEn.trim(), name_kn: values.nameKn.trim(), summary_en: previous?.summary_en || previous?.summaryEn || '', summary_kn: previous?.summary_kn || previous?.summaryKn || '', category: values.category, government_level: values.level, readiness: values.readiness, source_url: values.source.trim(), verification_status: 'pending' }, previous ? id : undefined); await refreshApiData(); navigate('/admin/schemes'); }
      catch (error) { setApiError(error); setApiStatus('error'); }
      return;
    }
    const version = previous ? previous.version + 1 : 1;
    const updated = { ...previous, id, nameEn: values.nameEn.trim(), nameKn: values.nameKn.trim(), category: values.category, level: values.level, status: values.status, readiness: values.readiness, benefitType: values.benefitType.trim() || 'other', source: values.source.trim(), lastUpdated: new Date().toISOString().slice(0, 10), version, history: [...(previous?.history || []), { version, at: new Date().toISOString(), actor: user?.name || 'Demo Admin', summary: previous ? 'Scheme details edited by an administrator' : 'Scheme added as a demonstration record' }] };
    commit({ ...data, schemes: previous ? data.schemes.map((item) => item.id === id ? updated : item) : [updated, ...data.schemes] }); navigate('/admin/schemes');
  };
  const reviewRule = async (targetRuleId, status) => { if (!isDemoAuth) { try { await backendApi.reviewRule(targetRuleId, status); await refreshApiData(); } catch (error) { setApiError(error); } return; } const now = new Date().toISOString(); const actor = user?.name || 'Demo Admin'; commit({ ...data, rules: data.rules.map((rule) => rule.id === targetRuleId ? { ...rule, status, reviewedBy: actor, reviewedAt: now, history: [...(rule.history || []), { status, actor, at: now }] } : rule) }); };
  const reviewPolicy = async (policyId, status) => { if (!isDemoAuth) { try { await backendApi.reviewPolicy(policyId, status); await refreshApiData(); } catch (error) { setApiError(error); } return; } commit({ ...data, policies: data.policies.map((policy) => policy.id === policyId ? { ...policy, status, reviewedBy: user?.name || 'Demo Admin', reviewedAt: new Date().toISOString() } : policy) }); };
  const reviewSchemeChange = async (changeId, decision) => { try { await backendApi.reviewSchemeChange(changeId, decision); await refreshApiData(); } catch (error) { setApiError(error); } };
  const reviewSource = async (sourceId, decision) => { try { await backendApi.reviewSource(sourceId, decision); await refreshApiData(); } catch (error) { setApiError(error); } };
  const saveSource = async (event) => { event.preventDefault(); const values = Object.fromEntries(new FormData(event.currentTarget)); try { if (isDemoAuth) { const source = { ...sourceForm, id: `source-${Date.now()}` }; commit({ ...data, extraSources: [...(data.extraSources || []), source] }); } else { await backendApi.addSource(values.schemeId, { url: values.url, title: values.title || 'Official source reference', note: values.note }); await refreshApiData(); } setSourceForm({ schemeId: '', url: '', note: '' }); } catch (error) { setApiError(error); } };
  const saveRule = async (event) => { event.preventDefault(); const values = Object.fromEntries(new FormData(event.currentTarget)); const body = { code: values.code, question_en: values.questionEn, question_kn: values.questionKn, expected_answer: values.expectedAnswer, origin: values.origin, source_url: values.sourceUrl, source_evidence: values.sourceEvidence, applies_when: {} }; try { if (isDemoAuth) { const item = { id: `draft-${Date.now()}`, schemeId: values.schemeId, title: values.questionEn, description: values.sourceEvidence, source: values.sourceUrl, status: 'draft', origin: values.origin, updatedAt: new Date().toISOString(), history: [{ status: 'draft', actor: user?.name || 'Demo Admin', at: new Date().toISOString() }] }; commit({ ...data, rules: [item, ...data.rules] }); } else { await backendApi.addRule(values.schemeId, body); await refreshApiData(); } event.currentTarget.reset(); } catch (error) { setApiError(error); } };
  const savePolicy = async (event) => { event.preventDefault(); const values = Object.fromEntries(new FormData(event.currentTarget)); const body = { scheme_id: values.schemeId, title: values.title, before_text: values.before, after_text: values.after, source_url: values.sourceUrl, source_evidence: values.sourceEvidence }; try { if (isDemoAuth) { const item = { id: `policy-${Date.now()}`, schemeId: values.schemeId, title: values.title, before: values.before, after: values.after, source: values.sourceUrl, status: 'pending', updatedAt: new Date().toISOString() }; commit({ ...data, policies: [item, ...data.policies] }); } else { await backendApi.addPolicy(body); await refreshApiData(); } event.currentTarget.reset(); } catch (error) { setApiError(error); } };
  const pageHead = (titleKey, descKey, icon) => <PageHeader icon={icon} title={<T k={titleKey} />} description={<T k={descKey} />} />;
  const toolbar = (statuses = null) => <div className="admin__toolbar"><label className="admin__search"><Search size={18} aria-hidden="true" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t('admin.search')} aria-label={t('admin.search')} /></label>{statuses && <label><span className="sr-only"><T k="admin.filterStatus" /></span><select value={filter} onChange={(event) => setFilter(event.target.value)}><option value="all">{t('admin.filterAll')}</option>{statuses.map((status) => <option value={status} key={status}>{t(statusKeys[status] || `admin.status.${status}`)}</option>)}</select></label>}</div>;
  const schemeLabel = (id) => { const found = data.schemes.find((s) => s.id === id); return found ? displayName(found) : id; };

  if (!isDemoAuth && apiStatus === 'loading') return <div className="adminpage container section" role="status" aria-live="polite">{t('common.loading')}</div>;
  if (!isDemoAuth && apiStatus === 'error') return <div className="adminpage container section"><p role="alert">{apiError?.message || t('error.desc')}</p><Button onClick={refreshApiData}><T k="error.retry" /></Button></div>;
  return <div className="adminpage container section">
    {isDemoAuth && <DemoNotice k="admin.demoNotice" />}
    {route === 'dashboard' && <>
      {pageHead('admin.dashboard.title', 'admin.dashboard.desc', ShieldCheck)}
      <div className="admin__stats"><article><Library /><strong>{stats.schemes}</strong><span><T k="admin.metric.schemes" /></span></article><article><Clock3 /><strong>{stats.pending}</strong><span><T k="admin.metric.pending" /></span></article><article><BookOpenCheck /><strong>{stats.drafts}</strong><span><T k="admin.metric.drafts" /></span></article><article><GitCompareArrows /><strong>{stats.policies}</strong><span><T k="admin.metric.policies" /></span></article></div>
      <h2><T k="admin.reviewQueue" /></h2><div className="admin__cards"><Link to="/admin/rulebook" className="admin__card"><BookOpenCheck /><span><strong><T k="admin.rulebook.title" /></strong><small>{stats.drafts} · <T k="admin.metric.drafts" /></small></span><ArrowRight /></Link><Link to="/admin/policy-changes" className="admin__card"><GitCompareArrows /><span><strong><T k="admin.policies.title" /></strong><small>{stats.policies} · <T k="admin.metric.policies" /></small></span><ArrowRight /></Link><Link to="/admin/schemes" className="admin__card"><Library /><span><strong><T k="admin.schemes.title" /></strong><small><T k="admin.manageRecords" /></small></span><ArrowRight /></Link></div>
      <section className="admin__callout"><ShieldAlert /><p><T k="admin.approvalPrinciple" /></p></section>
    </>}

    {route === 'schemes' && <>
      {pageHead('admin.schemes.title', 'admin.schemes.desc', Library)}
      <div className="admin__toolbar-row">{toolbar(['pending', 'verified', 'info-verified'])}<Button to="/admin/schemes/new" iconLeft={Plus}><T k="admin.addScheme" /></Button></div>
      <div className="admin__tablewrap"><table className="admin__table"><thead><tr><th><T k="admin.scheme" /></th><th><T k="admin.category" /></th><th><T k="admin.level" /></th><th><T k="admin.status" /></th><th><T k="admin.version" /></th><th><T k="admin.actions" /></th></tr></thead><tbody>{data.schemes.filter(matchesSearch).filter((s) => filter === 'all' || s.status === filter).map((item) => <tr key={item.id}><td><strong>{displayName(item)}</strong><small>{item.id}</small>{item.pendingChange && <small><T k="admin.status.pending" /> · {item.pendingChange.summary}</small>}</td><td>{t(`cat.${getCategory(item.category)?.slug || item.category}`)}</td><td><T k={`level.${item.level}`} /></td><td><span className={`admin__badge admin__badge--${item.status}`}><T k={statusKeys[item.status] || 'admin.status.pending'} /></span></td><td>v{item.version || 1}</td><td className="admin__actions"><Link to={`/admin/schemes/${item.id}/edit`}><T k="admin.edit" /></Link><Link to={`/admin/schemes/${item.id}/history`}><T k="admin.history" /></Link><Link to={`/admin/schemes/${item.id}/sources`}><T k="admin.sources" /></Link>{item.pendingChange && <><Button size="sm" onClick={() => reviewSchemeChange(item.pendingChange.id, 'approved')}><T k="admin.approve" /></Button><Button size="sm" variant="danger" onClick={() => reviewSchemeChange(item.pendingChange.id, 'rejected')}><T k="admin.reject" /></Button></>}</td></tr>)}</tbody></table></div>
      {!data.schemes.filter(matchesSearch).length && <p className="admin__empty"><T k="admin.noMatches" /></p>}
    </>}

    {route === 'editor' && <>
      {pageHead(scheme ? 'admin.editor.editTitle' : 'admin.editor.newTitle', 'admin.editor.desc', FilePlus2)}
      <form className="admin__form card" onSubmit={saveScheme}>
        <label><span><T k="admin.id" /></span><input name="id" required pattern="[a-z0-9-]+" defaultValue={scheme?.id || ''} readOnly={Boolean(scheme)} placeholder="scheme-id" /></label>
        <label><span><T k="admin.nameEn" /></span><input name="nameEn" required defaultValue={scheme?.nameEn || ''} /></label>
        <label><span><T k="admin.nameKn" /></span><input name="nameKn" required defaultValue={scheme?.nameKn || ''} /></label>
        <label><span><T k="admin.category" /></span><select name="category" defaultValue={scheme?.category || 'education'}>{['education', 'agriculture', 'healthcare', 'women-children', 'housing', 'pension', 'employment', 'food'].map((id) => <option key={id} value={id}>{t(`cat.${id}`)}</option>)}</select></label>
        <label><span><T k="admin.level" /></span><select name="level" defaultValue={scheme?.level || 'central'}><option value="central">{t('level.central')}</option><option value="karnataka">{t('level.karnataka')}</option></select></label>
        <label><span><T k="admin.status" /></span><select name="status" defaultValue={scheme?.status || 'pending'}>{['pending', 'info-verified', 'verified'].map((id) => <option key={id} value={id}>{t(statusKeys[id])}</option>)}</select></label>
        <label><span><T k="admin.readiness" /></span><select name="readiness" defaultValue={scheme?.readiness || 'soon'}>{['soon', 'partial', 'ready'].map((id) => <option key={id} value={id}>{t(`readiness.${id}`)}</option>)}</select></label>
        <label><span><T k="admin.benefitType" /></span><input name="benefitType" defaultValue={scheme?.benefitType || ''} /></label>
        <label className="admin__wide"><span><T k="admin.sourceUrl" /></span><input name="source" type="url" required defaultValue={scheme?.source || ''} placeholder="https://" /></label>
        {scheme && <p className="admin__wide admin__version-note"><History size={17} /><T k="admin.versionOnSave" vars={{ version: (scheme.version || 1) + 1 }} /></p>}
        <div className="admin__form-actions admin__wide"><Button to="/admin/schemes" variant="secondary"><T k="common.cancel" /></Button><Button type="submit"><T k="admin.saveDemo" /></Button></div>
      </form>
    </>}

    {route === 'history' && <>
      <Button to="/admin/schemes" variant="ghost" iconLeft={ArrowLeft}><T k="admin.backSchemes" /></Button>{pageHead('admin.historyTitle', 'admin.historyDesc', History)}
      <h2>{scheme ? displayName(scheme) : schemeId}</h2><ol className="admin__history">{(scheme?.history || []).slice().reverse().map((entry) => <li key={`${entry.version}-${entry.at}`}><span>v{entry.version}</span><div><strong>{entry.summary}</strong><small>{entry.actor} · {dateLabel(entry.at, language)}</small></div></li>)}</ol>
    </>}

    {route === 'ruleHistory' && <>
      <Button to="/admin/rulebook" variant="ghost" iconLeft={ArrowLeft}><T k="admin.backRulebook" /></Button>{pageHead('admin.ruleHistoryTitle', 'admin.ruleHistoryDesc', History)}
      <h2>{data.rules.find((rule) => rule.id === ruleId)?.title || ruleId}</h2><ol className="admin__history">{(data.rules.find((rule) => rule.id === ruleId)?.history || []).slice().reverse().map((entry, index) => <li key={`${entry.at}-${index}`}><span><T k={`admin.status.${entry.status}`} /></span><div><strong><T k="admin.ruleHistoryEvent" /></strong><small>{entry.actor} · {dateLabel(entry.at, language)}</small></div></li>)}</ol>
    </>}

    {route === 'sources' && <>
      {pageHead('admin.sourcesTitle', 'admin.sourcesDesc', Globe2)}
      {schemeId && <p className="admin__selected"><strong>{schemeLabel(schemeId)}</strong></p>}
      {toolbar()}
      <div className="admin__source-list">{data.schemes.filter((s) => (!schemeId || s.id === schemeId) && matchesSearch(s)).map((item) => <article className="admin__source" key={item.id}><div><strong>{displayName(item)}</strong><a href={item.source} target="_blank" rel="noopener noreferrer">{item.source}</a><small><T k="admin.sourceNotVerified" /></small></div><span className="admin__badge admin__badge--pending"><T k="admin.sourceReference" /></span></article>)}{(data.extraSources || []).filter((source) => !schemeId || source.schemeId === schemeId).filter(matchesSearch).map((source) => <article className="admin__source" key={source.id}><div><strong>{schemeLabel(source.schemeId)}</strong><a href={source.url} target="_blank" rel="noopener noreferrer">{source.url}</a><small>{source.note || t('admin.sourceNotVerified')}</small></div><span className={`admin__badge admin__badge--${source.verificationStatus || 'pending'}`}><T k={source.verificationStatus === 'verified' ? 'admin.status.verified' : source.verificationStatus === 'rejected' ? 'admin.status.rejected' : 'admin.status.pending'} /></span>{!isDemoAuth && source.verificationStatus === 'pending' && <><Button size="sm" onClick={() => reviewSource(source.id, 'approved')}><T k="admin.approve" /></Button><Button size="sm" variant="danger" onClick={() => reviewSource(source.id, 'rejected')}><T k="admin.reject" /></Button></>}{<Button variant="ghost" size="sm" onClick={() => isDemoAuth ? commit({ ...data, extraSources: data.extraSources.filter((entry) => entry.id !== source.id) }) : backendApi.removeSource(source.id).then(refreshApiData).catch(setApiError)}><T k="admin.removeSource" /></Button>}</article>)}</div>
      <form className="admin__form card" onSubmit={saveSource}><h2 className="admin__wide"><T k="admin.addSource" /></h2><label><span><T k="admin.scheme" /></span><select name="schemeId" required value={sourceForm.schemeId} onChange={(event) => setSourceForm({ ...sourceForm, schemeId: event.target.value })}><option value="">{t('admin.chooseScheme')}</option>{data.schemes.map((item) => <option key={item.id} value={item.id}>{displayName(item)}</option>)}</select></label><label><span><T k="admin.sourceUrl" /></span><input name="url" required type="url" value={sourceForm.url} onChange={(event) => setSourceForm({ ...sourceForm, url: event.target.value })} /></label><label className="admin__wide"><span><T k="admin.sourceNote" /></span><input name="note" value={sourceForm.note} onChange={(event) => setSourceForm({ ...sourceForm, note: event.target.value })} /></label><div className="admin__wide"><Button type="submit" iconLeft={Plus}><T k="admin.addSource" /></Button></div></form>
    </>}

    {route === 'rulebook' && <>
      {pageHead('admin.rulebook.title', 'admin.rulebook.desc', BookOpenCheck)}
      <section className="admin__callout"><ShieldAlert /><p><T k="admin.aiRuleWarning" /></p></section>
      <form className="admin__form card" onSubmit={saveRule}>
        <h2 className="admin__wide"><T k="admin.addRuleDraft" /></h2>
        <label><span><T k="admin.scheme" /></span><select name="schemeId" required defaultValue=""><option value="">{t('admin.chooseScheme')}</option>{data.schemes.map((item) => <option key={item.id} value={item.id}>{displayName(item)}</option>)}</select></label>
        <label><span><T k="admin.ruleCode" /></span><input name="code" required pattern="[A-Za-z0-9_.-]+" /></label>
        <label><span><T k="admin.questionEn" /></span><input name="questionEn" required /></label>
        <label><span><T k="admin.questionKn" /></span><input name="questionKn" /></label>
        <label><span><T k="admin.expectedAnswer" /></span><select name="expectedAnswer"><option value="yes">{t('journey.answer.yes')}</option><option value="no">{t('journey.answer.no')}</option></select></label>
        <label><span><T k="admin.ruleOrigin" /></span><select name="origin"><option value="ai">{t('admin.aiDraft')}</option><option value="human">{t('admin.humanRule')}</option></select></label>
        <label className="admin__wide"><span><T k="admin.sourceUrl" /></span><input name="sourceUrl" type="url" required placeholder="https://" /></label>
        <label className="admin__wide"><span><T k="admin.sourceEvidence" /></span><textarea name="sourceEvidence" required minLength="12" rows="3" /></label>
        <div className="admin__wide"><Button type="submit" iconLeft={Plus}><T k="admin.addRuleDraft" /></Button></div>
      </form>
      {toolbar(['draft', 'approved', 'rejected'])}
      <div className="admin__review-list">{data.rules.filter(matchesSearch).filter((r) => filter === 'all' || r.status === filter).map((rule) => <article className="admin__review-card" key={rule.id}><div className="admin__review-top"><span className={`admin__badge admin__badge--${rule.status}`}><T k={statusKeys[rule.status]} /></span><span className={`admin__badge ${rule.origin === 'ai' ? 'admin__badge--ai' : 'admin__badge--human'}`}><T k={rule.origin === 'ai' ? 'admin.aiDraft' : 'admin.humanRule'} /></span><small>{dateLabel(rule.updatedAt, language)}</small></div><h2>{rule.title}</h2><p className="admin__review-scheme">{schemeLabel(rule.schemeId)}</p><p>{rule.description}</p><p className="admin__version-note"><T k="admin.ruleVersion" /> · <a href={rule.source} target="_blank" rel="noopener noreferrer">{rule.source}</a></p>{rule.reviewedBy && <p><T k="admin.reviewedBy" vars={{ name: rule.reviewedBy }} /> · {dateLabel(rule.reviewedAt, language)}</p>}<div className="admin__actions"><Link to={`/admin/rulebook/${rule.id}/history`}><T k="admin.ruleHistory" /></Link>{rule.status === 'draft' && <><Button iconLeft={BadgeCheck} onClick={() => reviewRule(rule.id, 'approved')}><T k="admin.approve" /></Button><Button variant="danger" iconLeft={XCircle} onClick={() => reviewRule(rule.id, 'rejected')}><T k="admin.reject" /></Button></>}</div></article>)}</div>
    </>}

    {route === 'policies' && <>
      {pageHead('admin.policies.title', 'admin.policies.desc', GitCompareArrows)}
      <form className="admin__form card" onSubmit={savePolicy}>
        <h2 className="admin__wide"><T k="admin.proposePolicy" /></h2>
        <label><span><T k="admin.scheme" /></span><select name="schemeId" required defaultValue=""><option value="">{t('admin.chooseScheme')}</option>{data.schemes.map((item) => <option key={item.id} value={item.id}>{displayName(item)}</option>)}</select></label>
        <label><span><T k="admin.policyTitle" /></span><input name="title" required minLength="2" /></label>
        <label><span><T k="admin.before" /></span><textarea name="before" required rows="3" /></label>
        <label><span><T k="admin.after" /></span><textarea name="after" required rows="3" /></label>
        <label className="admin__wide"><span><T k="admin.sourceUrl" /></span><input name="sourceUrl" required type="url" placeholder="https://" /></label>
        <label className="admin__wide"><span><T k="admin.sourceEvidence" /></span><textarea name="sourceEvidence" required minLength="12" rows="3" /></label>
        <div className="admin__wide"><Button type="submit" iconLeft={Plus}><T k="admin.proposePolicy" /></Button></div>
      </form>
      {toolbar(['pending', 'approved', 'rejected'])}
      <div className="admin__review-list">{data.policies.filter(matchesSearch).filter((policy) => filter === 'all' || policy.status === filter).map((policy) => <article className="admin__review-card" key={policy.id}><div className="admin__review-top"><span className={`admin__badge admin__badge--${policy.status}`}><T k={`admin.status.${policy.status}`} /></span><small>{dateLabel(policy.updatedAt, language)}</small></div><h2>{policy.title}</h2><p className="admin__review-scheme">{schemeLabel(policy.schemeId)}</p><div className="admin__comparison"><section><h3><T k="admin.before" /></h3><p>{policy.before}</p></section><ArrowRight aria-hidden="true" /><section><h3><T k="admin.after" /></h3><p>{policy.after}</p></section></div><a href={policy.source} target="_blank" rel="noopener noreferrer">{policy.source}</a>{policy.reviewedBy && <p><T k="admin.reviewedBy" vars={{ name: policy.reviewedBy }} /> · {dateLabel(policy.reviewedAt, language)}</p>}{policy.status === 'pending' && <div className="admin__actions"><Button iconLeft={BadgeCheck} onClick={() => reviewPolicy(policy.id, 'approved')}><T k="admin.approve" /></Button><Button variant="danger" iconLeft={XCircle} onClick={() => reviewPolicy(policy.id, 'rejected')}><T k="admin.reject" /></Button></div>}</article>)}</div>
    </>}
  </div>;
}
