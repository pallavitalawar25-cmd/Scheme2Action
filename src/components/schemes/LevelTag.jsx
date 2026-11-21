import { Landmark, MapPin } from 'lucide-react';
import T from '../common/T';

export default function LevelTag({ level, full = false }) {
  const Icon = level === 'central' ? Landmark : MapPin;
  return (
    <span className={`leveltag leveltag--${level}`}>
      <Icon size={14} aria-hidden="true" />
      <T k={`level.${level}${full ? '.full' : ''}`} />
    </span>
  );
}
