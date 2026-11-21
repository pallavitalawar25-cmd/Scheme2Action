import { Suspense, useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { pageTransition } from '../utils/motion';
import { CardSkeleton } from '../components/common/Skeleton';

export function RouteFallback() {
  return (
    <div className="container section route-fallback"><CardSkeleton /><CardSkeleton /><CardSkeleton /></div>
  );
}

// Fades pages in, scrolls to top and moves focus to <main> on route change (screen-reader friendly).
export default function PageTransition() {
  const { pathname } = useLocation();
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.getElementById('main')?.focus({ preventScroll: true });
  }, [pathname]);
  return (
    <motion.div key={pathname} {...pageTransition}>
      <Suspense fallback={<RouteFallback />}><Outlet /></Suspense>
    </motion.div>
  );
}
