import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import Button from '../common/Button';
import T from '../common/T';
import { useLanguage } from '../../context/LanguageContext';
import useEscape from '../../hooks/useEscape';
import useLockBodyScroll from '../../hooks/useLockBodyScroll';

// Mobile/tablet bottom sheet holding the same filters as the desktop sidebar.
export default function FilterSheet({ open, onClose, resultCount, children }) {
  const { t } = useLanguage();
  useEscape(onClose, open);
  useLockBodyScroll(open);
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="sheet-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} aria-hidden="true" />
          <motion.div className="sheet" role="dialog" aria-modal="true" aria-label={t('filters.title')} initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', stiffness: 380, damping: 38 }}>
            <div className="sheet__grab" aria-hidden="true" />
            <button type="button" className="icon-btn sheet__close" onClick={onClose} aria-label={t('common.close')}><X size={22} aria-hidden="true" /></button>
            <div className="sheet__body">{children}</div>
            <div className="sheet__foot"><Button block onClick={onClose}><T k="filters.show" vars={{ count: resultCount }} /></Button></div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
