import { useId } from 'react';

// role="switch" toggle with label + description.
export default function ToggleSwitch({ checked, onChange, label, description }) {
  const id = useId();
  return (
    <div className="switchrow">
      <div className="switchrow__text">
        <label htmlFor={id} className="switchrow__label">{label}</label>
        {description && <p className="switchrow__desc" id={`${id}-d`}>{description}</p>}
      </div>
      <button id={id} type="button" role="switch" aria-checked={checked} aria-describedby={description ? `${id}-d` : undefined} className={`switch${checked ? ' is-on' : ''}`} onClick={() => onChange(!checked)}>
        <span className="switch__knob" />
      </button>
    </div>
  );
}
