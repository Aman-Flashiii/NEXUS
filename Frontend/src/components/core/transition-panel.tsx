'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type TransitionPanelProps = {
  activeIndex: number;
  children: React.ReactNode[];
  className?: string;
  direction?: 1 | -1;
};

export function TransitionPanel({
  activeIndex,
  children,
  className,
  direction = 1,
}: TransitionPanelProps) {
  return (
    <div className={className}>
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={activeIndex}
          custom={direction}
          initial={{ opacity: 0, x: direction * 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction * -16 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
        >
          {children[activeIndex]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
