import { FlaskConical, Info } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import WhySection from '../../components/home/WhySection';
import Reveal from '../../components/common/Reveal';
import T from '../../components/common/T';
import FlagMotif from '../../components/decor/FlagMotif';

export default function AboutPage() {
  return (
    <>
      <div className="container section" style={{ paddingBottom: 0 }}>
        <PageHeader icon={Info} title={<T k="about.title" />} description={<T k="about.desc" />} />
        <div className="aboutgrid">
          <Reveal className="card"><h2><T k="about.independent.title" /></h2><p><T k="about.independent.desc" /></p><p className="about__flag"><FlagMotif /><T k="disclaimer.independent" /></p></Reveal>
          <Reveal delay={0.08} className="card"><h2><FlaskConical size={22} aria-hidden="true" style={{ display: 'inline', verticalAlign: '-3px', marginRight: 8 }} /><T k="about.demo.title" /></h2><p><T k="about.demo.desc" /></p></Reveal>
        </div>
      </div>
      <WhySection />
    </>
  );
}
