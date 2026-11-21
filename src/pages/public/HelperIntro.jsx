import { ArrowRight, HandHeart, Info, Languages, ShieldCheck, Type } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';
import Reveal from '../../components/common/Reveal';
import T from '../../components/common/T';
import ChakraGeometry from '../../components/decor/ChakraGeometry';
import { useAuth } from '../../context/AuthContext';

const steps = [{ n: 1, icon: ShieldCheck }, { n: 2, icon: Type }, { n: 3, icon: Languages }];

export default function HelperIntro() {
  const { isAuthenticated } = useAuth();
  return (
    <>
      <section className="helperhero on-dark">
        <ChakraGeometry size={480} className="helperhero__chakra" />
        <div className="container helperhero__inner">
          <span className="helperhero__icon"><HandHeart size={40} aria-hidden="true" /></span>
          <h1><T k="page.helper" /></h1>
          <p className="helperhero__lead"><T k="helper.intro.lead" /></p>
          <div className="cluster">
            <Button to="/helper/workspace" variant="accent" size="lg" iconRight={ArrowRight} className="btn--arrow"><T k="helper.start" /></Button>
            <Link to="/login" className="helperhero__login">{!isAuthenticated && <T k="nav.login" />}</Link>
          </div>
          {!isAuthenticated && <p className="helperhero__note"><T k="helper.loginFirst" /></p>}
        </div>
      </section>
      <section className="section">
        <div className="container">
          <Reveal><h2><T k="helper.how.title" /></h2></Reveal>
          <ol className="helpersteps">
            {steps.map(({ n, icon: Icon }, i) => (
              <Reveal as="li" key={n} delay={i * 0.08} className="helpersteps__item">
                <span className="helpersteps__num">{n}</span><span className="helpersteps__icon"><Icon size={26} aria-hidden="true" /></span>
                <h3><T k={`helper.step${n}.title`} /></h3><p><T k={`helper.step${n}.desc`} /></p>
              </Reveal>
            ))}
          </ol>
          <Reveal className="card helperprinciples">
            <h2><T k="helper.principles.title" /></h2>
            <ul>{[1, 2, 3].map((n) => <li key={n}><ShieldCheck size={18} aria-hidden="true" /><T k={`helper.p${n}`} /></li>)}</ul>
            <p className="demonotice"><Info size={17} aria-hidden="true" /><T k="helper.noverify" /></p>
          </Reveal>
        </div>
      </section>
    </>
  );
}
