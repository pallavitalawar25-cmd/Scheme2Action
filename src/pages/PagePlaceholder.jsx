import { Hammer } from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import Button from '../components/common/Button';
import T from '../components/common/T';
import StatusBadge from '../components/common/StatusBadge';

// Every route exists from day one. Replace the element in routes.jsx as each batch lands.
export default function PagePlaceholder({ id, batch, icon: Icon = Hammer, area = 'public' }) {
  return (
    <div className={`container section placeholder placeholder--${area}`}>
      <PageHeader icon={Icon} title={<T k={`page.${id}`} />} description={<T k="common.comingSoon" />} actions={<StatusBadge status="pending" />} />
      <p className="placeholder__batch"><T k="common.scheduled" vars={{ batch }} /></p>
      <Button to="/" variant="secondary"><T k="common.backHome" /></Button>
    </div>
  );
}
