import { SearchX } from 'lucide-react';
import EmptyState from '../components/common/EmptyState';
import Button from '../components/common/Button';
import T from '../components/common/T';

export default function NotFound() {
  return (
    <div className="container section">
      <EmptyState icon={SearchX} title={<T k="notfound.title" />} description={<T k="notfound.desc" />} action={<Button to="/"><T k="common.backHome" /></Button>} />
    </div>
  );
}
