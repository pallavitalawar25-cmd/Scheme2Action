import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export default function PageHeader({ title, description, actions, breadcrumbs, icon: Icon, accent }) {
  return (
    <header className="pagehead" style={accent ? { '--accent-c': accent } : undefined}>
      {breadcrumbs && (
        <nav aria-label="Breadcrumb" className="crumbs">
          <ol>
            {breadcrumbs.map((b, i) => (
              <li key={i}>
                {b.to ? <Link to={b.to}>{b.label}</Link> : <span aria-current="page">{b.label}</span>}
                {i < breadcrumbs.length - 1 && <ChevronRight size={14} aria-hidden="true" />}
              </li>
            ))}
          </ol>
        </nav>
      )}
      <div className="pagehead__row">
        {Icon && <span className="pagehead__icon"><Icon size={28} aria-hidden="true" /></span>}
        <div className="pagehead__text">
          <h1>{title}</h1>
          {description && <p className="pagehead__desc">{description}</p>}
        </div>
        {actions && <div className="pagehead__actions">{actions}</div>}
      </div>
      <span className="pagehead__rule" aria-hidden="true" />
    </header>
  );
}
