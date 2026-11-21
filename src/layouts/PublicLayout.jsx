import DisclaimerStrip from '../components/layout/DisclaimerStrip';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import PageTransition from './PageTransition';
import SkipLink from './SkipLink';

export default function PublicLayout() {
  return (
    <div className="app-shell">
      <SkipLink />
      <DisclaimerStrip />
      <Navbar />
      <main id="main" tabIndex={-1}><PageTransition /></main>
      <Footer />
    </div>
  );
}
