'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

type BorderTrailProps = {
  children: React.ReactNode;
  className?: string;
  active?: boolean;
  color?: string;
  duration?: number;
};

export function BorderTrail({
  children,
  className,
  active = false,
  color = 'rgba(59,130,246,0.5)',
  duration = 4,
}: BorderTrailProps) {
  return (
    <div className={clsx('relative overflow-hidden', className)}>
      {active && (
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-[inherit]"
          style={{
            background: `conic-gradient(from 0deg, transparent 0%, ${color} 10%, transparent 20%)`,
            mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            maskComposite: 'exclude',
            WebkitMaskComposite: 'xor',
            padding: '1px',
          }}
          animate={{ rotate: 360 }}
          transition={{
            duration,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      )}
      {children}
    </div>
  );
}
