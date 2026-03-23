

import React from 'react';
import { PromptHistoryItem } from '../types';
import { History, Clock, FileText, ChevronRight, Film } from 'lucide-react';
import { motion } from 'motion/react';

interface HistoryPageProps {
    history: PromptHistoryItem[];
    onSelectHistoryItem: (item: PromptHistoryItem) => void;
}

const HistoryPage: React.FC<HistoryPageProps> = ({ history, onSelectHistoryItem }) => (
    <div className="max-w-6xl mx-auto">
        <header className="text-center mb-12">
            <h2 className="text-4xl font-bold font-heading uppercase tracking-tighter mb-2 text-slate-900 dark:text-white">Chronicles</h2>
            <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em]">Your Visual Engineering History</p>
        </header>

        {history.length === 0 ? (
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-24 glassmorphic-card rounded-[3rem] border border-black/5 dark:border-white/5"
            >
                <div className="w-20 h-20 mx-auto rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex items-center justify-center mb-6">
                    <History className="w-10 h-10 text-slate-400 dark:text-slate-600" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">No History Yet</h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest">
                    Your generated prompts will appear here.
                </p>
            </motion.div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {history.map((item, index) => (
                    <motion.div 
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="group glassmorphic-card rounded-[2.5rem] overflow-hidden border border-black/5 dark:border-white/5 hover:border-black/20 dark:hover:border-white/20 transition-all duration-500"
                    >
                        <button
                          onClick={() => onSelectHistoryItem(item)}
                          className="flex flex-col h-full w-full text-left"
                        >
                           <div className="relative overflow-hidden aspect-video">
                                <img 
                                    src={item.thumbnail} 
                                    alt="Thumbnail" 
                                    className="w-full h-full object-cover bg-black transition-transform duration-700 ease-out group-hover:scale-110" 
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>
                                <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                                    <Clock size={12} className="text-slate-400" />
                                    <span className="text-[10px] font-bold text-white uppercase tracking-widest">
                                        {new Date(item.timestamp).toLocaleDateString()}
                                    </span>
                                </div>
                                {item.isVideo && (
                                    <div className="absolute top-4 left-4 size-8 bg-black/60 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/10">
                                        <Film size={14} className="text-white" />
                                    </div>
                                )}
                           </div>
                           
                           <div className="p-8 flex flex-col flex-grow">
                                <div className="flex items-start gap-3 mb-4">
                                    <FileText size={16} className="text-slate-400 dark:text-slate-600 mt-1 flex-shrink-0" />
                                    <p className="text-sm text-slate-700 dark:text-slate-300 font-medium line-clamp-3 leading-relaxed">
                                        {item.prompt}
                                    </p>
                                </div>
                                
                                <div className="mt-auto pt-6 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">View Details</span>
                                    <div className="size-8 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center group-hover:bg-background-dark dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-background-dark transition-all duration-300">
                                        <ChevronRight size={16} />
                                    </div>
                                </div>
                           </div>
                        </button>
                    </motion.div>
                ))}
            </div>
        )}
    </div>
);

export default HistoryPage;
