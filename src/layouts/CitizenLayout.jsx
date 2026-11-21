import { citizenNav } from '../data/navigation';
import Sidebar from '../components/layout/Sidebar';
import BottomNav from '../components/layout/BottomNav';
import AppTopbar from '../components/layout/AppTopbar';
import PageTransition from './PageTransition';
import SkipLink from './SkipLink';
import HelperBanner from '../components/citizen/HelperBanner';
import DisclaimerStrip from '../components/layout/DisclaimerStrip';

export default function CitizenLayout() {
  return (
    <div className="workspace">
      <SkipLink />
      <Sidebar items={citizenNav} variant="light" mobile="hidden" layoutId="citizen-active" />
      <div className="workspace__main">
        <HelperBanner />
        <AppTopbar showLogo />
        <main id="main" tabIndex={-1} className="workspace__content"><PageTransition /></main>
        <DisclaimerStrip />
      </div>
      <BottomNav items={citizenNav} />
    </div>
  );
}
