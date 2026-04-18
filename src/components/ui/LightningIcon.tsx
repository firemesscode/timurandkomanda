import React from 'react';
import { Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

interface LightningIconProps {
  className?: string;
  size?: number;
}

export const LightningIcon: React.FC<LightningIconProps> = ({ className, size = 16 }) => {
  return (
    <motion.div
      animate={{ 
        scale: [1, 1.15, 1],
        opacity: [0.8, 1, 0.8],
        filter: [
          'drop-shadow(0px 0px 2px currentColor)', 
          'drop-shadow(0px 0px 8px currentColor)', 
          'drop-shadow(0px 0px 2px currentColor)'
        ]
      }}
      transition={{ 
        duration: 1.5, 
        repeat: Infinity,
        ease: "easeInOut" 
      }}
      className={cn("inline-flex items-center justify-center text-red-600", className)}
    >
      <Zap size={size} fill="currentColor" strokeWidth={1} />
    </motion.div>
  );
};
