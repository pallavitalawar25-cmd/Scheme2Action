import { BadgeCheck, ClipboardCheck, Landmark, MessageSquareText } from 'lucide-react';
import Reveal from '../common/Reveal';
import T from '../common/T';

const items = [{ n: 1, icon: Landmark, c: '#235579' }, { n: 2, icon: MessageSquareText, c: '#d9730d' }, { n: 3, icon: BadgeCheck, c: '#087d52' }, { n: 4, icon: ClipboardCheck, c: '#c2468b' }];

export default function WhySection() {
  return (
    <section className="section why" aria-labelledby="why-h">
      <div className="container">
        <Reveal><h2 id="why-h"><T k="why.title" /></h2></Reveal>
        <ul className="why__grid">
          {items.map(({ n, icon: Icon, c }, i) => (
            <Reveal as="li" key={n} delay={i * 0.07} className="why__card" >
              <span className="why__icon" style={{ '--c': c }}><Icon size={26} aria-hidden="true" /></span>
              <h3><T k={`why.${n}.title`} /></h3>
              <p><T k={`why.${n}.desc`} /></p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
