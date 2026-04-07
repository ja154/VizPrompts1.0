
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, CheckCircle2, AlertCircle, Zap, Brain, Sparkles } from 'lucide-react';
import { AnalysisState } from '../types.ts';

interface AnalysisStatusProps {
    state: AnalysisState;
    message: string;
    progress: number;
    error?: string;
    onRetry?: () => void;
    onReset?: () => void;
    isCompact?: boolean;
}

const AnalysisStatus: React.FC<AnalysisStatusProps> = ({
    state,
    message,
    progress,
    error,
    onRetry,
    onReset,
    isCompact = false
}) => {
    const variants = {
        initial: { opacity: 0, scale: 0.95, y: 10 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.95, y: -10 }
    };

    if (isCompact) {
        const renderCompact = () => {
            switch (state) {
                case AnalysisState.SUCCESS:
                    return (
                        <motion.div 
                            key="compact-success"
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-center gap-3 text-emerald-500"
                        >
                            <CheckCircle2 size={20} />
                            <p className="text-sm font-bold uppercase tracking-widest">Intelligence successfully extracted</p>
                        </motion.div>
                    );
                case AnalysisState.ERROR:
                    return (
                        <motion.div 
                            key="compact-error"
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 flex items-center gap-3 text-rose-500"
                        >
                            <AlertCircle size={20} />
                            <p className="text-sm font-medium">{error || 'Analysis failed'}</p>
                        </motion.div>
                    );
                case AnalysisState.PROCESSING:
                    return (
                        <motion.div 
                            key="compact-processing"
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-primary/10 border border-primary/20 rounded-2xl p-4 space-y-3"
                        >
                            <div className="flex items-center gap-3 text-primary">
                                <Loader2 size={20} className="animate-spin" />
                                <p className="text-sm font-bold uppercase tracking-widest">{message || 'Processing...'}</p>
                            </div>
                            <div className="w-full bg-black/5 dark:bg-white/10 rounded-full h-1 overflow-hidden">
                                <motion.div 
                                    className="bg-primary h-full rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                />
                            </div>
                        </motion.div>
                    );
                default:
                    return null;
            }
        };

        return (
            <AnimatePresence mode="wait">
                {renderCompact()}
            </AnimatePresence>
        );
    }

    const renderContent = () => {
        switch (state) {
            case AnalysisState.IDLE:
                return (
                    <motion.div 
                        key="idle"
                        variants={variants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="p-10 rounded-[2.5rem] glassmorphic-card border-black/5 dark:border-white/5 text-center space-y-6"
                    >
                        <div className="size-16 mx-auto bg-black/5 dark:bg-white/5 rounded-full flex items-center justify-center text-slate-400">
                            <Zap size={32} />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-bold uppercase tracking-wider font-heading text-slate-900 dark:text-white">Ready for Intelligence</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Select a visual asset to begin the engineering process.</p>
                        </div>
                    </motion.div>
                );

            case AnalysisState.PROCESSING:
                return (
                    <motion.div 
                        key="processing"
                        variants={variants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="p-10 rounded-[2.5rem] glassmorphic-card border-primary/20 dark:border-primary/30 bg-primary/5 text-center space-y-8 relative overflow-hidden"
                    >
                        {/* Animated background glow */}
                        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent opacity-20 animate-pulse" />
                        
                        <div className="relative space-y-8">
                            <div className="relative size-20 mx-auto">
                                <Loader2 className="size-full text-primary animate-spin" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Brain className="size-8 text-primary/60" />
                                </div>
                            </div>
                            
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-bold uppercase tracking-widest font-heading text-slate-900 dark:text-white">
                                        Analyzing <span className="text-primary">Visuals</span>
                                    </h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-[0.2em] animate-pulse">
                                        {message || 'Initializing Studio Intelligence...'}
                                    </p>
                                </div>

                                <div className="space-y-3">
                                    <div className="w-full bg-black/5 dark:bg-white/10 rounded-full h-2 overflow-hidden p-[1px]">
                                        <motion.div 
                                            className="bg-primary h-full rounded-full shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progress}%` }}
                                            transition={{ type: 'spring', stiffness: 50, damping: 20 }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        <span>Progress</span>
                                        <span>{Math.round(progress)}%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                );

            case AnalysisState.SUCCESS:
                return (
                    <motion.div 
                        key="success"
                        variants={variants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="p-10 rounded-[2.5rem] glassmorphic-card border-emerald-500/20 dark:border-emerald-500/30 bg-emerald-500/5 text-center space-y-6"
                    >
                        <div className="size-16 mx-auto bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 shadow-lg shadow-emerald-500/20">
                            <CheckCircle2 size={32} />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-bold uppercase tracking-wider font-heading text-slate-900 dark:text-white">Analysis Complete</h3>
                            <p className="text-emerald-600/80 dark:text-emerald-400/80 text-sm font-bold uppercase tracking-widest">Intelligence successfully extracted</p>
                        </div>
                    </motion.div>
                );

            case AnalysisState.ERROR:
                return (
                    <motion.div 
                        key="error"
                        variants={variants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="p-10 rounded-[2.5rem] glassmorphic-card border-rose-500/20 dark:border-rose-500/30 bg-rose-500/5 text-center space-y-8"
                    >
                        <div className="size-16 mx-auto bg-rose-500/10 rounded-full flex items-center justify-center text-rose-500 shadow-lg shadow-rose-500/20">
                            <AlertCircle size={32} />
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-2xl font-bold uppercase tracking-wider font-heading text-slate-900 dark:text-white">Intelligence Failure</h3>
                            <div className="bg-rose-500/10 p-4 rounded-xl border border-rose-500/10">
                                <p className="text-rose-600 dark:text-rose-400 text-sm font-medium leading-relaxed">
                                    {error || 'Studio intelligence encountered an unexpected error during processing.'}
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-col gap-3 pt-2">
                            {onRetry && (
                                <button 
                                    onClick={onRetry}
                                    className="w-full py-4 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-bold uppercase tracking-widest text-sm transition-all shadow-lg shadow-rose-500/25 flex items-center justify-center gap-2"
                                >
                                    <Zap size={18} />
                                    Retry Analysis
                                </button>
                            )}
                            {onReset && (
                                <button 
                                    onClick={onReset}
                                    className="text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                                >
                                    Cancel & Start Over
                                </button>
                            )}
                        </div>
                    </motion.div>
                );

            default:
                return null;
        }
    };

    return (
        <AnimatePresence mode="wait">
            {renderContent()}
        </AnimatePresence>
    );
};

export default AnalysisStatus;
