import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { useLanguage } from './LanguageContext';

const ToastContext = createContext(null);
const ICONS = { success: CheckCircle2, info: Info, warning: AlertTriangle, error: XCircle };

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const counter = useRef(0);
  const { t } = useLanguage();

  const dismiss = useCallback((id) => setToasts((list) => list.filter((x) => x.id !== id)), []);
  const push = useCallback((type, message, duration = 4500) => {
    const id = ++counter.current;
    setToasts((list) => [...list.slice(-3), { id, type, message }]);
    if (duration) window.setTimeout(() => dismiss(id), duration);
    return id;
  }, [dismiss]);

  const api = useMemo(() => ({
    success: (m, d) => push('success', m, d),
    info: (m, d) => push('info', m, d),
    warning: (m, d) => push('warning', m, d),
    error: (m, d) => push('error', m, d),
    dismiss,
  }), [push, dismiss]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="toast-region" aria-live="polite" aria-atomic="false">
        <AnimatePresence initial={false}>
          {toasts.map((item) => {
            const Icon = ICONS[item.type];
            return (
              <motion.div
                key={item.id}
                layout
                className={`toast toast--${item.type}`}
                role={item.type === 'error' ? 'alert' : 'status'}
                initial={{ opacity: 0, y: 24, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 60, transition: { duration: 0.2 } }}
                transition={{ type: 'spring', stiffness: 420, damping: 32 }}
              >
                <Icon size={20} aria-hidden="true" className="toast__icon" />
                <p className="toast__msg">{item.message}</p>
                <button type="button" className="toast__close" onClick={() => dismiss(item.id)} aria-label={t('common.close')}>
                  <X size={16} aria-hidden="true" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}
