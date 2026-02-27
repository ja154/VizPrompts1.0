import React, { useState, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import BlurryButton from './Button';
import { User, Camera, Mail, AtSign, Calendar, Loader2, Check, X, Edit3 } from 'lucide-react';
import { imageToDataUrl } from '../utils/video';
import { motion, AnimatePresence } from 'motion/react';

const ProfilePage: React.FC = () => {
    const { currentUser, updateUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [fullName, setFullName] = useState(currentUser?.fullName || '');
    const [profilePicture, setProfilePicture] = useState(currentUser?.profilePicture);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!currentUser) {
        return (
            <div className="max-w-2xl mx-auto text-center py-20">
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Please log in to view your profile.</p>
            </div>
        );
    }
    
    const handlePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            try {
                const dataUrl = await imageToDataUrl(file);
                setProfilePicture(dataUrl);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to process image.');
            }
        }
    };

    const handleSaveChanges = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsLoading(true);
        try {
            await updateUser({ fullName, profilePicture });
            setSuccess('Profile updated successfully!');
            setTimeout(() => {
                setIsEditing(false);
                setSuccess('');
            }, 1500)
        } catch(err) {
            setError(err instanceof Error ? err.message : 'Failed to update profile.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setFullName(currentUser.fullName);
        setProfilePicture(currentUser.profilePicture);
        setError('');
        setSuccess('');
    }

    return (
        <div className="max-w-2xl mx-auto">
            <header className="text-center mb-12">
                <h2 className="text-4xl font-bold font-heading uppercase tracking-tighter mb-2">Identity</h2>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em]">User Profile Management</p>
            </header>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glassmorphic-card rounded-[2.5rem] p-12 border border-white/10"
            >
                <AnimatePresence mode="wait">
                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-8 bg-rose-500/10 border border-rose-500/20 text-rose-400 px-6 py-4 rounded-2xl text-xs font-medium text-center"
                        >
                            {error}
                        </motion.div>
                    )}
                    {success && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-8 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-6 py-4 rounded-2xl text-xs font-medium text-center"
                        >
                            {success}
                        </motion.div>
                    )}
                </AnimatePresence>

                {!isEditing ? (
                    <div className="flex flex-col items-center text-center">
                        <div className="relative mb-8">
                            <div className="w-32 h-32 rounded-full bg-white/5 border-2 border-white/10 flex items-center justify-center overflow-hidden shadow-2xl">
                                {currentUser.profilePicture ? (
                                    <img src={currentUser.profilePicture} alt={currentUser.fullName} className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-16 h-16 text-slate-600" />
                                )}
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-white text-background-dark p-2 rounded-full shadow-lg">
                                <Check size={16} />
                            </div>
                        </div>
                        
                        <h3 className="text-2xl font-bold mb-1">{currentUser.fullName}</h3>
                        <p className="text-slate-400 text-sm font-medium mb-8 flex items-center gap-2">
                            <AtSign size={14} className="text-slate-600" />
                            {currentUser.username}
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mb-12">
                            <div className="bg-white/5 p-6 rounded-3xl border border-white/5 text-left">
                                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-2 flex items-center gap-2">
                                    <Mail size={12} /> Email
                                </p>
                                <p className="text-sm font-medium">{currentUser.email}</p>
                            </div>
                            <div className="bg-white/5 p-6 rounded-3xl border border-white/5 text-left">
                                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-2 flex items-center gap-2">
                                    <Calendar size={12} /> Joined
                                </p>
                                <p className="text-sm font-medium">{new Date(currentUser.createdAt).toLocaleDateString()}</p>
                            </div>
                        </div>

                        <BlurryButton onClick={() => setIsEditing(true)} className="px-12">
                            <Edit3 size={18} />
                            <span>Edit Profile</span>
                        </BlurryButton>
                    </div>
                ) : (
                    <form onSubmit={handleSaveChanges} className="space-y-8">
                        <div className="flex flex-col items-center">
                            <div 
                                className="relative group cursor-pointer"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <div className="w-32 h-32 rounded-full bg-white/5 border-2 border-dashed border-white/20 flex items-center justify-center overflow-hidden transition-all group-hover:border-white/40">
                                    {profilePicture ? (
                                        <img src={profilePicture} alt="Preview" className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                                    ) : (
                                        <Camera className="w-10 h-10 text-slate-600 group-hover:text-slate-400 transition-colors" />
                                    )}
                                </div>
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="bg-white/10 backdrop-blur-md p-2 rounded-full border border-white/20">
                                        <Camera size={20} />
                                    </div>
                                </div>
                            </div>
                            <input type="file" ref={fileInputRef} onChange={handlePictureUpload} className="hidden" accept="image/*" />
                            <p className="mt-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tap to change avatar</p>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Full Name</label>
                                <input 
                                    type="text" 
                                    value={fullName} 
                                    onChange={e => setFullName(e.target.value)} 
                                    className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/5 focus:border-white/20 outline-none transition-all text-white text-sm font-medium" 
                                    required 
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Username</label>
                                    <input 
                                        type="text" 
                                        value={currentUser.username} 
                                        className="w-full px-6 py-4 rounded-2xl bg-black/20 border border-white/5 text-slate-500 text-sm font-medium cursor-not-allowed" 
                                        disabled 
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Email</label>
                                    <input 
                                        type="email" 
                                        value={currentUser.email} 
                                        className="w-full px-6 py-4 rounded-2xl bg-black/20 border border-white/5 text-slate-500 text-sm font-medium cursor-not-allowed" 
                                        disabled 
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <BlurryButton type="submit" className="flex-1" disabled={isLoading}>
                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Check size={18} /><span>Save Changes</span></>}
                            </BlurryButton>
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="flex-1 py-4 px-6 rounded-2xl bg-white/5 border border-white/5 text-white font-bold uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                                disabled={isLoading}
                            >
                                <X size={16} />
                                Cancel
                            </button>
                        </div>
                    </form>
                )}
            </motion.div>
        </div>
    );
};

export default ProfilePage;
