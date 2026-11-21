import { useState } from 'react';
import { CheckCircle2, FileText, Inbox, Search as SearchIcon } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import StatusBadge from '../../components/common/StatusBadge';
import ProgressBar from '../../components/common/ProgressBar';
import ProgressRing from '../../components/common/ProgressRing';
import AnimatedNumber from '../../components/common/AnimatedNumber';
import { CardSkeleton } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import Dropdown from '../../components/common/Dropdown';
import Tooltip from '../../components/common/Tooltip';
import SearchBar from '../../components/common/SearchBar';
import Stepper from '../../components/forms/Stepper';
import Timeline from '../../components/tracker/Timeline';
import CategoryCard from '../../components/schemes/CategoryCard';
import { TextField, SelectField } from '../../components/forms/FormField';
import T from '../../components/common/T';
import { categories } from '../../data/categories';
import { applicationSteps } from '../../data/navigation';
import { useToast } from '../../context/ToastContext';

const swatches = [
  ['Navy', '--navy-900'], ['Emerald', '--emerald-600'], ['Saffron', '--saffron-500'], ['Ivory', '--ivory'],
  ['Sky', '--sky-100'], ['Coral', '--coral-600'], ['Grey', '--grey-600'],
];

export default function DesignSystem() {
  const toast = useToast();
  const [modal, setModal] = useState(false);
  const [sort, setSort] = useState('relevance');
  return (
    <div className="container section ds">
      <PageHeader title={<T k="ds.title" />} description={<T k="ds.desc" />} />

      <section aria-labelledby="ds-colour"><h2 id="ds-colour">Colour</h2>
        <ul className="ds__swatches">{swatches.map(([n, v]) => <li key={v}><span style={{ background: `var(${v})` }} /><b>{n}</b><code>{v}</code></li>)}</ul>
      </section>

      <section aria-labelledby="ds-type"><h2 id="ds-type">Typography</h2>
        <h1>Display heading, Fraunces</h1><h3>Subheading in the same family</h3>
        <p>Body copy in Plus Jakarta Sans stays readable at length. ಕನ್ನಡ ಪಠ್ಯವು Noto Sans Kannada ಬಳಸುತ್ತದೆ.</p>
      </section>

      <section aria-labelledby="ds-btn"><h2 id="ds-btn">Buttons and badges</h2>
        <div className="cluster">
          <Button>Primary</Button><Button variant="accent">Accent</Button><Button variant="secondary">Secondary</Button><Button variant="sky">Sky</Button><Button variant="ghost">Ghost</Button><Button loading>Loading</Button>
        </div>
        <div className="cluster ds__row">
          {['verified', 'info-verified', 'pending', 'mock', 'pass', 'fail', 'unknown', 'ai', 'corrected'].map((s) => <StatusBadge key={s} status={s} />)}
        </div>
      </section>

      <section aria-labelledby="ds-prog"><h2 id="ds-prog">Progress and numbers</h2>
        <div className="cluster ds__row"><ProgressRing value={72} label="Preparation" /><ProgressRing value={40} tone="saffron" /><div style={{ flex: 1, minWidth: 220 }}><ProgressBar value={64} label="Documents" /></div>
          <strong className="ds__big"><AnimatedNumber value={2400} suffix="+" /></strong></div>
      </section>

      <section aria-labelledby="ds-form"><h2 id="ds-form">Form fields, dropdown, tooltip, toast, modal</h2>
        <div className="ds__form">
          <TextField label="Full name" hint="As on your documents" icon={SearchIcon} placeholder="Type here" />
          <TextField label="Email" error="Enter a valid email address" defaultValue="name@" />
          <SelectField label="Education level" options={[{ value: 'ug', label: 'Undergraduate' }, { value: 'pg', label: 'Postgraduate' }]} />
          <Dropdown label="Sort" value={sort} onChange={setSort} options={[{ value: 'relevance', label: 'Relevance' }, { value: 'name', label: 'Name' }, { value: 'updated', label: 'Recently updated' }]} />
        </div>
        <div className="cluster ds__row">
          <Tooltip label="Tooltips appear on hover and focus"><Button variant="secondary">Hover or focus me</Button></Tooltip>
          <Button variant="sky" onClick={() => toast.success('Saved to your dashboard (demo)')}>Success toast</Button>
          <Button variant="secondary" onClick={() => toast.warning('Income proof is still missing')}>Warning toast</Button>
          <Button variant="secondary" onClick={() => setModal(true)}>Open modal</Button>
        </div>
        <Modal open={modal} onClose={() => setModal(false)} title="Confirm action" footer={<><Button variant="ghost" onClick={() => setModal(false)}>Cancel</Button><Button onClick={() => { setModal(false); toast.success('Confirmed'); }}>Confirm</Button></>}>
          <p>Modals trap scroll, close on Escape and return focus to the button that opened them.</p>
        </Modal>
        <div className="ds__row"><SearchBar size="md" /></div>
      </section>

      <section aria-labelledby="ds-cards"><h2 id="ds-cards">Category cards</h2>
        <ul className="grid-cats">{categories.map((c) => <li key={c.slug}><CategoryCard category={c} /></li>)}</ul>
      </section>

      <section aria-labelledby="ds-flow"><h2 id="ds-flow">Stepper and timeline</h2>
        <Stepper steps={applicationSteps} current={2} basePath="/apply/demo" />
        <div className="ds__row"><Timeline items={[
          { id: 1, title: 'Scheme discovered', state: 'done', track: 'platform' },
          { id: 2, title: 'Eligibility completed', state: 'current', track: 'platform', desc: 'Platform preparation progress' },
          { id: 3, title: 'Official portal visited', state: 'upcoming', track: 'government', desc: 'Citizen-reported, not verified by Scheme2Action' },
        ]} /></div>
      </section>

      <section aria-labelledby="ds-state"><h2 id="ds-state">Loading and empty states</h2>
        <div className="ds__grid"><CardSkeleton /><CardSkeleton /><EmptyState icon={Inbox} title="No saved schemes yet" description="Save a scheme to see it here." action={<Button variant="secondary" iconLeft={FileText}>Browse schemes</Button>} /></div>
        <p className="muted"><CheckCircle2 size={16} style={{ display: 'inline', verticalAlign: '-3px' }} /> Respects prefers-reduced-motion.</p>
      </section>
    </div>
  );
}
