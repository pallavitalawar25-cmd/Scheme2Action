import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { EASE } from '../../utils/motion';

// items: [{ id, title, desc?, state: 'done'|'current'|'upcoming', track?: 'platform'|'government', badge? }]
export default function Timeline({ items }) {
  return (
    <ol className="timeline">
      {items.map((it, i) => (
        <motion.li key={it.id} className={`timeline__item is-${it.state}${it.track ? ` track-${it.track}` : ''}`}
          initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: '-30px' }} transition={{ delay: Math.min(i, 6) * 0.05, duration: 0.45, ease: EASE }}>
          <span className="timeline__node" aria-hidden="true">
            {it.state === 'done' && <Check size={14} />}
            {it.state === 'current' && <span className="timeline__pulse" />}
          </span>
          <div className="timeline__body">
            <div className="timeline__title">{it.title}</div>
            {it.desc && <p className="timeline__desc">{it.desc}</p>}
            {it.badge}
          </div>
        </motion.li>
      ))}
    </ol>
  );
}
