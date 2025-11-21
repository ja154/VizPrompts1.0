
import React, { useState, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import GlowCard from './GlowCard';
import BlurryButton from './Button';
import { UserIcon } from './icons';
import { imageToDataUrl } from '../utils/video';

interface SettingsPageProps {
    theme: 'light' | 'dark';
    onToggleTheme: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ theme, onToggleTheme }) => {
    const { currentUser, updateUser } = useAuth();
    const [activeTab, setActiveTab] = useState<'account' | 'appearance' | 'general'>('account');
    
    // Account State
    const [fullName, setFullName] = useState(currentUser?.fullName || '');
    const [profilePicture, setProfilePicture] = useState(currentUser?.profilePicture);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!currentUser) return null;

    const handlePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            try {
                const dataUrl = await imageToDataUrl(e.target.files[0]);
                setProfilePicture(dataUrl);
            } catch (err) {
                setMessage({ type: 'error', text: 'Failed to process image.' });
            }
        }
    };

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);
        try {
            await updateUser({ fullName, profilePicture });
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (err) {
            setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to update profile.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section className="max-w-4xl mx-auto animate-fade-in-slide-up">
            <h2 className="text-3xl font-bold text-center mb-8">
                <span className="title-glow-subtle bg-gradient-to-r from-gray-700 to-gray-900 dark:from-stone-100 dark:to-stone-300 bg-clip-text text-transparent">Settings</span>
            </h2>
            
            <div className="flex flex-col md:flex-row gap-6">
                {/* Sidebar Tabs */}
                <div className="w-full md:w-64 flex-shrink-0">
                    <GlowCard className="bg-bg-secondary-light dark:bg-bg-secondary-dark rounded-2xl p-1 shadow-lg border border-border-primary-light dark:border-border-primary-dark h-full">
                        <nav className="flex flex-col p-4 gap-2">
                            <button onClick={() => setActiveTab('account')} className={`px-4 py-3 rounded-lg text-left font-medium transition-colors ${activeTab === 'account' ? 'bg-primary/10 text-primary' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5'}`}>
                                Account
                            </button>
                            <button onClick={() => setActiveTab('appearance')} className={`px-4 py-3 rounded-lg text-left font-medium transition-colors ${activeTab === 'appearance' ? 'bg-primary/10 text-primary' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5'}`}>
                                Appearance
                            </button>
                             <button onClick={() => setActiveTab('general')} className={`px-4 py-3 rounded-lg text-left font-medium transition-colors ${activeTab === 'general' ? 'bg-primary/10 text-primary' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5'}`}>
                                General
                            </button>
                        </nav>
                    </GlowCard>
                </div>

                {/* Content Area */}
                <div className="flex-1">
                    <GlowCard className="bg-bg-secondary-light dark:bg-bg-secondary-dark rounded-2xl p-1 shadow-lg border border-border-primary-light dark:border-border-primary-dark h-full">
                        <div className="p-6 sm:p-8">
                            {activeTab === 'account' && (
                                <form onSubmit={handleSaveProfile} className="space-y-6">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Profile Settings</h3>
                                    
                                    <div className="flex items-center gap-6">
                                        <div className="relative group">
                                            <div className="w-20 h-20 rounded-full overflow-hidden ring-2 ring-gray-200 dark:ring-gray-700">
                                                <UserIcon className="w-full h-full" imgSrc={profilePicture} />
                                            </div>
                                            <div onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full">
                                                <span className="material-symbols-outlined text-white">edit</span>
                                            </div>
                                            <input type="file" ref={fileInputRef} onChange={handlePictureUpload} className="hidden" accept="image/*" />
                                        </div>
                                        <div>
                                            <button type="button" onClick={() => fileInputRef.current?.click()} className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
                                                Change Picture
                                            </button>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">JPG, PNG or GIF. Max 5MB.</p>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                                        <input 
                                            type="text" 
                                            value={fullName} 
                                            onChange={(e) => setFullName(e.target.value)}
                                            className="w-full px-4 py-2 rounded-lg bg-bg-uploader-light dark:bg-bg-uploader-dark border border-border-primary-light dark:border-border-primary-dark focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-gray-900 dark:text-white"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Username</label>
                                        <input 
                                            type="text" 
                                            value={currentUser.username} 
                                            disabled 
                                            className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-white/5 border border-transparent text-gray-500 cursor-not-allowed"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                                        <input 
                                            type="email" 
                                            value={currentUser.email} 
                                            disabled 
                                            className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-white/5 border border-transparent text-gray-500 cursor-not-allowed"
                                        />
                                    </div>

                                    {message && (
                                        <div className={`p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'}`}>
                                            {message.text}
                                        </div>
                                    )}

                                    <div className="pt-4">
                                        <BlurryButton type="submit" disabled={isLoading}>
                                            {isLoading ? 'Saving...' : 'Save Changes'}
                                        </BlurryButton>
                                    </div>
                                </form>
                            )}

                            {activeTab === 'appearance' && (
                                <div className="space-y-6">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Appearance</h3>
                                    <div className="flex items-center justify-between p-4 rounded-lg bg-bg-uploader-light dark:bg-bg-uploader-dark border border-border-primary-light dark:border-border-primary-dark">
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">Theme Preference</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Switch between light and dark mode</p>
                                        </div>
                                        {/* Custom toggle UI reusing the logic passed from App */}
                                        <button 
                                            onClick={onToggleTheme}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${theme === 'dark' ? 'bg-primary' : 'bg-gray-300'}`}
                                        >
                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`} />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'general' && (
                                <div className="space-y-6">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">General Preferences</h3>
                                    <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800/30 text-yellow-700 dark:text-yellow-400 text-sm">
                                        Global application settings coming soon.
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
