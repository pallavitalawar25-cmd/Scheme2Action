import { useEffect, useRef, useState } from 'react';
import { animate, useInView, useReducedMotion } from 'framer-motion';

export default function AnimatedNumber({ value, duration = 1.4, suffix = '', className }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const reduce = useReducedMotion();
  const [n, setN] = useState(reduce ? value : 0);
  useEffect(() => {
    if (!inView) return undefined;
    if (reduce) { setN(value); return undefined; }
    const controls = animate(0, value, { duration, ease: [0.22, 1, 0.36, 1], onUpdate: (v) => setN(Math.round(v)) });
    return () => controls.stop();
  }, [inView, value, duration, reduce]);
  return <span ref={ref} className={className}>{n.toLocaleString('en-IN')}{suffix}</span>;
}
