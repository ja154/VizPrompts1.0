import React, { useState, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import GlowCard from './GlowCard';
import BlurryButton from './Button';
import { UserIcon, CopyIcon, CheckIcon } from './icons';
import { imageToDataUrl } from '../utils/video';
import { MEDIA_ANALYZER_SYSTEM_PROMPT } from '../services/geminiService';

interface SettingsPageProps {
    theme: 'light' | 'dark';
    onToggleTheme: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ theme, onToggleTheme }) => {
    const { currentUser, updateUser } = useAuth();
    const [activeTab, setActiveTab] = useState<'account' | 'appearance' | 'general'>('account');
    const [fullName, setFullName] = useState(currentUser?.fullName || '');
    const [profilePicture, setProfilePicture] = useState(currentUser?.profilePicture);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [isPromptCopied, setIsPromptCopied] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!currentUser) return null;

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);
        try {
            await updateUser({ fullName, profilePicture });
            setMessage({ type: 'success', text: 'Studio Profile updated successfully.' });
        } catch (err) {
            setMessage({ type: 'error', text: 'Critical failure during profile update.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownloadPrompt = () => {
        const blob = new Blob([MEDIA_ANALYZER_SYSTEM_PROMPT], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'vizprompts_core_engine.txt';
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleCopyPrompt = () => {
        navigator.clipboard.writeText(MEDIA_ANALYZER_SYSTEM_PROMPT);
        setIsPromptCopied(true);
        setTimeout(() => setIsPromptCopied(false), 2000);
    };

    return (
        <section className="max-w-5xl mx-auto animate-slide-up">
            <div className="mb-12">
                <h2 className="text-5xl font-black tracking-tighter text-slate-900 dark:text-white">Studio Settings</h2>
                <p className="text-slate-500 mt-2 font-medium">Configure your visual engineering workspace.</p>
            </div>
            
            <div className="flex flex-col md:flex-row gap-10">
                <div className="w-full md:w-72 flex-shrink-0">
                    <div className="glassmorphic-card rounded-3xl p-3 border-white/5 shadow-xl">
                        <nav className="flex flex-col p-2 gap-2">
                            {[
                                { id: 'account', icon: 'person', label: 'Account' },
                                { id: 'appearance', icon: 'palette', label: 'Appearance' },
                                { id: 'general', icon: 'bolt', label: 'Core Engine' }
                            ].map((tab) => (
                                <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex items-center gap-4 px-5 py-4 rounded-2xl text-left font-bold transition-all duration-300 ${activeTab === tab.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-500 hover:bg-white/5 hover:text-white'}`}>
                                    <span className="material-symbols-outlined text-xl">{tab.icon}</span>
                                    <span className="text-sm capitalize">{tab.label}</span>
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>

                <div className="flex-1">
                    <div className="glassmorphic-card rounded-[2.5rem] p-3 border-white/5 shadow-2xl">
                        <div className="p-10">
                            {activeTab === 'account' && (
                                <form onSubmit={handleSaveProfile} className="space-y-10">
                                    <div className="flex items-center gap-10">
                                        <div className="relative group size-28 rounded-3xl overflow-hidden ring-4 ring-primary/20 bg-slate-800 shadow-2xl">
                                            <UserIcon className="size-full object-cover" imgSrc={profilePicture} />
                                            <div onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-all duration-300 backdrop-blur-sm">
                                                <span className="material-symbols-outlined text-white text-3xl">edit_square</span>
                                                <span className="text-[10px] text-white font-black uppercase mt-1">Change</span>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <h4 className="text-xl font-black">Studio Identity</h4>
                                            <p className="text-xs text-slate-500 font-medium">Your avatar is displayed in shared prompt sessions.</p>
                                            <BlurryButton type="button" onClick={() => fileInputRef.current?.click()} className="!text-[10px] !py-1.5">Upload Custom Avatar</BlurryButton>
                                        </div>
                                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={async e => e.target.files?.[0] && setProfilePicture(await imageToDataUrl(e.target.files[0]))} />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-widest text-slate-500 px-1">Display Name</label>
                                            <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="w-full bg-slate-500/5 border-white/5 rounded-2xl p-4 focus:ring-2 focus:ring-primary outline-none text-sm font-bold transition-all" placeholder="Full Name" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-widest text-slate-500 px-1">Studio Username</label>
                                            <input type="text" value={currentUser.username} disabled className="w-full bg-slate-500/10 border-white/5 rounded-2xl p-4 opacity-50 cursor-not-allowed text-sm font-bold" />
                                        </div>
                                    </div>
                                    <div className="pt-4 flex flex-col items-start gap-4">
                                        <BlurryButton type="submit" disabled={isLoading} className="!p-5 !text-lg">{isLoading ? 'Synchronizing...' : 'Save Profile Changes'}</BlurryButton>
                                        {message && <p className={`text-sm font-bold flex items-center gap-2 ${message.type === 'success' ? 'text-green-500' : 'text-rose-500'}`}>
                                            <span className="material-symbols-outlined text-lg">{message.type === 'success' ? 'check_circle' : 'error'}</span>
                                            {message.text}
                                        </p>}
                                    </div>
                                </form>
                            )}

                            {activeTab === 'appearance' && (
                                <div className="space-y-8">
                                    <div className="flex items-center justify-between bg-slate-500/5 p-6 rounded-[2rem] border border-white/5">
                                        <div className="space-y-1">
                                            <p className="text-lg font-black">Midnight Interface</p>
                                            <p className="text-xs text-slate-500 font-medium italic">High-contrast dark mode for focused creativity.</p>
                                        </div>
                                        <button onClick={onToggleTheme} className={`relative inline-flex h-8 w-14 rounded-full transition-all duration-500 p-1 ${theme === 'dark' ? 'bg-primary' : 'bg-slate-300'}`}>
                                            <span className={`inline-block size-6 transform rounded-full bg-white shadow-xl transition-all duration-500 ${theme === 'dark' ? 'translate-x-6' : 'translate-x-0'}`} />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'general' && (
                                <div className="space-y-10">
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-1">
                                                <h4 className="text-2xl font-black">Visual Synthesis Core</h4>
                                                <p className="text-xs text-slate-500 font-medium">This logic powers the Gemini 3 intelligence.</p>
                                            </div>
                                            <div className="flex gap-3">
                                                <button onClick={handleCopyPrompt} className="size-12 bg-slate-500/10 dark:bg-white/5 rounded-2xl flex items-center justify-center hover:text-primary transition-all duration-300 hover:scale-110">
                                                    {isPromptCopied ? <CheckIcon className="size-5" /> : <CopyIcon className="size-5" />}
                                                </button>
                                                <button onClick={handleDownloadPrompt} className="size-12 bg-slate-500/10 dark:bg-white/5 rounded-2xl flex items-center justify-center hover:text-primary transition-all duration-300 hover:scale-110">
                                                    <span className="material-symbols-outlined text-xl">download</span>
                                                </button>
                                            </div>
                                        </div>
                                        <div className="bg-slate-900 rounded-[2rem] p-8 font-mono text-[11px] leading-relaxed text-slate-400 overflow-hidden max-h-56 relative group border border-white/5 shadow-inner">
                                            <pre className="whitespace-pre-wrap">{MEDIA_ANALYZER_SYSTEM_PROMPT}</pre>
                                            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent"></div>
                                            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                                        </div>
                                        <p className="text-xs text-slate-500 font-medium leading-relaxed italic">
                                            Advanced: This system prompt can be used in your own custom LLM workflows to replicate VizPrompts' visual analysis logic.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default SettingsPage;