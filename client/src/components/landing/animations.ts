export const fadeInUp = {
  initial: { opacity: 0, y: 25 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
};

export const staggerChildren = {
  animate: { transition: { staggerChildren: 0.1 } },
};
