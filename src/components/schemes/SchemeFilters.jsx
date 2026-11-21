import { RotateCcw } from 'lucide-react';
import T from '../common/T';
import StatusBadge from '../common/StatusBadge';
import Button from '../common/Button';
import { categories } from '../../data/categories';
import { verificationOrder } from '../../data/schemes';

// Shared by the desktop sidebar and the mobile filter sheet.
export default function SchemeFilters({ selectedCategories, selectedStatuses, counts, onToggleCategory, onToggleStatus, onClear, activeCount }) {
  return (
    <div className="filters">
      <div className="filters__head">
        <h2 className="filters__title"><T k="filters.title" /></h2>
        {activeCount > 0 && (
          <Button variant="ghost" size="sm" iconLeft={RotateCcw} onClick={onClear}><T k="filters.clear" /></Button>
        )}
      </div>
      <fieldset className="filters__group">
        <legend><T k="filters.category" /></legend>
        {categories.map((c) => {
          const Icon = c.icon;
          const count = counts.category[c.slug] || 0;
          return (
            <label key={c.slug} className={`check${count === 0 && !selectedCategories.includes(c.slug) ? ' is-empty' : ''}`} style={{ '--cat': c.accent }}>
              <input type="checkbox" checked={selectedCategories.includes(c.slug)} onChange={() => onToggleCategory(c.slug)} />
              <span className="check__box" aria-hidden="true" />
              <span className="check__icon"><Icon size={15} aria-hidden="true" /></span>
              <span className="check__text"><T k={`cat.${c.slug}`} /></span>
              <span className="check__count">{count}</span>
            </label>
          );
        })}
      </fieldset>
      <fieldset className="filters__group">
        <legend><T k="filters.verification" /></legend>
        {verificationOrder.map((s) => (
          <label key={s} className="check">
            <input type="checkbox" checked={selectedStatuses.includes(s)} onChange={() => onToggleStatus(s)} />
            <span className="check__box" aria-hidden="true" />
            <StatusBadge status={s} size="sm" />
            <span className="check__count">{counts.status[s] || 0}</span>
          </label>
        ))}
      </fieldset>
    </div>
  );
}
