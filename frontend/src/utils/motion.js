/**
 * Shared framer-motion variants. Motion is used sparingly and consistently:
 * short, eased, mostly opacity + small translate. Respects reduced-motion via the
 * global CSS override in index.css.
 */

export const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
  },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.4, ease: 'easeOut' } },
};

// Parent that staggers its children (use with fadeUp items).
export const staggerContainer = (stagger = 0.06, delay = 0) => ({
  hidden: {},
  show: {
    transition: { staggerChildren: stagger, delayChildren: delay },
  },
});

// Drawer / slide-over from the right.
export const slideOverRight = {
  hidden: { x: '100%' },
  show: { x: 0, transition: { type: 'spring', stiffness: 380, damping: 40 } },
  exit: { x: '100%', transition: { duration: 0.25, ease: 'easeIn' } },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.96 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, scale: 0.96, transition: { duration: 0.15 } },
};

export const backdrop = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};
