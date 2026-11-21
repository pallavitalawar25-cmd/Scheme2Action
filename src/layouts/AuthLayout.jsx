import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Logo from '../components/common/Logo';
import T from '../components/common/T';
import LanguageSwitch from '../components/navigation/LanguageSwitch';
import TricolourRibbon from '../components/decor/TricolourRibbon';
import ChakraGeometry from '../components/decor/ChakraGeometry';
import { GraduationCap, HeartPulse, Home, Wheat } from 'lucide-react';
import PageTransition from './PageTransition';
import SkipLink from './SkipLink';

// Split screen: form on one side, animated Indian-inspired art on the other (art collapses on mobile).
export default function AuthLayout() {
  return (
    <div className="authshell">
      <SkipLink />
      <section className="authshell__art on-dark" aria-hidden="true">
        <ChakraGeometry size={520} className="authshell__chakra" />
        <TricolourRibbon className="authshell__ribbon" height={260} />
        {[[GraduationCap, 'f1', '#2f7fd1'], [Wheat, 'f2', '#0e9a66'], [HeartPulse, 'f3', '#e5593f'], [Home, 'f4', '#f29b28']].map(([Icon, k, c], i) => (
          <span key={k} className={`authshell__float authshell__float--${k} ${i % 2 ? 'anim-float-alt' : 'anim-float'}`} style={{ '--c': c }}><Icon size={26} /></span>
        ))}
        <div className="authshell__copy">
          <Logo light />
          <p className="authshell__tag"><T k="brand.tagline" /></p>
          <p className="authshell__support"><T k="brand.support" /></p>
        </div>
      </section>
      <div className="authshell__panel">
        <div className="authshell__top">
          <Link to="/" className="back-link"><ArrowLeft size={18} aria-hidden="true" /><T k="common.backHome" /></Link>
          <LanguageSwitch />
        </div>
        <main id="main" tabIndex={-1} className="authshell__main"><PageTransition /></main>
        <p className="authshell__note"><T k="disclaimer.independent" /></p>
      </div>
    </div>
  );
}
