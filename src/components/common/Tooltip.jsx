import { useId } from 'react';

// Shows on hover and keyboard focus. Wrap a single focusable child.
export default function Tooltip({ label, children }) {
  const id = useId();
  return (
    <span className="tooltip" aria-describedby={id}>
      {children}
      <span role="tooltip" id={id} className="tooltip__bubble">{label}</span>
    </span>
  );
}
