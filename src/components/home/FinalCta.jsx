import { ArrowRight } from 'lucide-react';
import Reveal from '../common/Reveal';
import Button from '../common/Button';
import T from '../common/T';
import TricolourRibbon from '../decor/TricolourRibbon';

export default function FinalCta() {
  return (
    <section className="section finalcta-wrap" aria-labelledby="cta-h">
      <div className="container">
        <Reveal className="finalcta on-dark">
          <TricolourRibbon className="finalcta__ribbon" height={200} />
          <div className="finalcta__copy">
            <h2 id="cta-h"><T k="cta.title" /></h2>
            <p><T k="cta.desc" /></p>
            <div className="cluster">
              <Button to="/schemes" variant="accent" size="lg" iconRight={ArrowRight} className="btn--arrow"><T k="cta.primary" /></Button>
              <Button to="/register" variant="secondary" size="lg"><T k="cta.secondary" /></Button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
