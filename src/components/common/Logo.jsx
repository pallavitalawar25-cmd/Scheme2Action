import { Link } from 'react-router-dom';

// Placeholder mark: three tricolour chevrons moving forward (scheme to action).
// When the real logo arrives, replace the contents of LogoMark only.
export function LogoMark({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true" className="logo__mark">
      <rect width="40" height="40" rx="12" fill="#102D46" />
      <g fill="none" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round">
        <path className="logo__chev logo__chev--1" d="M9 11l9 9-9 9" stroke="#F29B28" />
        <path className="logo__chev logo__chev--2" d="M16 11l9 9-9 9" stroke="#FFFFFF" />
        <path className="logo__chev logo__chev--3" d="M23 11l9 9-9 9" stroke="#14B87F" />
      </g>
    </svg>
  );
}

export default function Logo({ to = '/', light = false, compact = false }) {
  return (
    <Link to={to} className={`logo${light ? ' logo--light' : ''}`} aria-label="Scheme2Action home">
      <LogoMark />
      {!compact && (
        <span className="logo__word">Scheme<span className="logo__two">2</span>Action</span>
      )}
    </Link>
  );
}
