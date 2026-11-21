import { BadgeCheck, CheckCircle2, Clock, FlaskConical, HelpCircle, ShieldCheck, Sparkles, UserPen, XCircle } from 'lucide-react';
import T from './T';

const MAP = {
  verified: { icon: ShieldCheck, tone: 'emerald' },
  'info-verified': { icon: BadgeCheck, tone: 'sky' },
  pending: { icon: Clock, tone: 'saffron', pulse: true },
  mock: { icon: FlaskConical, tone: 'grey' },
  pass: { icon: CheckCircle2, tone: 'emerald' },
  fail: { icon: XCircle, tone: 'coral' },
  unknown: { icon: HelpCircle, tone: 'saffron' },
  ai: { icon: Sparkles, tone: 'sky' },
  corrected: { icon: UserPen, tone: 'saffron' },
};

export default function StatusBadge({ status, size = 'md' }) {
  const cfg = MAP[status] || MAP.mock;
  const Icon = cfg.icon;
  return (
    <span className={`badge badge--${cfg.tone} badge--${size}`}>
      <span className={`badge__icon${cfg.pulse ? ' badge__icon--pulse' : ''}`}><Icon size={size === 'sm' ? 13 : 15} aria-hidden="true" /></span>
      <T k={`status.${status}`} />
    </span>
  );
}
