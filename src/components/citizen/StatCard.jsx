import { Link } from 'react-router-dom';
import AnimatedNumber from '../common/AnimatedNumber';

export default function StatCard({ icon: Icon, value, label, to, accent = '#087d52' }) {
  const body = (
    <>
      <span className="statcard__icon"><Icon size={22} aria-hidden="true" /></span>
      <AnimatedNumber value={value} className="statcard__num" />
      <span className="statcard__label">{label}</span>
    </>
  );
  return to
    ? <Link to={to} className="statcard" style={{ '--c': accent }}>{body}</Link>
    : <div className="statcard" style={{ '--c': accent }}>{body}</div>;
}
