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
        try {
            await updateUser({ fullName, profilePicture });
            setMessage({ type: 'success', text: 'Profile updated!' });
        } catch (err) {
            setMessage({ type: 'error', text: 'Update failed.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownloadPrompt = () => {
        const blob = new Blob([MEDIA_ANALYZER_SYSTEM_PROMPT], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'vizprompts_system_prompt.txt';
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleCopyPrompt = () => {
        navigator.clipboard.writeText(MEDIA_ANALYZER_SYSTEM_PROMPT);
        setIsPromptCopied(true);
        setTimeout(() => setIsPromptCopied(false), 2000);
    };

    return (
        <section className="max-w-4xl mx-auto animate-fade-in-slide-up">
            <h2 className="text-3xl font-black text-center mb-8 text-gray-900 dark:text-white">Settings</h2>
            
            <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-64 flex-shrink-0">
                    <GlowCard className="bg-white/60 dark:bg-black/20 rounded-2xl p-1 shadow-xl border border-black/5 dark:border-white/5">
                        <nav className="flex flex-col p-4 gap-2">
                            {['account', 'appearance', 'general'].map((tab) => (
                                <button key={tab} onClick={() => setActiveTab(tab as any)} className={`px-4 py-3 rounded-xl text-left font-bold capitalize transition-all ${activeTab === tab ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'text-gray-500 hover:bg-black/5 dark:hover:bg-white/5'}`}>
                                    {tab}
                                </button>
                            ))}
                        </nav>
                    </GlowCard>
                </div>

                <div className="flex-1">
                    <GlowCard className="bg-white/60 dark:bg-black/20 rounded-2xl p-1 shadow-xl border border-black/5 dark:border-white/5">
                        <div className="p-8">
                            {activeTab === 'account' && (
                                <form onSubmit={handleSaveProfile} className="space-y-6">
                                    <div className="flex items-center gap-6">
                                        <div className="relative group size-20 rounded-full overflow-hidden ring-4 ring-primary/20">
                                            <UserIcon className="size-full" imgSrc={profilePicture} />
                                            <div onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                                                <span className="material-symbols-outlined text-white">edit</span>
                                            </div>
                                        </div>
                                        <input type="file" ref={fileInputRef} className="hidden" onChange={async e => setProfilePicture(await imageToDataUrl(e.target.files![0]))} />
                                        <BlurryButton type="button" onClick={() => fileInputRef.current?.click()}>Change Avatar</BlurryButton>
                                    </div>
                                    <div className="space-y-4">
                                        <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="w-full bg-gray-100 dark:bg-white/5 border-0 rounded-xl p-3 focus:ring-2 focus:ring-primary" placeholder="Full Name" />
                                        <input type="text" value={currentUser.username} disabled className="w-full bg-gray-200/50 dark:bg-white/5 border-0 rounded-xl p-3 opacity-50" />
                                    </div>
                                    <BlurryButton type="submit" disabled={isLoading}>{isLoading ? 'Saving...' : 'Update Account'}</BlurryButton>
                                    {message && <p className={`text-sm font-bold ${message.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>{message.text}</p>}
                                </form>
                            )}

                            {activeTab === 'appearance' && (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between bg-gray-100 dark:bg-white/5 p-4 rounded-xl">
                                        <div>
                                            <p className="font-bold">Dark Mode</p>
                                            <p className="text-xs text-gray-500">Toggle visual interface</p>
                                        </div>
                                        <button onClick={onToggleTheme} className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${theme === 'dark' ? 'bg-primary' : 'bg-gray-300'}`}>
                                            <span className={`inline-block size-4 transform rounded-full bg-white transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`} />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'general' && (
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="font-bold">Core Prompt Engine</h4>
                                            <div className="flex gap-2">
                                                <button onClick={handleCopyPrompt} className="p-2 bg-black/5 dark:bg-white/5 rounded-lg hover:text-primary transition-colors">
                                                    {isPromptCopied ? <CheckIcon className="size-4" /> : <CopyIcon className="size-4" />}
                                                </button>
                                                <button onClick={handleDownloadPrompt} className="p-2 bg-black/5 dark:bg-white/5 rounded-lg hover:text-primary transition-colors">
                                                    <span className="material-symbols-outlined text-sm">download</span>
                                                </button>
                                            </div>
                                        </div>
                                        <div className="bg-gray-900 rounded-xl p-4 font-mono text-[10px] text-gray-400 overflow-hidden max-h-40 relative group">
                                            <pre className="whitespace-pre-wrap">{MEDIA_ANALYZER_SYSTEM_PROMPT}</pre>
                                            <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-gray-900 to-transparent"></div>
                                        </div>
                                        <p className="text-xs text-gray-500">This prompt governs how Gemini analyzes your media. You can download it for use in other LLMs.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </GlowCard>
                </div>
            </div>
        </section>
    );
};

export default SettingsPage;