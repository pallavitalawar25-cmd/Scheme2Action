import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import T from '../common/T';

export default function CategoryCard({ category }) {
  const Icon = category.icon;
  return (
    <Link to={`/categories/${category.slug}`} className="catcard" style={{ '--cat': category.accent }}>
      <span className="catcard__icon"><Icon size={26} aria-hidden="true" /></span>
      <span className="catcard__title"><T k={`cat.${category.slug}`} /></span>
      <span className="catcard__desc"><T k={`cat.${category.slug}.desc`} /></span>
      <span className="catcard__go" aria-hidden="true"><ArrowUpRight size={18} /></span>
    </Link>
  );
}
