import { ArrowRight, ClipboardCheck, Languages, MessagesSquare, ShieldCheck, Sparkles } from 'lucide-react';
import Reveal from '../common/Reveal';
import Button from '../common/Button';
import T from '../common/T';

// Homepage entry point for AI Citizen Onboarding (route: /onboarding).
export default function AiOnboardingCta() {
  const pts = [{ k: 'ob.home.p1', icon: ClipboardCheck }, { k: 'ob.home.p2', icon: ShieldCheck }, { k: 'ob.home.p3', icon: Languages }];
  return (
    <section className="section aiob-wrap" aria-labelledby="aiob-h">
      <div className="container">
        <Reveal className="aiob">
          <span className="aiob__art" aria-hidden="true"><MessagesSquare size={60} /></span>
          <div className="aiob__text">
            <p className="aiob__eyebrow"><Sparkles size={16} aria-hidden="true" /><T k="ob.home.eyebrow" /></p>
            <h2 id="aiob-h"><T k="ob.home.title" /></h2>
            <p className="aiob__headline"><T k="ob.home.headline" /></p>
            <p><T k="ob.home.desc" /></p>
            <ul className="aiob__pts">{pts.map(({ k, icon: Icon }) => <li key={k}><Icon size={18} aria-hidden="true" /><T k={k} /></li>)}</ul>
            <Button to="/onboarding" size="lg" variant="accent" iconRight={ArrowRight} className="btn--arrow"><T k="ob.home.cta" /></Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
