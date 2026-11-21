import { useState } from 'react';
import { Bookmark, Compass, Trash2 } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import T from '../../components/common/T';
import DemoNotice from '../../components/common/DemoNotice';
import SchemeResults, { SchemeError, SchemeSkeletonGrid } from '../../components/schemes/SchemeResults';
import useSchemes from '../../hooks/useSchemes';
import useSavedSchemes from '../../hooks/useSavedSchemes';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';

export default function SavedSchemes() {
  const { status, data, reload } = useSchemes();
  const { saved, clear } = useSavedSchemes();
  const { t } = useLanguage();
  const toast = useToast();
  const [confirm, setConfirm] = useState(false);
  const items = data.filter((s) => saved.includes(s.id));

  return (
    <div>
      <PageHeader icon={Bookmark} title={<T k="page.saved" />} description={<T k="saved.desc" />}
        actions={items.length > 0 && <Button variant="secondary" iconLeft={Trash2} onClick={() => setConfirm(true)}><T k="saved.clear" /></Button>} />
      <DemoNotice />
      {status === 'loading' && <SchemeSkeletonGrid count={3} />}
      {status === 'error' && <SchemeError onRetry={reload} />}
      {status === 'success' && (items.length === 0
        ? <EmptyState icon={Bookmark} title={<T k="dash.saved.empty.title" />} description={<T k="dash.saved.empty.desc" />} action={<Button to="/schemes" iconLeft={Compass}><T k="nav.explore" /></Button>} />
        : (<><p className="muted"><strong><T k="saved.count" vars={{ count: items.length }} /></strong></p><SchemeResults schemes={items} /></>))}
      <Modal open={confirm} onClose={() => setConfirm(false)} title={t('saved.confirm.title')}
        footer={<><Button variant="ghost" onClick={() => setConfirm(false)}><T k="common.cancel" /></Button><Button variant="danger" onClick={() => { clear(); setConfirm(false); toast.info(t('saved.cleared')); }}><T k="saved.clear" /></Button></>}>
        <p><T k="saved.confirm.body" /></p>
      </Modal>
    </div>
  );
}
