import { forwardRef, useId } from 'react';
import { AlertCircle } from 'lucide-react';

function Wrapper({ id, label, hint, error, required, children }) {
  return (
    <div className={`field${error ? ' has-error' : ''}`}>
      <label htmlFor={id} className="field__label">{label}{required && <span aria-hidden="true" className="field__req"> *</span>}</label>
      {children}
      {hint && !error && <p id={`${id}-hint`} className="field__hint">{hint}</p>}
      {error && <p id={`${id}-err`} className="field__error" role="alert"><AlertCircle size={15} aria-hidden="true" />{error}</p>}
    </div>
  );
}
const describe = (id, hint, error) => (error ? `${id}-err` : hint ? `${id}-hint` : undefined);

export const TextField = forwardRef(function TextField({ label, hint, error, required, icon: Icon, trailing, className = '', ...rest }, ref) {
  const id = useId();
  return (
    <Wrapper id={id} label={label} hint={hint} error={error} required={required}>
      <div className="field__control">
        {Icon && <Icon size={18} className="field__icon" aria-hidden="true" />}
        <input ref={ref} id={id} className={`input${Icon ? ' input--icon' : ''} ${className}`} aria-invalid={error ? true : undefined} aria-describedby={describe(id, hint, error)} aria-required={required || undefined} {...rest} />
        {trailing && <span className="field__trailing">{trailing}</span>}
      </div>
    </Wrapper>
  );
});

export const SelectField = forwardRef(function SelectField({ label, hint, error, required, options = [], children, ...rest }, ref) {
  const id = useId();
  return (
    <Wrapper id={id} label={label} hint={hint} error={error} required={required}>
      <select ref={ref} id={id} className="input select" aria-invalid={error ? true : undefined} aria-describedby={describe(id, hint, error)} {...rest}>
        {children || options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </Wrapper>
  );
});

export const TextAreaField = forwardRef(function TextAreaField({ label, hint, error, required, rows = 4, ...rest }, ref) {
  const id = useId();
  return (
    <Wrapper id={id} label={label} hint={hint} error={error} required={required}>
      <textarea ref={ref} id={id} rows={rows} className="input textarea" aria-invalid={error ? true : undefined} aria-describedby={describe(id, hint, error)} {...rest} />
    </Wrapper>
  );
});
