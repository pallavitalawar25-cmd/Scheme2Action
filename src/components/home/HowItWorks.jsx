import { motion } from 'framer-motion';
import { ClipboardCheck, FileText, ListChecks, Rocket, Search } from 'lucide-react';
import Reveal from '../common/Reveal';
import T from '../common/T';
import { EASE } from '../../utils/motion';

const steps = [
  { n: 1, icon: Search }, { n: 2, icon: ListChecks }, { n: 3, icon: FileText }, { n: 4, icon: ClipboardCheck }, { n: 5, icon: Rocket },
];

export default function HowItWorks({ headingLevel = 2 }) {
  const H = `h${headingLevel}`;
  return (
    <section className="section how" aria-labelledby="how-h">
      <div className="container">
        <Reveal className="sectionhead sectionhead--center">
          <div><H id="how-h"><T k="how.title" /></H><p className="muted"><T k="how.sub" /></p></div>
        </Reveal>
        <ol className="how__list">
          <motion.span className="how__line" aria-hidden="true" initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true, margin: '-100px' }} transition={{ duration: 1.4, ease: EASE }} />
          {steps.map(({ n, icon: Icon }, i) => (
            <motion.li key={n} className="how__step" initial={{ opacity: 0, y: 26 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.55, delay: i * 0.12, ease: EASE }}>
              <span className="how__node"><Icon size={26} aria-hidden="true" /><span className="how__num" aria-hidden="true">{n}</span></span>
              <h3><T k={`how.${n}.title`} /></h3>
              <p><T k={`how.${n}.desc`} /></p>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
