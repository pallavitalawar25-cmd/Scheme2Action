import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, RotateCcw, SearchX } from 'lucide-react';
import SchemeCard from './SchemeCard';
import { CardSkeleton } from '../common/Skeleton';
import EmptyState from '../common/EmptyState';
import Button from '../common/Button';
import T from '../common/T';

export function SchemeSkeletonGrid({ view = 'grid', count = 6 }) {
  return (
    <ul className={`schemegrid schemegrid--${view}`} aria-busy="true">
      {Array.from({ length: count }, (_, i) => <li key={i}><CardSkeleton /></li>)}
    </ul>
  );
}

export function SchemeError({ onRetry }) {
  return (
    <EmptyState icon={AlertTriangle} title={<T k="error.title" />} description={<T k="error.desc" />}
      action={<Button iconLeft={RotateCcw} onClick={onRetry}><T k="error.retry" /></Button>} />
  );
}

export function SchemeEmpty({ onClear }) {
  return (
    <EmptyState icon={SearchX} title={<T k="empty.title" />} description={<T k="empty.desc" />}
      action={onClear && <Button variant="secondary" iconLeft={RotateCcw} onClick={onClear}><T k="filters.clear" /></Button>} />
  );
}

// Animated list: cards fade/slide in and re-flow smoothly when filters change.
export default function SchemeResults({ schemes, view = 'grid' }) {
  return (
    <motion.ul className={`schemegrid schemegrid--${view}`} layout>
      <AnimatePresence mode="popLayout" initial>
        {schemes.map((s, i) => (
          <motion.li key={s.id} layout initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.38, delay: Math.min(i, 8) * 0.04, ease: [0.22, 1, 0.36, 1] }}>
            <SchemeCard scheme={s} view={view} />
          </motion.li>
        ))}
      </AnimatePresence>
    </motion.ul>
  );
}
