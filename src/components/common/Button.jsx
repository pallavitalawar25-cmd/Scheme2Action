import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

// variants: primary (emerald) | accent (saffron) | secondary (navy outline) | ghost | sky | danger
const Button = forwardRef(function Button(
  { variant = 'primary', size = 'md', to, href, iconLeft: IconLeft, iconRight: IconRight, loading = false, block = false, className = '', children, ...rest },
  ref,
) {
  const cls = ['btn', `btn--${variant}`, `btn--${size}`, block && 'btn--block', loading && 'is-loading', className].filter(Boolean).join(' ');
  const inner = (
    <>
      {loading ? <Loader2 size={18} className="btn__spin" aria-hidden="true" /> : IconLeft && <IconLeft size={18} className="btn__icon" aria-hidden="true" />}
      <span className="btn__label">{children}</span>
      {IconRight && !loading && <IconRight size={18} className="btn__icon btn__icon--end" aria-hidden="true" />}
    </>
  );
  if (to) return <Link ref={ref} to={to} className={cls} {...rest}>{inner}</Link>;
  if (href) return <a ref={ref} href={href} className={cls} {...rest}>{inner}</a>;
  return <button ref={ref} type="button" className={cls} aria-busy={loading || undefined} {...rest} disabled={loading || rest.disabled}>{inner}</button>;
});

export default Button;
