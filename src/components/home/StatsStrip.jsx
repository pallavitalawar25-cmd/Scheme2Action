import AnimatedNumber from '../common/AnimatedNumber';
import Reveal from '../common/Reveal';
import T from '../common/T';
import { schemes } from '../../data/schemes';
import { categories } from '../../data/categories';

export default function StatsStrip() {
  const items = [
    { value: schemes.length, k: 'stats.schemes' },
    { value: categories.length, k: 'stats.categories' },
    { value: 2, k: 'stats.levels' },
    { value: 2, k: 'stats.languages' },
  ];
  return (
    <Reveal className="container statsstrip-wrap">
      <ul className="statsstrip">
        {items.map((it) => (
          <li key={it.k}>
            <AnimatedNumber value={it.value} className="statsstrip__num" />
            <span className="statsstrip__label"><T k={it.k} /></span>
          </li>
        ))}
      </ul>
    </Reveal>
  );
}
