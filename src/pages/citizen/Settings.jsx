import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, RotateCcw, Settings as SettingsIcon, Trash2 } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import T from '../../components/common/T';
import ToggleSwitch from '../../components/forms/ToggleSwitch';
import SegmentedChoice from '../../components/forms/SegmentedChoice';
import useCitizenData from '../../hooks/useCitizenData';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { usePreferences } from '../../context/PreferencesContext';
import { useToast } from '../../context/ToastContext';

function Section({ id, title, children, note }) {
  return (
    <section className="card setsec" aria-labelledby={id}>
      <h2 id={id}><T k={title} /></h2>
      {children}
      {note && <p className="muted setsec__note"><T k={note} /></p>}
    </section>
  );
}

export default function Settings() {
  const { user, logout, deleteAccount, isDemoAuth } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { textSize, setTextSize, reduceMotion, setReduceMotion } = usePreferences();
  const { data, updateSettings, reset } = useCitizenData();
  const toast = useToast();
  const navigate = useNavigate();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const saved = () => toast.success(t('toast.settingsSaved'), 1600);
  const n = data.settings.notifications;
  const p = data.settings.privacy;

  return (
    <div>
      <PageHeader icon={SettingsIcon} title={<T k="page.settings" />} description={<T k="settings.desc" />} />
      <div className="setgrid">
        <Section id="set-lang" title="settings.language" note="settings.language.note">
          <SegmentedChoice label={t('settings.language')} value={language} onChange={(v) => { setLanguage(v); saved(); }} options={[{ value: 'en', label: 'English', lang: 'en' }, { value: 'kn', label: 'ಕನ್ನಡ', lang: 'kn' }]} />
        </Section>

        <Section id="set-access" title="settings.access">
          <p className="setsec__label"><T k="settings.textSize" /></p>
          <SegmentedChoice label={t('settings.textSize')} value={textSize} onChange={(v) => { setTextSize(v); saved(); }}
            options={[{ value: 'normal', label: t('size.normal') }, { value: 'large', label: t('size.large') }, { value: 'xl', label: t('size.xl') }]} />
          <ToggleSwitch checked={reduceMotion} onChange={(v) => { setReduceMotion(v); saved(); }} label={t('settings.reduceMotion')} description={t('settings.reduceMotion.desc')} />
        </Section>

        <Section id="set-notif" title="settings.notifications" note="settings.notifications.note">
          <ToggleSwitch checked={n.email} onChange={(v) => { updateSettings('notifications', { email: v }); saved(); }} label={t('notif.email')} />
          <ToggleSwitch checked={n.sms} onChange={(v) => { updateSettings('notifications', { sms: v }); saved(); }} label={t('notif.sms')} />
          <ToggleSwitch checked={n.policy} onChange={(v) => { updateSettings('notifications', { policy: v }); saved(); }} label={t('notif.policy')} />
        </Section>

        <Section id="set-privacy" title="settings.privacy">
          <ToggleSwitch checked={p.ai} onChange={(v) => { updateSettings('privacy', { ai: v }); saved(); }} label={t('privacy.ai')} description={t('privacy.ai.desc')} />
          <ToggleSwitch checked={p.helper} onChange={(v) => { updateSettings('privacy', { helper: v }); saved(); }} label={t('privacy.helper')} />
        </Section>

        <Section id="set-account" title="settings.account">
          <dl className="acctinfo">
            <div><dt><T k="account.username" /></dt><dd>{user?.username}</dd></div>
            <div><dt><T k="account.email" /></dt><dd>{user?.email}</dd></div>
          </dl>
          {isDemoAuth && <p className="muted"><T k="account.mode.demo" /></p>}
          <div className="cluster">
            <Button variant="secondary" iconLeft={RotateCcw} onClick={() => { reset(); toast.success(t('toast.dataReset')); }}><T k="account.resetDemo" /></Button>
            <Button variant="secondary" iconLeft={LogOut} onClick={async () => { await logout(); toast.info(t('toast.signedOut')); navigate('/'); }}><T k="nav.logout" /></Button>
            {isDemoAuth && <Button variant="ghost" iconLeft={Trash2} onClick={() => setConfirmDelete(true)}><T k="account.delete" /></Button>}
          </div>
        </Section>
      </div>
      <Modal open={confirmDelete} onClose={() => setConfirmDelete(false)} title={t('account.delete')}
        footer={<><Button variant="ghost" onClick={() => setConfirmDelete(false)}><T k="common.cancel" /></Button><Button variant="danger" onClick={async () => { await deleteAccount(); setConfirmDelete(false); toast.info(t('toast.accountDeleted')); navigate('/'); }}><T k="account.delete.confirm" /></Button></>}>
        <p><T k="account.delete.body" /></p>
      </Modal>
    </div>
  );
}
