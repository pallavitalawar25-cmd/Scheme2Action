import { Info } from 'lucide-react';
import T from '../common/T';

export default function DisclaimerStrip() {
  return (
    <div className="disclaimer-strip on-dark">
      <div className="container disclaimer-strip__inner">
        <Info size={15} aria-hidden="true" />
        <T k="disclaimer.independent" />
      </div>
    </div>
  );
}
