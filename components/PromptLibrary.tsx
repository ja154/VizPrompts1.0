import React, { useState } from 'react';
import { promptLibraryData, PromptCategory, PromptTemplate } from '../data/promptLibrary.ts';
import { remixPrompt } from '../services/geminiService.ts';
import { X, Wand2, Loader2, Library, ChevronRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PromptLibraryProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectPrompt: (prompt: PromptTemplate) => void;
}

const PromptLibrary: React.FC<PromptLibraryProps> = ({ isOpen, onClose, onSelectPrompt }) => {
    const [libraryData, setLibraryData] = useState<PromptCategory[]>(promptLibraryData);
    const [activeCategoryName, setActiveCategoryName] = useState<string>(promptLibraryData[0].name);
    const [remixingId, setRemixingId] = useState<string | null>(null);
    const [remixError, setRemixError] = useState<string>('');

    if (!isOpen) {
        return null;
    }

    const handleSelect = (prompt: PromptTemplate) => {
        onSelectPrompt(prompt);
        onClose();
    };

    const handleRemix = async (promptToRemix: PromptTemplate, categoryName: string) => {
        setRemixingId(promptToRemix.id);
        setRemixError('');

        try {
            const newPrompts = await remixPrompt(promptToRemix.prompt);

            const newTemplates: PromptTemplate[] = newPrompts.map((p, index) => ({
                id: `${promptToRemix.id}-remix-${Date.now()}-${index}`,
                title: `${promptToRemix.title} (Remix ${index + 1})`,
                prompt: p,
                structuredPrompt: {
                    ...promptToRemix.structuredPrompt,
                    core_focus: p,
                    objective: `A creative remix of: "${promptToRemix.structuredPrompt.objective}"`,
                },
            }));

            setLibraryData(currentData => {
                return currentData.map(category => {
                    if (category.name === categoryName) {
                        const promptIndex = category.prompts.findIndex(p => p.id === promptToRemix.id);
                        if (promptIndex !== -1) {
                            const newPromptsForCategory = [...category.prompts];
                            newPromptsForCategory.splice(promptIndex + 1, 0, ...newTemplates);
                            return { ...category, prompts: newPromptsForCategory };
                        }
                    }
                    return category;
                });
            });

        } catch (error: any) {
            console.error("Failed to remix prompt:", error);
            const msg = error?.message?.toUpperCase() || '';
            if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED')) {
                setRemixError('Studio quota exceeded. Please wait a moment and try again.');
            } else if (msg.includes('API KEY IS MISSING')) {
                setRemixError('Gemini API key is missing. Please configure it in Studio Settings.');
            } else {
                setRemixError(error instanceof Error ? error.message : "An unknown error occurred during remix.");
            }
        } finally {
            setRemixingId(null);
        }
    };

    const activeCategory = libraryData.find(cat => cat.name === activeCategoryName) || libraryData[0];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12">
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-md"
                onClick={onClose}
            />
            
            <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="glassmorphic-card rounded-[3rem] max-w-7xl w-full h-[85vh] shadow-2xl border border-white/10 relative flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="p-10 border-b border-white/5 flex justify-between items-center flex-shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                            <Library className="text-slate-400" size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold font-heading uppercase tracking-tighter">Archives</h2>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">The Prompt Engineering Library</p>
                        </div>
                    </div>
                    <button onClick={onClose} disabled={!!remixingId} className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all disabled:opacity-50">
                        <X size={20} />
                    </button>
                </header>

                <AnimatePresence>
                    {remixError && (
                        <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="bg-rose-500/10 text-rose-400 px-10 py-4 text-xs font-bold uppercase tracking-widest border-b border-rose-500/10"
                        >
                            {remixError}
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="flex flex-col md:flex-row flex-grow overflow-hidden">
                    {/* Sidebar for categories */}
                    <aside className="w-full md:w-72 border-b md:border-b-0 md:border-r border-white/5 p-6 overflow-y-auto flex-shrink-0">
                        <nav className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 scrollbar-none">
                            {libraryData.map(category => {
                                const Icon = category.icon;
                                return (
                                    <button
                                        key={category.name}
                                        onClick={() => setActiveCategoryName(category.name)}
                                        disabled={!!remixingId}
                                        className={`w-full text-left px-5 py-4 rounded-2xl font-bold flex items-center transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 md:flex-shrink group ${
                                            activeCategory.name === category.name 
                                                ? 'bg-white text-background-dark shadow-xl' 
                                                : 'text-slate-300 hover:bg-white/10 hover:text-white'
                                        }`}
                                    >
                                        <Icon size={18} className={activeCategory.name === category.name ? 'text-background-dark' : 'text-slate-400 group-hover:text-slate-200'} />
                                        <span className="ml-4 text-[10px] uppercase tracking-widest truncate">{category.name}</span>
                                    </button>
                                );
                            })}
                        </nav>
                    </aside>

                    {/* Main content for prompts */}
                    <main className="flex-1 p-10 overflow-y-auto scrollbar-thin">
                        <div className="flex items-center justify-between mb-10">
                            <h3 className="text-xl font-bold">{activeCategory.name}</h3>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{activeCategory.prompts.length} Blueprints</span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {activeCategory.prompts.map((prompt, index) => (
                                <motion.div 
                                    key={prompt.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.03 }}
                                    className="group glassmorphic-card rounded-3xl p-8 border border-white/5 flex flex-col justify-between hover:border-white/20 transition-all duration-300"
                                >
                                    <div>
                                        <h4 className="font-bold mb-4 text-white group-hover:text-primary transition-colors">{prompt.title}</h4>
                                        <p className="text-xs text-slate-400 font-medium line-clamp-4 leading-relaxed">
                                            {prompt.prompt}
                                        </p>
                                    </div>
                                    <div className="mt-8 flex items-center justify-end gap-3">
                                         <button 
                                            onClick={() => handleRemix(prompt, activeCategory.name)}
                                            disabled={!!remixingId}
                                            title="Creative Remix"
                                            className="p-3 rounded-xl bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white transition-all disabled:opacity-50"
                                        >
                                            {remixingId === prompt.id ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                                        </button>
                                        <button 
                                            onClick={() => handleSelect(prompt)}
                                            disabled={!!remixingId}
                                            className="px-6 py-3 rounded-xl bg-white text-background-dark font-bold uppercase tracking-widest text-[10px] hover:bg-slate-200 transition-all flex items-center gap-2 shadow-lg active:scale-95"
                                        >
                                            <span>Use</span>
                                            <ChevronRight size={14} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </main>
                </div>
            </motion.div>
        </div>
    );
};

export default PromptLibrary;
