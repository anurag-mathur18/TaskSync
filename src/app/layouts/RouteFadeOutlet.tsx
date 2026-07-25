import { AnimatePresence, motion } from 'motion/react';
import { Outlet, useLocation } from 'react-router';

/** M4 — route content fade (opacity 0→1, 150ms) keyed by pathname. */
export function RouteFadeOutlet() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
      >
        <Outlet />
      </motion.div>
    </AnimatePresence>
  );
}
