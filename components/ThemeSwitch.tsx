import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sun, Moon, Star } from 'lucide-react';

interface ThemeSwitchProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

const ThemeSwitch: React.FC<ThemeSwitchProps> = ({ theme, onToggleTheme }) => {
  const isDark = theme === 'dark';

  return (
    <button
      onClick={onToggleTheme}
      className={`
        relative flex items-center h-9 w-16 rounded-full p-1 cursor-pointer 
        transition-all duration-500 overflow-hidden group
        ${isDark 
          ? 'bg-slate-900 border-slate-700 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]' 
          : 'bg-sky-400 border-sky-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]'}
        border
      `}
      aria-label="Toggle theme"
    >
      {/* Background Elements: Stars for Dark Mode */}
      <AnimatePresence>
        {isDark && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute inset-0 pointer-events-none"
          >
            <Star className="absolute top-1 left-3 w-1 h-1 text-white/40 fill-white/40" />
            <Star className="absolute top-4 left-6 w-0.5 h-0.5 text-white/20 fill-white/20" />
            <Star className="absolute top-2 left-8 w-1 h-1 text-white/30 fill-white/30" />
            <Star className="absolute top-5 left-2 w-0.5 h-0.5 text-white/50 fill-white/50" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Elements: Clouds for Light Mode */}
      <AnimatePresence>
        {!isDark && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="absolute inset-0 pointer-events-none"
          >
            <div className="absolute top-4 right-3 w-4 h-2 bg-white/40 rounded-full blur-[1px]" />
            <div className="absolute top-2 right-6 w-3 h-1.5 bg-white/60 rounded-full blur-[1px]" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* The Toggle Knob */}
      <motion.div
        className={`
          relative z-10 h-7 w-7 rounded-full flex items-center justify-center
          shadow-[0_2px_10px_rgba(0,0,0,0.2)] transition-colors duration-500
          ${isDark ? 'bg-slate-800' : 'bg-white'}
        `}
        animate={{
          x: isDark ? 28 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 25
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (
            <motion.div
              key="moon"
              initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <Moon className="w-4 h-4 text-blue-300" fill="currentColor" />
            </motion.div>
          ) : (
            <motion.div
              key="sun"
              initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <Sun className="w-4 h-4 text-amber-500" fill="currentColor" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      
      {/* Subtle Glow Effect */}
      <div className={`
        absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none
        ${isDark ? 'shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'shadow-[0_0_15px_rgba(245,158,11,0.2)]'}
      `} />
    </button>
  );
};

export default ThemeSwitch;
