import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, Download, FileText, ShieldAlert, UploadCloud } from 'lucide-react';
import Button from '../../components/common/Button';
import DemoNotice from '../../components/common/DemoNotice';
import T from '../../components/common/T';
import PageHeader from '../../components/common/PageHeader';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import useSchemes from '../../hooks/useSchemes';
import { schemeKey } from '../../data/schemes';
import { assessEligibility } from '../../services/eligibilityRules';
import { isBackendConnected } from '../../services/api';
import { backendApi } from '../../services/backendApi';

const steps = ['eligibility', 'results', 'documents', 'upload', 'review', 'corrections', 'final', 'packet', 'tracker'];
const questionIds = ['student', 'karnataka', 'postMatric', 'incomeKnown'];
const defaults = { answers: {}, files: {}, corrections: {}, confirmed: {}, checked: false, outcome: 'needs-verification', completed: {}, completedAt: {} };
const key = (uid, sid) => `s2a.application.${uid}.${sid}`;
function load(uid, sid) { try { return { ...defaults, ...JSON.parse(localStorage.getItem(key(uid, sid)) || '{}') }; } catch { return { ...defaults }; } }
function save(uid, sid, data) { try { localStorage.setItem(key(uid, sid), JSON.stringify(data)); } catch { /* browser storage is optional */ } }
function makePdf(lines) {
  const clean = (s) => String(s).normalize('NFKD').replace(/[^\x20-\x7E]/g, '?').replace(/[()\\]/g, '\\$&');
  const wrapped = lines.flatMap((line) => { const words = clean(line).split(' '); const rows = []; let row = ''; words.forEach((word) => { if (`${row} ${word}`.length > 88) { rows.push(row); row = word; } else row = row ? `${row} ${word}` : word; }); if (row) rows.push(row); return rows; });
  const chunks = Array.from({ length: Math.max(1, Math.ceil(wrapped.length / 32)) }, (_, i) => wrapped.slice(i * 32, (i + 1) * 32));
  const objects = ['<< /Type /Catalog /Pages 2 0 R >>', '', '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>', '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>']; const pageRefs = [];
  chunks.forEach((rows) => {
    const pageId = objects.length + 1; const contentId = pageId + 1; pageRefs.push(`${pageId} 0 R`);
    const stream = ['0.95 0.61 0.16 RG', '48 812 m 547 812 l S', 'BT', '/F2 15 Tf', '0.06 0.18 0.28 rg', '48 790 Td', ...rows.flatMap((line, i) => i ? ['0 -22 Td', '/F1 10 Tf', '0 0 0 rg', `(${line}) Tj`] : [`(${line}) Tj`, '0 -30 Td', '/F1 10 Tf', '0 0 0 rg']), 'ET'].join('\n');
    objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentId} 0 R >>`);
    objects.push(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
  });
  objects[1] = `<< /Type /Pages /Kids [${pageRefs.join(' ')}] /Count ${chunks.length} >>`;
  let pdf = '%PDF-1.4\n'; const offsets = [0];
  objects.forEach((o, i) => { offsets.push(pdf.length); pdf += `${i + 1} 0 obj\n${o}\nendobj\n`; });
  const xref = pdf.length; pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.slice(1).map((n) => `${String(n).padStart(10, '0')} 00000 n \n`).join('')}trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return new Blob([pdf], { type: 'application/pdf' });
}

export default function ApplicationJourney() {
  const { schemeId } = useParams(); const navigate = useNavigate(); const { pathname } = useLocation(); const { user, isDemoAuth } = useAuth(); const { t, language } = useLanguage(); const { data: schemes } = useSchemes();
  const [previews, setPreviews] = useState({}); const [uploadProgress, setUploadProgress] = useState({});
  const [validationError, setValidationError] = useState(false);
  const apiMode = isBackendConnected() && !isDemoAuth;
  const [remote, setRemote] = useState(null); const [remoteError, setRemoteError] = useState(''); const [assessmentResult, setAssessmentResult] = useState(null); const [saving, setSaving] = useState(false); const [aiConsent, setAiConsent] = useState(false); const [aiResult, setAiResult] = useState(null); const [extracting, setExtracting] = useState(false);
  const scheme = schemes.find((s) => s.id === schemeId); const [revision, setRevision] = useState(0); const localData = useMemo(() => load(user?.id || 'guest', schemeId), [user, schemeId, revision]);
  const data = apiMode ? (remote?.data || defaults) : localData;
  useEffect(() => {
    if (!apiMode || !user || !scheme) return;
    let active = true;
    (async () => {
      try {
        const list = await backendApi.applications();
        let app = (list.items || []).find((item) => item.scheme_id === schemeId);
        if (!app) app = (await backendApi.createApplication(schemeId)).application;
        const detail = await backendApi.application(app.id);
        if (!active) return;
        const remoteApp = detail.application;
        setAssessmentResult(remoteApp.eligibility_result || null);
        const files = Object.fromEntries((detail.documents || []).map((doc) => [doc.document_type, { id: doc.id, name: doc.name, type: doc.content_type, size: doc.size_bytes, uploadedAt: doc.created_at, extraction: doc.extraction }]));
        const corrections = Object.fromEntries((detail.corrections || []).map((item) => [item.field_name, item.corrected_value]));
        const completed = { ...(remoteApp.stage !== 'eligibility' ? { eligibility: true } : {}), ...(remoteApp.outcome ? { assessment: true } : {}), ...(Object.keys(files).length ? { upload: true } : {}), ...(remoteApp.packet_ready ? { final: true, packet: true } : {}) };
        setRemote({ id: remoteApp.id, data: { ...defaults, answers: remoteApp.answers || {}, outcome: remoteApp.outcome === 'PASS' ? 'likely' : remoteApp.outcome === 'FAIL' ? 'not' : 'unknown', files, corrections, confirmed: remoteApp.confirmed || {}, checked: remoteApp.packet_ready, completed } });
      } catch (error) { if (active) setRemoteError(error.message); }
    })();
    return () => { active = false; };
  }, [apiMode, user?.id, schemeId, Boolean(scheme)]);
  const path = pathname.split('/').pop(); const page = path === 'result' ? 'results' : path; const base = `/apply/${schemeId}`;
  const update = (patch) => { const next = { ...data, ...patch }; if (!apiMode) { save(user?.id || 'guest', schemeId, next); setRevision((n) => n + 1); return; } setRemote((current) => current ? { ...current, data: next } : current); if (remote?.id && (patch.answers || patch.completed || patch.confirmed)) { const stage = steps.includes(page) ? page : 'eligibility'; backendApi.patchApplication(remote.id, { ...(patch.answers ? { answers: patch.answers } : {}), ...(patch.confirmed ? { confirmed: patch.confirmed } : {}), ...(patch.completed ? { stage } : {}) }).catch((error) => setRemoteError(error.message)); } };
  const name = scheme ? t(schemeKey(scheme.id, 'name')) : schemeId;
  const titleKey = `journey.${page}.title`;
  const forward = (to) => navigate(`${base}/${to}`);
  const complete = (id) => update({ completed: { ...data.completed, [id]: true }, completedAt: { ...data.completedAt, [id]: new Date().toISOString() } });
  const documents = ['identity', 'income', 'marks', 'admission', 'bank', 'caste'];
  const requiredDocs = documents.filter((id) => id !== 'identity' && id !== 'caste');
  const isSSP = schemeId === 'ssp-post-matric-scholarship';
  const localAssessment = assessEligibility(schemeId, data.answers);
  const assessment = apiMode && assessmentResult ? { evaluated: assessmentResult.evaluated || [], passed: assessmentResult.passed || [], failed: assessmentResult.failed || [], missing: assessmentResult.missing || [], reason: assessmentResult.reason, next_action: assessmentResult.next_action } : localAssessment;
  const outcome = apiMode ? (remote?.data.outcome || 'unknown') : localAssessment.outcome;
  const eligible = data.answers;
  const docNames = documents.map((id) => t(`journey.doc.${id}`));
  const submitEligibility = async () => {
    if (questionIds.slice(0, 3).some((id) => !eligible[id])) { setValidationError(true); return; }
    if (apiMode && remote?.id) {
      setSaving(true); setRemoteError('');
      try { const result = await backendApi.assess(remote.id, eligible); setAssessmentResult(result); const mapped = result.outcome === 'PASS' ? 'likely' : result.outcome === 'FAIL' ? 'not' : 'unknown'; setRemote((current) => ({ ...current, data: { ...current.data, outcome: mapped, completed: { ...current.data.completed, eligibility: true, assessment: true } } })); forward('results'); }
      catch (error) { setRemoteError(error.message); } finally { setSaving(false); }
      return;
    }
    update({ outcome: localAssessment.outcome, completed: { ...data.completed, eligibility: true }, completedAt: { ...data.completedAt, eligibility: new Date().toISOString() } }); forward('results');
  };
  const fileInput = (id, file) => {
    if (!file) return;
    if (!['application/pdf', 'image/jpeg', 'image/png'].includes(file.type) || file.size > 5 * 1024 * 1024) { window.alert(t('journey.upload.invalid')); return; }
    
    if (apiMode && remote?.id) { setUploadProgress((p) => ({ ...p, [id]: 1 })); backendApi.upload(remote.id, id, file).then(({ document }) => { setRemote((current) => ({ ...current, data: { ...current.data, files: { ...current.data.files, [id]: { id: document.id, name: document.name, type: document.content_type, size: document.size_bytes, uploadedAt: document.created_at } } } })); setUploadProgress((p) => ({ ...p, [id]: 100 })); }).catch((error) => { setUploadProgress((p) => ({ ...p, [id]: -1 })); setRemoteError(error.message); }); return; }
    const reader = new FileReader(); reader.onprogress = (event) => { if (event.lengthComputable) setUploadProgress((p) => ({ ...p, [id]: Math.round((event.loaded / event.total) * 100) })); }; reader.onload = () => { const metadata = { name: file.name, type: file.type, size: file.size, uploadedAt: new Date().toISOString() }; update({ files: { ...data.files, [id]: metadata } }); setPreviews((p) => ({ ...p, [id]: String(reader.result) })); setUploadProgress((p) => ({ ...p, [id]: 100 })); }; reader.onerror = () => setUploadProgress((p) => ({ ...p, [id]: -1 })); reader.readAsDataURL(file);
  };
  const requestExtraction = async () => { const document = Object.values(data.files).find((file) => file.id); if (!apiMode || !remote?.id || !document || !aiConsent) return; setExtracting(true); setRemoteError(''); try { const result = await backendApi.extract(remote.id, document.id, language, true); setAiResult(result.extraction); } catch (error) { setRemoteError(error.message); } finally { setExtracting(false); } };
  const removeFile = async (id) => { const current = data.files[id]; if (apiMode && remote?.id && current?.id) { try { await backendApi.deleteDocument(remote.id, current.id); } catch (error) { setRemoteError(error.message); return; } } const files = { ...data.files }; delete files[id]; update({ files }); setPreviews((p) => { const next = { ...p }; delete next[id]; return next; }); };
  const saveCorrections = async () => { if (apiMode && remote?.id) { setSaving(true); try { for (const [field, value] of Object.entries(data.corrections)) { if (!value.trim()) continue; await backendApi.correction(remote.id, { field_name: field.toLowerCase().replace(/[^a-z0-9]+/g, '_'), corrected_value: value, note: '' }); } await backendApi.patchApplication(remote.id, { stage: 'final' }); } catch (error) { setRemoteError(error.message); setSaving(false); return; } setSaving(false); } complete('corrections'); forward('final'); };
  const download = async () => { if (apiMode && remote?.id) { try { await backendApi.finalReview(remote.id, { confirmed: Object.keys(data.confirmed || {}).length ? data.confirmed : { applicant: true }, applicant_consent: Boolean(data.checked) }); const blob = await backendApi.packet(remote.id, language); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `scheme2action-${schemeId}-preparation.pdf`; a.click(); URL.revokeObjectURL(url); } catch (error) { setRemoteError(error.message); } return; } const lines = [t('journey.pdf.title'), name, `${t('journey.pdf.applicant')}: ${user?.name || 'Demo Citizen'}`, `${t('journey.pdf.date')}: ${new Date().toLocaleDateString()}`, `${t('journey.pdf.outcome')}: ${t(`journey.outcome.${outcome}`)}`, t('journey.pdf.limitation'), t('journey.pdf.answers'), ...Object.entries(data.answers).map(([id, answer]) => `${t(`journey.q.${id}`)}: ${t(`journey.answer.${answer}`)}`), t('journey.pdf.docs'), ...docNames.map((d, i) => `${data.files[documents[i]] ? '[x]' : '[ ]'} ${d}`), `${t('journey.pdf.missing')}: ${docNames.filter((_, i) => requiredDocs.includes(documents[i]) && !data.files[documents[i]]).join(', ') || t('journey.none')}`, t('journey.pdf.corrections'), ...Object.entries(data.corrections).map(([field, value]) => `${field}: ${value || t('journey.none')}`), `${t('journey.pdf.portal')}: ${scheme?.source || t('journey.none')}`, t('journey.pdf.disclaimer')]; const url = URL.createObjectURL(makePdf(lines)); const a = document.createElement('a'); a.href = url; a.download = `scheme2action-${schemeId}-preparation.pdf`; a.click(); URL.revokeObjectURL(url); const now = new Date().toISOString(); update({ completed: { ...data.completed, packet: true }, completedAt: { ...data.completedAt, packet: now } }); };

  if (!scheme) return <div className="journey container section"><PageHeader title={name} description={<T k="journey.schemeMissing" />} /></div>;
  if (apiMode && !remote && !remoteError) return <div className="journey container section" role="status">{t('common.loading')}</div>;
  return <div className="journey container section">
    <PageHeader title={<T k={titleKey} />} description={<><strong>{name}</strong> — <T k="journey.subtitle" /></>} />
    {!apiMode && <DemoNotice k="journey.demoNotice" />}
    {remoteError && <p className="formalert" role="alert">{remoteError}</p>}
    <div className="journey__meta"><span><T k={`step.${page === 'results' ? 'results' : page}`} /></span><span>{steps.indexOf(page) + 1} / {steps.length}</span></div>
    <div className="journey__progress" role="progressbar" aria-valuenow={((steps.indexOf(page) + 1) / steps.length) * 100} aria-valuemin="0" aria-valuemax="100"><span style={{ width: `${((steps.indexOf(page) + 1) / steps.length) * 100}%` }} /></div>
    <section className="journey__card" key={page}>
      {page === 'eligibility' && <>
        <p className="journey__eyebrow"><ShieldAlert size={16} /><T k="journey.rulesLabel" /></p><h2><T k="journey.questionsTitle" /></h2><p><T k="journey.questionsDesc" /></p>
        {isSSP ? <>
          {validationError && <p className="formalert" role="alert"><T k="journey.required" /></p>}
          {questionIds.slice(0, 3).map((id) => <fieldset className="journey__question" key={id}><legend><T k={`journey.q.${id}`} /></legend><p><T k="journey.demoQuestion" /></p>{['yes', 'no', 'unknown'].map((v) => <label key={v}><input type="radio" name={id} value={v} checked={eligible[id] === v} onChange={() => { setValidationError(false); update({ answers: { ...eligible, [id]: v } }); }} /><T k={`journey.answer.${v}`} /></label>)}</fieldset>)}
          {eligible.student === 'yes' && <fieldset className="journey__question"><legend><T k="journey.q.incomeKnown" /></legend><p><T k="journey.demoQuestion" /></p>{['yes', 'unknown'].map((v) => <label key={v}><input type="radio" name="incomeKnown" value={v} checked={eligible.incomeKnown === v} onChange={() => update({ answers: { ...eligible, incomeKnown: v } })} /><T k={`journey.answer.${v}`} /></label>)}</fieldset>}
          <div className="journey__actions"><Button variant="secondary" onClick={() => forward('results')}><T k="journey.save" /></Button><Button disabled={saving || (apiMode && !remote?.id)} iconRight={ArrowRight} onClick={submitEligibility}><T k="common.next" /></Button></div>
        </> : <><p className="callout"><T k="journey.noRulesForScheme" /></p><Button iconRight={ArrowRight} onClick={() => { complete('eligibility'); forward('results'); }}><T k="journey.continueUnknown" /></Button></>}
      </>}
      {page === 'results' && <>
        <div className={`journey__outcome journey__outcome--${outcome}`}><CheckCircle2 /><div><p className="journey__eyebrow"><T k="journey.assessmentLabel" /></p><h2><T k={`journey.outcome.${outcome}`} /></h2></div></div>
        <p>{t(`journey.outcomeDesc.${outcome}`)}</p>
        {outcome === 'unknown' && <aside className="journey__verification" role="status"><ShieldAlert /><div><h3><T k="journey.verificationWhy" /></h3><p>{assessment.reason || t(assessment.evaluated.length === 0 ? 'journey.verification.noRules' : assessment.missing.length ? 'journey.verification.missing' : 'journey.verification.incomplete')}</p></div></aside>}
        <div className="journey__result-grid">
          {[
            ['journey.passed', assessment.passed, 'journey.empty.passed'],
            ['journey.notSatisfied', assessment.failed, 'journey.empty.notSatisfied'],
            ['journey.informationMissing', assessment.missing, assessment.evaluated.length === 0 ? 'journey.empty.noRules' : 'journey.empty.missing'],
          ].map(([title, ids, emptyKey]) => <section className="journey__result-section" key={title}><h3><T k={title} /></h3>{ids.length ? <ul>{ids.map((item) => { const id = typeof item === 'string' ? item : item.code; const label = typeof item === 'string' ? t(`journey.q.${item}`) : (language === 'kn' ? item.question_kn : item.question_en) || item.code; return <li key={id}><CheckCircle2 size={17} />{label}</li>; })}</ul> : <p className="journey__empty"><T k={emptyKey} /></p>}</section>)}
        </div>
        <aside className="journey__next-action"><span className="journey__eyebrow"><T k="journey.nextAction" /></span><p>{assessment.next_action || t(outcome === 'likely' ? 'journey.action.verify' : outcome === 'not' ? 'journey.action.official' : 'journey.action.verifyMissing')}</p></aside>
        <p className="muted"><T k="journey.ruleDisclaimer" /></p><Button iconRight={ArrowRight} onClick={() => { complete('assessment'); forward('documents'); }}><T k="common.next" /></Button>
      </>}
      {page === 'documents' && <><h2><T k="journey.docTitle" /></h2><p><T k="journey.docDisclaimer" /></p><div className="journey__meta"><span><T k="journey.completion" /></span><strong>{Math.round((requiredDocs.filter((id) => data.files[id]).length / requiredDocs.length) * 100)}%</strong></div><div className="journey__progress" role="progressbar" aria-valuenow={Math.round((requiredDocs.filter((id) => data.files[id]).length / requiredDocs.length) * 100)} aria-valuemin="0" aria-valuemax="100"><span style={{ width: `${(requiredDocs.filter((id) => data.files[id]).length / requiredDocs.length) * 100}%` }} /></div><ul className="journey__docs">{documents.map((id, i) => <li key={id}><FileText /><div><strong>{docNames[i]}</strong><p><T k="journey.docDescription" /> · <T k="journey.docFormats" /></p><span className="journey__status"><T k={requiredDocs.includes(id) ? 'journey.mandatory' : 'journey.optional'} /> · <T k={data.files[id] ? 'journey.uploaded' : 'journey.missing'} /></span></div><Button size="sm" variant="secondary" onClick={() => forward('upload')}><T k="journey.manage" /></Button></li>)}</ul><Button iconRight={ArrowRight} onClick={() => { complete('documents'); forward('upload'); }}><T k="common.next" /></Button></>}
      {page === 'upload' && <><h2><T k="journey.uploadTitle" /></h2><p><T k="journey.uploadDisclaimer" /></p><ul className="journey__docs">{requiredDocs.map((id, i) => <li key={id} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); fileInput(id, e.dataTransfer.files?.[0]); }}><UploadCloud /><div><strong>{docNames[i]}</strong><p>{data.files[id]?.name || t('journey.dragBrowse')} · <T k="journey.fileLimit" /></p>{uploadProgress[id] === -1 && <p role="alert"><T k="journey.uploadError" /></p>}{uploadProgress[id] > 0 && uploadProgress[id] < 100 && <progress max="100" value={uploadProgress[id]} aria-label={t('journey.uploadProgress')} />}{previews[id] && (data.files[id]?.type === 'application/pdf' ? <iframe className="journey__preview" title={docNames[i]} src={previews[id]} /> : <img className="journey__preview" alt={docNames[i]} src={previews[id]} />)}<label className="btn btn--secondary btn--sm">{data.files[id] ? t('journey.replace') : t('journey.browse')}<input hidden type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => fileInput(id, e.target.files?.[0])} /></label></div><Button variant="ghost" size="sm" disabled={!data.files[id]} onClick={() => removeFile(id)}><T k="journey.remove" /></Button></li>)}</ul><Button iconRight={ArrowRight} onClick={() => { complete('upload'); forward('review'); }}><T k="common.next" /></Button></>}
      {page === 'review' && <><h2><T k="journey.reviewTitle" /></h2><p><T k="journey.reviewDisclaimer" /></p>{apiMode && Object.values(data.files).some((file) => file.id) && <div className="journey__ai-consent"><label><input type="checkbox" checked={aiConsent} onChange={(event) => setAiConsent(event.target.checked)} /><T k="journey.aiConsent" /></label><Button disabled={!aiConsent || extracting} onClick={requestExtraction}>{extracting ? t('common.loading') : t('journey.runExtraction')}</Button></div>}{aiResult?.fields?.length > 0 && <section aria-live="polite"><h3><T k="journey.aiDraftResults" /></h3><ul>{aiResult.fields.map((field, index) => <li key={`${field.name}-${index}`}><strong>{field.name}:</strong> {field.value} <small>{field.confidence ? `(${field.confidence})` : ''}</small></li>)}</ul><p className="muted">{aiResult.notes} {t('journey.reviewRecommendation')}</p></section>}<div className="journey__review"><h3><T k="journey.reviewExample" /></h3><div className="journey__compare-head"><strong><T k="journey.field" /></strong><strong><T k="journey.extracted" /></strong><strong><T k="journey.citizenProvided" /></strong><strong><T k="journey.confidence" /></strong><strong><T k="journey.reviewStatus" /></strong></div>{[['applicant', user?.name || 'Demo Citizen'], ['certificate', ''], ['issueDate', ''], ['authority', ''], ['income', '']].map(([id, citizenValue]) => <div className="journey__compare" key={id}><strong><T k={`journey.field.${id}`} /></strong><span><T k="journey.notExtracted" /></span><span>{citizenValue || <T k="journey.notProvided" />}</span><span>—</span><em><T k="journey.manual" /></em></div>)}<p className="muted"><T k="journey.reviewRecommendation" /></p></div><Button iconRight={ArrowRight} onClick={() => { complete('review'); forward('corrections'); }}><T k="common.next" /></Button></>}
      {page === 'corrections' && <><h2><T k="journey.correctionsTitle" /></h2><p><T k="journey.correctionsDesc" /></p>{['Applicant name', 'Certificate number', 'Issue date', 'Issuing authority', 'Income value'].map((field) => <label className="journey__field" key={field}><span>{field} · <T k="journey.original" />: <T k="journey.notAvailable" /></span><input value={data.corrections[field] || ''} onChange={(e) => update({ corrections: { ...data.corrections, [field]: e.target.value } })} placeholder={t('journey.correctedValue')} /></label>)}<Button onClick={saveCorrections} disabled={saving}><T k="journey.saveCorrections" /></Button></>}
      {page === 'final' && <><h2><T k="journey.finalTitle" /></h2><p><T k="journey.finalDisclaimer" /></p><div className="journey__review"><h3><T k="journey.finalCitizen" /></h3><p><strong>{t('journey.applicant')}</strong><span>{user?.name || 'Demo Citizen'}</span></p><p><strong>{t('journey.scheme')}</strong><span>{name}</span></p><h3><T k="journey.finalChecklist" /></h3>{docNames.map((d, i) => <p key={documents[i]}><strong>{d}</strong><span><T k={data.files[documents[i]] ? 'journey.uploaded' : 'journey.missing'} /></span></p>)}<h3><T k="journey.finalCorrections" /></h3>{Object.entries(data.corrections).length ? Object.entries(data.corrections).map(([field, value]) => <p key={field}><strong>{field}</strong><span>{value}</span></p>) : <p><T k="journey.none" /></p>}<h3><T k="journey.remaining" /></h3><p>{t(`journey.outcome.${outcome}`)} · {requiredDocs.filter((id) => !data.files[id]).length} {t('journey.missing')}</p></div><label className="journey__confirm"><input type="checkbox" checked={data.checked} onChange={(e) => update({ checked: e.target.checked })} /><T k="journey.confirm" /></label><Button disabled={!data.checked} iconRight={ArrowRight} onClick={() => { complete('final'); forward('packet'); }}><T k="journey.preparePacket" /></Button></>}
      {page === 'packet' && <><h2><T k="journey.packetTitle" /></h2><p><T k="journey.packetDesc" /></p><div className="journey__packet"><strong>{name}</strong><p><T k="journey.packetContents" /></p><small><T k="journey.finalDisclaimer" /></small></div><Button iconLeft={Download} onClick={download}><T k="journey.downloadPdf" /></Button> <Button variant="secondary" iconRight={ArrowRight} onClick={() => forward('tracker')}><T k="journey.trackerTitle" /></Button></>}
      {page === 'tracker' && <><h2><T k="journey.trackerTitle" /></h2><p><T k="journey.trackerDisclaimer" /></p><ol className="journey__timeline">{['discovered', 'eligibility', 'assessment', 'documents', 'review', 'corrections', 'final', 'packet', 'official'].map((id, i) => { const done = data.completed[id] || id === 'discovered'; return <li className={done ? 'is-done' : ''} key={id}><span>{i + 1}</span><div><strong><T k={`journey.track.${id}`} /></strong><small><T k={done ? (id === 'official' ? 'journey.citizenRecorded' : 'journey.done') : 'journey.pending'} />{data.completedAt[id] && ` · ${new Date(data.completedAt[id]).toLocaleDateString(language === 'kn' ? 'kn-IN' : 'en-IN')}`}</small></div></li>; })}</ol><label className="journey__confirm"><input type="checkbox" checked={Boolean(data.completed.official)} onChange={(e) => update({ completed: { ...data.completed, official: e.target.checked }, completedAt: { ...data.completedAt, official: e.target.checked ? new Date().toISOString() : null } })} /><T k="journey.officialRecorded" /></label><div className="journey__actions"><Button onClick={() => forward(steps.find((id) => id !== 'tracker' && !data.completed[id]) || 'eligibility')} iconLeft={ArrowLeft}><T k="journey.returnTask" /></Button><Button variant="secondary" iconLeft={Download} onClick={download}><T k="journey.downloadPdf" /></Button></div></>}
      {!steps.includes(page) && <p><T k="journey.schemeMissing" /></p>}
    </section>
  </div>;
}
