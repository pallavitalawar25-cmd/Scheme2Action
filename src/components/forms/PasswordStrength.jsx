import { passwordStrength } from '../../utils/validators';
import T from '../common/T';

const LABEL = { 1: 'weak', 2: 'fair', 3: 'strong' };
export default function PasswordStrength({ value }) {
  const score = passwordStrength(value);
  if (!score) return null;
  return (
    <div className="pwstrength" aria-live="polite">
      <div className={`pwstrength__bars s${score}`} aria-hidden="true"><span /><span /><span /></div>
      <p className="pwstrength__label"><T k="auth.strength" />: <strong><T k={`auth.strength.${LABEL[score]}`} /></strong></p>
    </div>
  );
}
