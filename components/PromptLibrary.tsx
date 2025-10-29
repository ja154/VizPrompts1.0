import React, { useState } from 'react';
import { promptLibraryData, PromptCategory, PromptTemplate } from '../data/promptLibrary.ts';
import { remixPrompt } from '../services/geminiService.ts';

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

        } catch (error) {
            console.error("Failed to remix prompt:", error);
            setRemixError(error instanceof Error ? error.message : "An unknown error occurred during remix.");
        } finally {
            setRemixingId(null);
        }
    };

    const activeCategory = libraryData.find(cat => cat.name === activeCategoryName) || libraryData[0];

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in-slide-up" 
            style={{ animationDuration: '300ms' }}
            onClick={onClose}
        >
            <div 
                className="bg-bg-secondary-light dark:bg-bg-secondary-dark rounded-2xl max-w-6xl w-full h-[90vh] md:h-[80vh] shadow-2xl border border-border-primary-light dark:border-border-primary-dark relative animate-scale-in flex flex-col overflow-hidden"
                style={{ animationDuration: '400ms' }}
                onClick={(e) => e.stopPropagation()}
            >
                <header className="p-6 border-b border-border-primary-light dark:border-border-primary-dark flex justify-between items-center flex-shrink-0">
                    <h2 className="text-2xl font-bold">Prompt Library</h2>
                    <button onClick={onClose} disabled={!!remixingId} className="text-text-secondary-light dark:text-text-secondary-dark hover:text-red-500 transition-colors w-8 h-8 rounded-full bg-transparent hover:bg-black/10 dark:hover:bg-white/10 flex items-center justify-center z-10 disabled:opacity-50">
                        {/* FIX: Replaced <i> with <span> for Font Awesome icon */}
                        <span className="fas fa-times"></span>
                    </button>
                </header>

                {remixError && <div className="p-4 bg-red-500/10 text-red-500 text-center text-sm">{remixError}</div>}

                <div className="flex flex-col md:flex-row flex-grow overflow-hidden">
                    {/* Sidebar for categories */}
                    <aside className="w-full md:w-1/3 lg:w-1/4 border-b md:border-b-0 md:border-r border-border-primary-light dark:border-border-primary-dark p-4 overflow-y-auto flex-shrink-0">
                        <nav className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0">
                            {libraryData.map(category => {
                                const Icon = category.icon;
                                return (
                                    <button
                                        key={category.name}
                                        onClick={() => setActiveCategoryName(category.name)}
                                        disabled={!!remixingId}
                                        className={`w-full text-left px-3 py-2.5 rounded-lg font-semibold flex items-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 md:flex-shrink ${
                                            activeCategory.name === category.name 
                                                ? 'bg-purple-600/10 dark:bg-purple-400/20 text-purple-700 dark:text-purple-300' 
                                                : 'hover:bg-gray-500/10'
                                        }`}
                                    >
                                        <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                                        <span className="truncate">{category.name}</span>
                                    </button>
                                );
                            })}
                        </nav>
                    </aside>

                    {/* Main content for prompts */}
                    <main className="w-full md:w-2/3 lg:w-3/4 p-6 overflow-y-auto">
                        <h3 className="text-xl font-bold mb-6 text-text-primary-light dark:text-text-primary-dark">{activeCategory.name}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {activeCategory.prompts.map(prompt => (
                                <div key={prompt.id} className="group bg-bg-uploader-light dark:bg-bg-uploader-dark p-4 rounded-lg border border-border-primary-light dark:border-border-primary-dark flex flex-col justify-between hover:border-purple-500 dark:hover:border-purple-400 transition-colors duration-200">
                                    <div>
                                        <h4 className="font-bold mb-2">{prompt.title}</h4>
                                        <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark line-clamp-3">
                                            {prompt.prompt}
                                        </p>
                                    </div>
                                    <div className="mt-4 flex items-center justify-end gap-2">
                                         <button 
                                            onClick={() => handleRemix(prompt, activeCategory.name)}
                                            disabled={!!remixingId}
                                            className="px-3 py-2 text-sm font-semibold rounded-lg bg-gray-500/10 text-text-secondary-light dark:text-text-secondary-dark hover:bg-gray-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-wait"
                                        >
                                            {/* FIX: Replaced <i> with <span> for Font Awesome icon */}
                                            {remixingId === prompt.id ? <span className="fas fa-spinner fa-spin"></span> : <span className="fas fa-random"></span>}
                                        </button>
                                        <button 
                                            onClick={() => handleSelect(prompt)}
                                            disabled={!!remixingId}
                                            className="px-4 py-2 text-sm font-semibold rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-all duration-200 transform group-hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Use
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default PromptLibrary;
