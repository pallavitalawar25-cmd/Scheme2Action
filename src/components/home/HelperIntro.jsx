import { HeartHandshake, Languages, ShieldCheck, Type } from 'lucide-react';
import Reveal from '../common/Reveal';
import Button from '../common/Button';
import T from '../common/T';

export default function HelperIntro() {
  const pts = [{ k: 'helper.1', icon: ShieldCheck }, { k: 'helper.2', icon: Type }, { k: 'helper.3', icon: Languages }];
  return (
    <section className="section" aria-labelledby="helper-h">
      <div className="container">
        <Reveal className="helperintro">
          <span className="helperintro__art" aria-hidden="true"><HeartHandshake size={64} /></span>
          <div className="helperintro__text">
            <h2 id="helper-h"><T k="helper.title" /></h2>
            <p><T k="helper.desc" /></p>
            <ul className="helperintro__pts">{pts.map(({ k, icon: Icon }) => <li key={k}><Icon size={18} aria-hidden="true" /><T k={k} /></li>)}</ul>
            <Button to="/helper" variant="sky"><T k="helper.cta" /></Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
