import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import T from '../common/T';
import ProgressBar from '../common/ProgressBar';
import { useLanguage } from '../../context/LanguageContext';
import { EASE } from '../../utils/motion';

// Persistent application stepper. Desktop: full track. Mobile: compact "Step n of N" + progress bar.
export default function Stepper({ steps, current, basePath }) {
  const { t } = useLanguage();
  const total = steps.length;
  const pct = total > 1 ? (current / (total - 1)) * 100 : 0;
  const active = steps[current];
  return (
    <nav className="stepper" aria-label={t('step.label')}>
      <div className="stepper__compact">
        <p className="stepper__count"><T k="step.of" vars={{ current: current + 1, total }} /> <span className="stepper__dot" aria-hidden="true" /> <strong><T k={active.key} /></strong></p>
        <ProgressBar value={((current + 1) / total) * 100} label={t('step.label')} height={8} />
      </div>
      <ol className="stepper__track" style={{ '--n': total }}>
        <span className="stepper__rail" aria-hidden="true">
          <motion.span className="stepper__rail-fill" initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: EASE }} />
        </span>
        {steps.map((s, i) => {
          const state = i < current ? 'done' : i === current ? 'current' : 'todo';
          const Icon = s.icon;
          return (
            <li key={s.id} className={`stepper__item is-${state}`}>
              <NavLink to={`${basePath}/${s.path}`} aria-current={state === 'current' ? 'step' : undefined} className="stepper__link">
                <motion.span className="stepper__node" animate={{ scale: state === 'current' ? 1.12 : 1 }} transition={{ type: 'spring', stiffness: 400, damping: 20 }}>
                  {state === 'done' ? <Check size={16} aria-hidden="true" /> : <Icon size={16} aria-hidden="true" />}
                </motion.span>
                <span className="stepper__label"><T k={s.key} /></span>
              </NavLink>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
