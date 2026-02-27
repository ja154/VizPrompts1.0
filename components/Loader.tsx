
import React from 'react';
import { motion } from 'motion/react';
import { Loader2 } from 'lucide-react';

interface LoaderProps {
    message: string;
}

const Loader: React.FC<LoaderProps> = ({ message }) => {
    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center p-12 glassmorphic-card rounded-[2.5rem] border border-white/10"
        >
            <div className="relative">
                <Loader2 className="w-16 h-16 text-white animate-spin opacity-20" />
                <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 flex items-center justify-center"
                >
                    <div className="w-2 h-2 bg-indigo-500 rounded-full -translate-y-8 shadow-[0_0_15px_rgba(99,102,241,0.8)]"></div>
                </motion.div>
            </div>
            <p className="mt-8 text-xs font-bold text-slate-400 uppercase tracking-[0.3em] text-center max-w-[200px] leading-relaxed">
                {message}
            </p>
        </motion.div>
    );
};

export default Loader;