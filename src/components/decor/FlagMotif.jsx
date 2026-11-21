// Tiny tricolour motif for the footer. A simple ring, not the official emblem.
export default function FlagMotif({ width = 34 }) {
  return (
    <svg width={width} height={(width * 2) / 3} viewBox="0 0 30 20" role="img" aria-label="Indian tricolour motif" className="flagmotif">
      <rect width="30" height="6.67" fill="#F29B28" />
      <rect y="6.67" width="30" height="6.66" fill="#fff" />
      <rect y="13.33" width="30" height="6.67" fill="#087D52" />
      <circle cx="15" cy="10" r="2.6" fill="none" stroke="#17405F" strokeWidth="0.6" />
      <circle cx="15" cy="10" r="0.5" fill="#17405F" />
      <rect width="30" height="20" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="0.5" />
    </svg>
  );
}
