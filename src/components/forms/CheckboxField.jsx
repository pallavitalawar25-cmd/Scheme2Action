import { forwardRef, useId } from 'react';
import { AlertCircle } from 'lucide-react';

// Accessible checkbox row (reuses the .check styling from filters).
const CheckboxField = forwardRef(function CheckboxField({ label, error, children, ...rest }, ref) {
  const id = useId();
  return (
    <div className={`checkfield${error ? ' has-error' : ''}`}>
      <label className="check checkfield__label">
        <input ref={ref} type="checkbox" aria-invalid={error ? true : undefined} aria-describedby={error ? `${id}-err` : undefined} {...rest} />
        <span className="check__box" aria-hidden="true" />
        <span className="check__text">{label ?? children}</span>
      </label>
      {error && <p id={`${id}-err`} className="field__error" role="alert"><AlertCircle size={15} aria-hidden="true" />{error}</p>}
    </div>
  );
});
export default CheckboxField;
