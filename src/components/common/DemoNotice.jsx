import { FlaskConical } from 'lucide-react';
import T from './T';

export default function DemoNotice({ k = 'notice.demoData' }) {
  return <p className="demonotice" role="note"><FlaskConical size={17} aria-hidden="true" /><T k={k} /></p>;
}
