import { useId } from 'react';
import { motion } from 'framer-motion';
import T from '../common/T';
import { useLanguage } from '../../context/LanguageContext';

// Central / Karnataka separation: animated segmented control with live counts.
export default function LevelTabs({ value, onChange, counts }) {
  const id = useId();
  const { t } = useLanguage();
  const tabs = ['all', 'central', 'karnataka'];
  return (
    <div className="leveltabs" role="group" aria-label={t('level.tabs')}>
      {tabs.map((tab) => (
        <button key={tab} type="button" className={`leveltabs__btn${value === tab ? ' is-active' : ''}`} aria-pressed={value === tab} onClick={() => onChange(tab)}>
          {value === tab && <motion.span layoutId={`lt-${id}`} className="leveltabs__pill" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
          <span className="leveltabs__label"><T k={`level.${tab}`} /></span>
          <span className="leveltabs__count">{counts[tab] ?? 0}</span>
        </button>
      ))}
    </div>
  );
}
