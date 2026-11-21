import { Languages } from 'lucide-react';
import Reveal from '../common/Reveal';
import Button from '../common/Button';
import T from '../common/T';
import en from '../../translations/en';
import kn from '../../translations/kn';
import { useLanguage } from '../../context/LanguageContext';

const samples = ['nav.explore', 'lang.sample', 'status.pass'];

export default function LanguageShowcase() {
  const { language, setLanguage } = useLanguage();
  return (
    <section className="section" aria-labelledby="lang-h">
      <div className="container langshow">
        <Reveal className="langshow__copy">
          <h2 id="lang-h"><T k="lang.title" /></h2>
          <p className="muted"><T k="lang.desc" /></p>
          <Button variant="secondary" iconLeft={Languages} onClick={() => setLanguage(language === 'kn' ? 'en' : 'kn')}><T k="lang.try" /></Button>
        </Reveal>
        <Reveal delay={0.1} className="langshow__cards">
          <div className="langshow__card" lang="en"><span className="langshow__tag">English</span>{samples.map((k) => <p key={k}>{en[k]}</p>)}</div>
          <div className="langshow__card langshow__card--kn" lang="kn"><span className="langshow__tag">ಕನ್ನಡ</span>{samples.map((k) => <p key={k}>{kn[k]}</p>)}</div>
        </Reveal>
      </div>
    </section>
  );
}
