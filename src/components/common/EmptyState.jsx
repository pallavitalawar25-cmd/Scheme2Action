import { motion } from 'framer-motion';

export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="empty">
      <div className="empty__art" aria-hidden="true">
        <svg viewBox="0 0 160 160" className="empty__orbit anim-spin-slow">
          <circle cx="80" cy="80" r="70" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 9" strokeLinecap="round" />
          <circle cx="80" cy="10" r="6" fill="#F29B28" />
          <circle cx="150" cy="80" r="5" fill="#087D52" />
        </svg>
        <motion.div className="empty__icon" initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 18 }}>
          {Icon && <Icon size={34} />}
        </motion.div>
      </div>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {action}
    </div>
  );
}
