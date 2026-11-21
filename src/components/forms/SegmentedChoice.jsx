import { useId } from 'react';
import { motion } from 'framer-motion';

// Radio-group styled as big segmented buttons (language, text size). options: [{ value, label, lang? }]
export default function SegmentedChoice({ label, value, options, onChange, large = false }) {
  const id = useId();
  return (
    <div className={`segchoice${large ? ' segchoice--lg' : ''}`} role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <button key={o.value} type="button" role="radio" aria-checked={value === o.value} lang={o.lang} className={`segchoice__btn${value === o.value ? ' is-active' : ''}`} onClick={() => onChange(o.value)}>
          {value === o.value && <motion.span layoutId={`seg-${id}`} className="segchoice__pill" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
          <span className="segchoice__text">{o.label}</span>
        </button>
      ))}
    </div>
  );
}
