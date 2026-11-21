import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Mic, Search } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import useOnClickOutside from '../../hooks/useOnClickOutside';

export const SEARCH_SUGGESTION_KEYS = ['suggest.scholarship', 'suggest.farmer', 'suggest.health', 'suggest.housing', 'suggest.pension', 'suggest.women'];

export default function SearchBar({ initial = '', suggestionKeys = SEARCH_SUGGESTION_KEYS, onSearch, onChange, size = 'lg', placeholderKey = 'search.placeholder' }) {
  const { t, tEn, language } = useLanguage();
  const toast = useToast();
  const listId = useId();
  const [q, setQ] = useState(initial);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [listening, setListening] = useState(false);
  const wrap = useRef(null);
  const rec = useRef(null);
  useOnClickOutside(wrap, () => setOpen(false), open);
  useEffect(() => setQ(initial), [initial]);

  const matches = useMemo(() => {
    const n = q.trim().toLowerCase();
    const all = suggestionKeys.map((k) => ({ key: k, text: t(k), en: tEn(k) }));
    return (n ? all.filter((s) => s.text.toLowerCase().includes(n) || s.en.toLowerCase().includes(n)) : all).slice(0, 6);
  }, [q, suggestionKeys, t, tEn]);

  const submit = (value) => { setOpen(false); onSearch?.(value.trim()); };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(true); setActive((i) => Math.min(i + 1, matches.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((i) => Math.max(i - 1, 0)); }
    else if (e.key === 'Enter' && open && active >= 0) { e.preventDefault(); setQ(matches[active].text); onChange?.(matches[active].text); submit(matches[active].text); }
    else if (e.key === 'Escape') setOpen(false);
  };

  const startVoice = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { toast.info(t('search.voiceUnsupported')); return; }
    if (listening) { rec.current?.stop(); return; }
    const r = new SR();
    r.lang = language === 'kn' ? 'kn-IN' : 'en-IN';
    r.interimResults = false;
    r.onresult = (e) => { const text = e.results[0][0].transcript; setQ(text); onChange?.(text); submit(text); };
    r.onend = () => setListening(false);
    r.onerror = () => { setListening(false); toast.warning(t('search.voiceError')); };
    rec.current = r;
    setListening(true);
    r.start();
  };

  return (
    <div className={`searchbar searchbar--${size}`} ref={wrap}>
      <form role="search" aria-label={t('search.label')} onSubmit={(e) => { e.preventDefault(); submit(q); }} className="searchbar__form">
        <Search size={22} className="searchbar__icon" aria-hidden="true" />
        <input
          type="search" value={q} placeholder={t(placeholderKey)} aria-label={t('search.label')} autoComplete="off"
          role="combobox" aria-expanded={open && matches.length > 0} aria-controls={listId} aria-autocomplete="list" aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
          onChange={(e) => { setQ(e.target.value); onChange?.(e.target.value); setOpen(true); setActive(-1); }} onFocus={() => setOpen(true)} onKeyDown={onKeyDown}
        />
        <button type="button" className={`searchbar__voice${listening ? ' is-listening' : ''}`} onClick={startVoice} aria-label={listening ? t('search.listening') : t('search.voice')} aria-pressed={listening}>
          <Mic size={20} aria-hidden="true" />
        </button>
        <button type="submit" className="searchbar__submit">{t('search.submit')}</button>
      </form>
      <AnimatePresence>
        {open && matches.length > 0 && (
          <motion.ul id={listId} role="listbox" aria-label={t('search.suggestions')} className="searchbar__list" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            {matches.map((s, i) => (
              <li key={s.key} id={`${listId}-${i}`} role="option" aria-selected={i === active} className={i === active ? 'is-active' : ''} onMouseEnter={() => setActive(i)} onClick={() => { setQ(s.text); onChange?.(s.text); submit(s.text); }}>
                <Search size={16} aria-hidden="true" />{s.text}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
