import { motion } from 'framer-motion';
import { EASE } from '../../utils/motion';

export default function ProgressBar({ value = 0, label, tone = 'emerald', height = 10 }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(v)} aria-label={label} style={{ height }}>
      <motion.div className={`progress__fill progress__fill--${tone}`} initial={{ width: 0 }} animate={{ width: `${v}%` }} transition={{ duration: 0.9, ease: EASE }} />
    </div>
  );
}
