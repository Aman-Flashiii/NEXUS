'use client';

import React, { useId } from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

type AnimatedBackgroundProps = {
  children: React.ReactNode;
  activeValue: string;
  className?: string;
  backgroundClassName?: string;
  onValueChange?: (value: string) => void;
};

type AnimatedBackgroundItemProps = {
  children: React.ReactNode;
  value: string;
  className?: string;
};

export function AnimatedBackground({
  children,
  activeValue,
  className,
  backgroundClassName,
}: AnimatedBackgroundProps) {
  const layoutId = useId();
  const childArray = React.Children.toArray(children);

  return (
    <div className={clsx('relative', className)}>
      {childArray.map((child) => {
        if (!React.isValidElement<AnimatedBackgroundItemProps>(child)) return child;
        const value = child.props.value;
        if (!value) return child;
        const isActive = value === activeValue;
        return (
          <div key={value} className="relative">
            {isActive && (
              <motion.div
                layoutId={layoutId}
                className={clsx(
                  'absolute inset-0 rounded-md',
                  backgroundClassName || 'bg-neutral-800/60'
                )}
                transition={{
                  type: 'spring',
                  stiffness: 380,
                  damping: 30,
                }}
              />
            )}
            <div className="relative z-10">{child}</div>
          </div>
        );
      })}
    </div>
  );
}

export function AnimatedBackgroundItem({
  children,
  value,
  className,
}: AnimatedBackgroundItemProps) {
  return <div className={className}>{children}</div>;
}
