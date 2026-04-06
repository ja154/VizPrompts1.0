import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface TooltipProps {
  text: string;
  children: React.ReactNode;
  isDisabled?: boolean;
}

const Tooltip: React.FC<TooltipProps> = ({ text, children, isDisabled = false }) => {
  const [isHovered, setIsHovered] = useState(false);

  if (isDisabled) return <>{children}</>;

  return (
    <div 
      className="relative flex items-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, x: 10, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute left-full ml-3 px-3 py-1.5 bg-background-dark dark:bg-white text-white dark:text-background-dark text-[10px] font-bold uppercase tracking-widest rounded-lg shadow-xl border border-white/10 dark:border-black/10 whitespace-nowrap z-[100] pointer-events-none"
          >
            {text}
            {/* Arrow */}
            <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-background-dark dark:bg-white border-l border-b border-white/10 dark:border-black/10 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Tooltip;
