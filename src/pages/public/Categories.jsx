import PageHeader from '../../components/common/PageHeader';
import CategoryCard from '../../components/schemes/CategoryCard';
import T from '../../components/common/T';
import { categories } from '../../data/categories';
import { Layers } from 'lucide-react';

export default function Categories() {
  return (
    <div className="container section">
      <PageHeader icon={Layers} title={<T k="nav.categories" />} description={<T k="home.categories.sub" />} />
      <ul className="grid-cats">{categories.map((c) => <li key={c.slug}><CategoryCard category={c} /></li>)}</ul>
    </div>
  );
}
