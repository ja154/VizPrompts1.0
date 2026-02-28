import React, { useState, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import BlurryButton from './Button';
import { User, Palette, Cpu, Camera, Edit3, Check, Copy, Download, Loader2, AlertCircle, CheckCircle2, Moon, Sun } from 'lucide-react';
import { imageToDataUrl } from '../utils/video';
import { MEDIA_ANALYZER_SYSTEM_PROMPT } from '../services/geminiService';
import { motion, AnimatePresence } from 'motion/react';

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

    const tabs = [
        { id: 'account', icon: User, label: 'Account' },
        { id: 'appearance', icon: Palette, label: 'Appearance' },
        { id: 'general', icon: Cpu, label: 'Core Engine' }
    ];

    return (
        <div className="max-w-6xl mx-auto">
            <header className="mb-12">
                <h2 className="text-4xl font-bold font-heading uppercase tracking-tighter mb-2">Configurations</h2>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em]">Studio Workspace Settings</p>
            </header>
            
            <div className="flex flex-col lg:flex-row gap-12">
                {/* Sidebar Nav */}
                <aside className="w-full lg:w-64 flex-shrink-0">
                    <div className="glassmorphic-card rounded-[2rem] p-3 border-white/10">
                        <nav className="flex flex-col gap-2">
                            {tabs.map((tab) => (
                                <button 
                                    key={tab.id} 
                                    onClick={() => setActiveTab(tab.id as any)} 
                                    className={`flex items-center gap-4 px-6 py-4 rounded-2xl text-left font-bold transition-all duration-300 group ${activeTab === tab.id ? 'bg-white text-background-dark shadow-xl' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}
                                >
                                    <tab.icon size={18} className={activeTab === tab.id ? 'text-background-dark' : 'text-slate-400 group-hover:text-slate-200'} />
                                    <span className="text-[10px] uppercase tracking-widest">{tab.label}</span>
                                </button>
                            ))}
                        </nav>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1">
                    <motion.div 
                        key={activeTab}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="glassmorphic-card rounded-[2.5rem] p-12 border border-white/10"
                    >
                        <AnimatePresence mode="wait">
                            {message && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className={`mb-8 px-6 py-4 rounded-2xl text-xs font-medium text-center flex items-center justify-center gap-3 ${message.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'}`}
                                >
                                    {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                                    {message.text}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {activeTab === 'account' && (
                            <form onSubmit={handleSaveProfile} className="space-y-12">
                                <div className="flex flex-col sm:flex-row items-center gap-8">
                                    <div className="relative group size-32 rounded-[2rem] overflow-hidden bg-white/5 border-2 border-white/10 shadow-2xl">
                                        {profilePicture ? (
                                            <img src={profilePicture} alt="Avatar" className="size-full object-cover" />
                                        ) : (
                                            <div className="size-full flex items-center justify-center">
                                                <User size={48} className="text-slate-700" />
                                            </div>
                                        )}
                                        <div 
                                            onClick={() => fileInputRef.current?.click()} 
                                            className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-all duration-300 backdrop-blur-sm"
                                        >
                                            <Camera className="text-white mb-2" size={24} />
                                            <span className="text-[10px] text-white font-bold uppercase tracking-widest">Change</span>
                                        </div>
                                    </div>
                                    <div className="text-center sm:text-left">
                                        <h4 className="text-xl font-bold mb-2">Studio Identity</h4>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-4">Your visual presence in the workspace.</p>
                                        <BlurryButton type="button" onClick={() => fileInputRef.current?.click()} className="!py-2 !px-6">
                                            <Edit3 size={14} />
                                            <span>Upload Avatar</span>
                                        </BlurryButton>
                                    </div>
                                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={async e => e.target.files?.[0] && setProfilePicture(await imageToDataUrl(e.target.files[0]))} />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">Display Name</label>
                                        <input 
                                            type="text" 
                                            value={fullName} 
                                            onChange={e => setFullName(e.target.value)} 
                                            className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-4 focus:border-white/20 outline-none text-sm font-medium transition-all" 
                                            placeholder="Full Name" 
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 px-1">Studio Username</label>
                                        <input 
                                            type="text" 
                                            value={currentUser.username} 
                                            disabled 
                                            className="w-full bg-black/20 border border-white/5 rounded-2xl px-6 py-4 opacity-50 cursor-not-allowed text-sm font-medium text-slate-500" 
                                        />
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <BlurryButton type="submit" disabled={isLoading} className="w-full sm:w-auto px-12">
                                        {isLoading ? <Loader2 className="animate-spin" size={18} /> : <><Check size={18} /><span>Save Changes</span></>}
                                    </BlurryButton>
                                </div>
                            </form>
                        )}

                        {activeTab === 'appearance' && (
                            <div className="space-y-8">
                                <div className="flex items-center justify-between bg-white/5 p-8 rounded-[2.5rem] border border-white/5">
                                    <div className="flex items-center gap-6">
                                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                            {theme === 'dark' ? <Moon className="text-white" /> : <Sun className="text-slate-400" />}
                                        </div>
                                        <div>
                                            <p className="text-lg font-bold mb-1">Midnight Interface</p>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">High-contrast dark mode for focused creativity.</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={onToggleTheme} 
                                        className={`relative inline-flex h-10 w-20 rounded-full transition-all duration-500 p-1.5 ${theme === 'dark' ? 'bg-white' : 'bg-slate-700'}`}
                                    >
                                        <span className={`inline-block size-7 transform rounded-full shadow-xl transition-all duration-500 ${theme === 'dark' ? 'translate-x-10 bg-background-dark' : 'translate-x-0 bg-white'}`} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'general' && (
                            <div className="space-y-12">
                                <div className="space-y-8">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-2xl font-bold mb-1">Visual Synthesis Core</h4>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">This logic powers the Gemini intelligence.</p>
                                        </div>
                                        <div className="flex gap-4">
                                            <button 
                                                onClick={handleCopyPrompt} 
                                                className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all group"
                                                title="Copy to Clipboard"
                                            >
                                                {isPromptCopied ? <Check size={20} className="text-emerald-400" /> : <Copy size={20} className="text-slate-400 group-hover:text-white" />}
                                            </button>
                                            <button 
                                                onClick={handleDownloadPrompt} 
                                                className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all group"
                                                title="Download as File"
                                            >
                                                <Download size={20} className="text-slate-400 group-hover:text-white" />
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-black/40 rounded-[2rem] p-8 font-mono text-[11px] leading-relaxed text-slate-500 overflow-hidden max-h-64 relative group border border-white/5 shadow-inner">
                                        <pre className="whitespace-pre-wrap">{MEDIA_ANALYZER_SYSTEM_PROMPT}</pre>
                                        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background-dark to-transparent"></div>
                                        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                                    </div>
                                    
                                    <div className="bg-white/5 p-6 rounded-2xl border border-white/5 flex gap-4 items-start">
                                        <AlertCircle className="text-slate-600 flex-shrink-0" size={18} />
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                                            Advanced: This system prompt can be used in your own custom LLM workflows to replicate the visual analysis logic.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </main>
            </div>
        </div>
    );
};

export default SettingsPage;