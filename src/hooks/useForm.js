import { useCallback, useMemo, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

// Small form helper: values, per-field touched state, translated errors, accessible focus on first error.
// validate(values) returns { field: 'translation.key' } for invalid fields.
export default function useForm({ initial, validate }) {
  const { t } = useLanguage();
  const [values, setValues] = useState(initial);
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const errors = useMemo(() => validate(values), [values, validate]);

  const setValue = useCallback((name, value) => setValues((v) => ({ ...v, [name]: value })), []);
  const err = (name) => ((touched[name] || submitted) && errors[name] ? t(errors[name]) : undefined);

  const bind = (name) => ({
    name, value: values[name] ?? '', error: err(name),
    onChange: (e) => setValue(name, e.target.value),
    onBlur: () => setTouched((x) => ({ ...x, [name]: true })),
  });
  const bindCheck = (name) => ({
    name, checked: Boolean(values[name]), error: err(name),
    onChange: (e) => setValue(name, e.target.checked),
    onBlur: () => setTouched((x) => ({ ...x, [name]: true })),
  });

  const handleSubmit = (onValid) => async (e) => {
    e?.preventDefault?.();
    setSubmitted(true);
    if (Object.keys(errors).length) {
      window.setTimeout(() => document.querySelector('[aria-invalid="true"]')?.focus?.(), 0);
      return;
    }
    await onValid(values);
  };

  const reset = (next = initial) => { setValues(next); setTouched({}); setSubmitted(false); };
  return { values, errors, setValue, bind, bindCheck, handleSubmit, reset, isValid: Object.keys(errors).length === 0 };
}
