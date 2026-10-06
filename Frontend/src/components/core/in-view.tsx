'use client';

import React, { useRef, useEffect, useState } from 'react';
import {
  motion,
  useInView,
  type Variant,
  type UseInViewOptions,
  type Transition,
} from 'framer-motion';

type InViewProps = {
  children: React.ReactNode;
  variants?: {
    hidden: Variant;
    visible: Variant;
  };
  transition?: Transition;
  viewOptions?: UseInViewOptions;
};

const defaultVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0 },
};

const defaultTransition: Transition = { duration: 0.25, delay: 0 };

export function InView({
  children,
  variants = defaultVariants,
  transition = defaultTransition,
  viewOptions,
}: InViewProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, ...viewOptions });
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (isInView && !hasAnimated) {
      setHasAnimated(true);
    }
  }, [isInView, hasAnimated]);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={hasAnimated ? 'visible' : 'hidden'}
      variants={variants}
      transition={transition}
    >
      {children}
    </motion.div>
  );
}
