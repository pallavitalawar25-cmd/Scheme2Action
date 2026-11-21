// Slowly flowing saffron / white / green ribbons. Pure CSS motion (cheap), SVG artwork.
const wave = (y, amp, period = 600, total = 3000) => {
  let d = `M0 ${y} Q ${period / 4} ${y - amp} ${period / 2} ${y}`;
  for (let x = period; x <= total; x += period / 2) d += ` T ${x} ${y}`;
  return d;
};

export default function TricolourRibbon({ className = '', height = 220 }) {
  const lanes = [
    { y: 70, amp: 38, color: '#F29B28', dur: 46, delay: 0, w: 22 },
    { y: 104, amp: 38, color: '#FFFFFF', dur: 46, delay: -3, w: 22, outline: true },
    { y: 138, amp: 38, color: '#087D52', dur: 46, delay: -6, w: 22 },
  ];
  return (
    <div className={`ribbon ${className}`} aria-hidden="true">
      <svg viewBox="0 0 1200 220" preserveAspectRatio="xMidYMid slice" height={height} width="100%">
        {lanes.map((l, i) => (
          <g key={i} className="ribbon__flow" style={{ animation: `ribbon-flow ${l.dur}s linear infinite`, animationDelay: `${l.delay}s` }}>
            {l.outline && <path d={wave(l.y, l.amp)} fill="none" stroke="rgba(16,45,70,0.14)" strokeWidth={l.w + 3} strokeLinecap="round" />}
            <path d={wave(l.y, l.amp)} fill="none" stroke={l.color} strokeWidth={l.w} strokeLinecap="round" opacity={l.outline ? 1 : 0.92} />
          </g>
        ))}
      </svg>
    </div>
  );
}
