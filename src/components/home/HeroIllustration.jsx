import StatusBadge from '../common/StatusBadge';
import ProgressBar from '../common/ProgressBar';
import T from '../common/T';

// Citizen discovering assistance: flat vector figure inside a heritage arch, with floating product cards.
export default function HeroIllustration() {
  return (
    <figure className="heroart" aria-label="Illustration of a citizen discovering government assistance">
      <svg viewBox="0 0 460 440" className="heroart__svg" aria-hidden="true">
        <defs>
          <linearGradient id="arch" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#DCEEFF" /><stop offset="1" stopColor="#FFF9EF" /></linearGradient>
        </defs>
        <path d="M70 420V190a160 160 0 0 1 320 0v230z" fill="url(#arch)" stroke="#102D46" strokeWidth="3" />
        <path d="M96 420V196a134 134 0 0 1 268 0v224z" fill="none" stroke="#F29B28" strokeWidth="2.5" strokeDasharray="2 9" strokeLinecap="round" />
        <circle cx="230" cy="168" r="58" fill="#F29B28" opacity="0.9" />
        <g opacity="0.5" stroke="#102D46" strokeWidth="1.4" fill="none"><circle cx="230" cy="168" r="74" strokeDasharray="2 7" /></g>
        <path d="M30 420h400" stroke="#102D46" strokeWidth="3" strokeLinecap="round" />
        <path d="M70 420v-22h320v22" fill="#087D52" opacity="0.16" />
        {/* citizen */}
        <g transform="translate(150 150)">
          <rect x="52" y="168" width="22" height="96" rx="9" fill="#102D46" />
          <rect x="86" y="168" width="22" height="96" rx="9" fill="#17405F" />
          <rect x="46" y="256" width="34" height="12" rx="6" fill="#102D46" />
          <rect x="82" y="256" width="34" height="12" rx="6" fill="#102D46" />
          <path d="M34 70q46-22 92 0l12 112H22z" fill="#087D52" />
          <path d="M34 70l56 40 36-40" fill="none" stroke="#FFFFFF" strokeWidth="4" strokeLinejoin="round" opacity="0.85" />
          <path d="M38 76l22 110" stroke="#F29B28" strokeWidth="12" strokeLinecap="round" opacity="0.95" />
          <rect x="72" y="42" width="16" height="22" rx="7" fill="#C98B5E" />
          <circle cx="80" cy="34" r="25" fill="#D9A07A" />
          <path d="M55 32a26 26 0 0 1 52-4c-6-12-44-16-52 4z" fill="#1c1c28" />
          <path d="M126 86l52-14" stroke="#087D52" strokeWidth="15" strokeLinecap="round" />
          <circle cx="182" cy="70" r="9" fill="#D9A07A" />
          <g transform="translate(184 40)"><circle r="28" cx="14" cy="14" fill="#DCEEFF" fillOpacity="0.75" stroke="#102D46" strokeWidth="5" /><path d="M34 34l24 24" stroke="#102D46" strokeWidth="7" strokeLinecap="round" /></g>
          <path d="M22 86l-14 58" stroke="#087D52" strokeWidth="15" strokeLinecap="round" />
          <circle cx="6" cy="150" r="9" fill="#D9A07A" />
        </g>
      </svg>
      <div className="heroart__card heroart__card--a anim-float">
        <span className="heroart__label"><T k="heroart.eligibility" /></span>
        <StatusBadge status="pass" size="sm" />
      </div>
      <div className="heroart__card heroart__card--b anim-float-alt">
        <span className="heroart__label"><T k="heroart.docs" /></span>
        <ProgressBar value={66} label="Documents ready" height={8} />
      </div>
      <div className="heroart__card heroart__card--c anim-float">
        <StatusBadge status="info-verified" size="sm" />
        <span className="heroart__label"><T k="heroart.source" /></span>
      </div>
      <figcaption className="heroart__caption"><T k="heroart.sample" /></figcaption>
    </figure>
  );
}
