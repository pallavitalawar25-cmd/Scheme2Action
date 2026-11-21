import { motion } from 'framer-motion';
import { EASE } from '../../utils/motion';

export default function ProgressRing({ value = 0, size = 88, stroke = 9, tone = 'emerald', label, children }) {
  const v = Math.max(0, Math.min(100, value));
  const r = (size - stroke) / 2;
  const c = size / 2;
  return (
    <div className="ring" style={{ width: size, height: size }} role="img" aria-label={label ? `${label}: ${Math.round(v)}%` : `${Math.round(v)}%`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle cx={c} cy={c} r={r} fill="none" strokeWidth={stroke} className="ring__track" />
        <motion.circle cx={c} cy={c} r={r} fill="none" strokeWidth={stroke} strokeLinecap="round" className={`ring__bar ring__bar--${tone}`}
          style={{ rotate: -90, originX: '50%', originY: '50%' }} initial={{ pathLength: 0 }} animate={{ pathLength: v / 100 }} transition={{ duration: 1.1, ease: EASE }} />
      </svg>
      <span className="ring__label">{children ?? `${Math.round(v)}%`}</span>
    </div>
  );
}
