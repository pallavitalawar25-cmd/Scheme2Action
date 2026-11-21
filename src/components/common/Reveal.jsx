import { motion } from 'framer-motion';
import { EASE } from '../../utils/motion';

// Scroll-triggered reveal. Use for hero-level moments, not every element.
export default function Reveal({ children, delay = 0, y = 24, as = 'div', className, once = true, ...rest }) {
  const Comp = motion[as] || motion.div;
  return (
    <Comp className={className} {...rest} initial={{ opacity: 0, y }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once, margin: '-60px' }} transition={{ duration: 0.6, delay, ease: EASE }}>
      {children}
    </Comp>
  );
}
