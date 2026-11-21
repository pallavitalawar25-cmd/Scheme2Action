import { useId, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronDown } from 'lucide-react';
import useOnClickOutside from '../../hooks/useOnClickOutside';

// Accessible single-select listbox. options: [{ value, label }]
export default function Dropdown({ label, value, options, onChange, icon: Icon }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const ref = useRef(null);
  const listId = useId();
  useOnClickOutside(ref, () => setOpen(false), open);
  const selected = options.find((o) => o.value === value) || options[0];

  const choose = (opt) => { onChange(opt.value); setOpen(false); };
  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); if (!open) { setOpen(true); setActive(options.findIndex((o) => o.value === value)); } else setActive((i) => Math.min(i + 1, options.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((i) => Math.max(i - 1, 0)); }
    else if ((e.key === 'Enter' || e.key === ' ') && open) { e.preventDefault(); choose(options[active]); }
    else if (e.key === 'Escape') setOpen(false);
  };

  return (
    <div className="dropdown" ref={ref}>
      <button type="button" className="dropdown__btn" aria-haspopup="listbox" aria-expanded={open} aria-controls={listId} aria-label={`${label}: ${selected?.label}`} onClick={() => setOpen((o) => !o)} onKeyDown={onKeyDown}>
        {Icon && <Icon size={17} aria-hidden="true" />}
        <span>{selected?.label}</span>
        <ChevronDown size={16} aria-hidden="true" className={`dropdown__chev${open ? ' is-open' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul id={listId} role="listbox" aria-label={label} className="dropdown__list" initial={{ opacity: 0, y: -8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.16 }}>
            {options.map((o, i) => (
              <li key={o.value} role="option" aria-selected={o.value === value} className={`dropdown__opt${i === active ? ' is-active' : ''}`} onMouseEnter={() => setActive(i)} onClick={() => choose(o)}>
                <span>{o.label}</span>{o.value === value && <Check size={16} aria-hidden="true" />}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
