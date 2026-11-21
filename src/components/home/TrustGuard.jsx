import { BadgeCheck, ListChecks, Lock, PencilLine, ScanSearch } from 'lucide-react';
import Reveal from '../common/Reveal';
import T from '../common/T';
import ChakraGeometry from '../decor/ChakraGeometry';

const points = [{ n: 1, icon: BadgeCheck }, { n: 2, icon: ListChecks }, { n: 3, icon: PencilLine }, { n: 4, icon: Lock }];

export default function TrustGuard() {
  return (
    <section className="trust on-dark" aria-labelledby="trust-h">
      <ChakraGeometry size={560} className="trust__chakra" />
      <div className="container trust__inner">
        <Reveal className="trust__intro">
          <p className="trust__eyebrow"><ScanSearch size={18} aria-hidden="true" />TrustGuard</p>
          <h2 id="trust-h"><T k="trust.title" /></h2>
          <p className="trust__sub"><T k="trust.sub" /></p>
        </Reveal>
        <ul className="trust__grid">
          {points.map(({ n, icon: Icon }, i) => (
            <Reveal as="li" key={n} delay={i * 0.08} className="trust__card">
              <span className="trust__icon"><Icon size={24} aria-hidden="true" /></span>
              <h3><T k={`trust.${n}.title`} /></h3>
              <p><T k={`trust.${n}.desc`} /></p>
            </Reveal>
          ))}
        </ul>
        <Reveal className="trust__principle"><ScanSearch size={20} aria-hidden="true" /><T k="trust.principle" /></Reveal>
      </div>
    </section>
  );
}
