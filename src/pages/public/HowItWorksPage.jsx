import { BookOpenText } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import HowItWorks from '../../components/home/HowItWorks';
import TrustGuard from '../../components/home/TrustGuard';
import FinalCta from '../../components/home/FinalCta';
import T from '../../components/common/T';

export default function HowItWorksPage() {
  return (
    <>
      <div className="container section" style={{ paddingBottom: 0 }}>
        <PageHeader icon={BookOpenText} title={<T k="page.how" />} description={<T k="brand.support" />} />
      </div>
      <HowItWorks headingLevel={2} />
      <TrustGuard />
      <FinalCta />
    </>
  );
}
