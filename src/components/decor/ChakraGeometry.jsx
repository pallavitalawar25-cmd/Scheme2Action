// Chakra-inspired 24-spoke geometry used only as faint decorative pattern.
// It is NOT the national emblem and implies no official endorsement.
export default function ChakraGeometry({ size = 420, className = '', spin = true }) {
  const spokes = Array.from({ length: 24 }, (_, i) => i * 15);
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" className={`chakra ${spin ? 'anim-spin-slow' : ''} ${className}`} aria-hidden="true" fill="none" stroke="currentColor">
      <circle cx="100" cy="100" r="94" strokeWidth="1.4" />
      <circle cx="100" cy="100" r="86" strokeWidth="0.6" strokeDasharray="1.5 4" />
      <circle cx="100" cy="100" r="16" strokeWidth="1.4" />
      {spokes.map((a) => (
        <g key={a} transform={`rotate(${a} 100 100)`}>
          <line x1="100" y1="116" x2="100" y2="12" strokeWidth="0.9" />
          <circle cx="100" cy="8" r="2.2" strokeWidth="0.9" />
        </g>
      ))}
    </svg>
  );
}
