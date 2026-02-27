
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import BlurryButton from './Button';
import { Loader2, User, Mail, Lock, UserPlus, LogIn, Sparkles } from 'lucide-react';
import AnimatedAppName from './AnimatedAppName';
import PatternBackground from './PatternBackground';
import { motion, AnimatePresence } from 'motion/react';

interface LoginPageProps {
    onGuestAccess: () => void;
}

declare global {
    interface Window {
        google?: any;
    }
}

const LoginPage: React.FC<LoginPageProps> = ({ onGuestAccess }) => {
    const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    // Form fields
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [fullName, setFullName] = useState('');

    const { login, signup, loginWithGoogle } = useAuth();
    const googleButtonRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Initialize Google Sign-In
        if (activeTab === 'login' && window.google) {
            try {
                setTimeout(() => {
                     if (googleButtonRef.current) {
                        window.google.accounts.id.initialize({
                            client_id: document.querySelector('meta[name="google-client-id"]')?.getAttribute('content') || '',
                            callback: handleGoogleCredentialResponse,
                        });
                        googleButtonRef.current.innerHTML = ''; 
                        window.google.accounts.id.renderButton(
                            googleButtonRef.current,
                            { theme: "outline", size: "large", width: "380" }
                        );
                    }
                }, 100);
            } catch (err) {
                console.error("Google Sign-In initialization error:", err);
            }
        }
    }, [activeTab]);

    const handleGoogleCredentialResponse = async (response: any) => {
        setIsLoading(true);
        setError('');
        try {
            await loginWithGoogle(response.credential);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred during sign-in.');
            setIsLoading(false);
        }
    };

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            await login(email, password);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
            setIsLoading(false);
        }
    };

    const handleEmailSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            await signup({ username, email, fullName, password });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#31326f]">
            <PatternBackground />
            
            <div className="min-h-full w-full flex flex-col items-center justify-center p-4 py-12 relative z-10">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="w-full max-w-md bg-white/5 backdrop-blur-3xl rounded-[2.5rem] shadow-2xl border border-white/10 overflow-hidden my-auto"
                >
                    {/* Header Section */}
                    <div className="pt-12 pb-8 flex flex-col items-center justify-center text-center px-8">
                         <div className="mb-6">
                            <AnimatedAppName />
                         </div>
                         <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em]">AI-Powered Visual Engineering</p>
                    </div>

                    {/* Tabs */}
                    <div className="flex p-2 bg-black/20 mx-8 rounded-2xl mb-8">
                        <button 
                            onClick={() => { setActiveTab('login'); setError(''); }}
                            className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${activeTab === 'login' ? 'bg-white text-[#31326f] shadow-lg' : 'text-slate-400 hover:text-white'}`}
                        >
                            <LogIn size={14} />
                            Sign In
                        </button>
                        <button 
                            onClick={() => { setActiveTab('signup'); setError(''); }}
                            className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${activeTab === 'signup' ? 'bg-white text-[#31326f] shadow-lg' : 'text-slate-400 hover:text-white'}`}
                        >
                            <UserPlus size={14} />
                            Join
                        </button>
                    </div>

                    {/* Content */}
                    <div className="px-8 pb-12">
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
                        </AnimatePresence>

                        {activeTab === 'login' ? (
                            <motion.div 
                                key="login"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div ref={googleButtonRef} className="w-full flex justify-center min-h-[40px] rounded-xl overflow-hidden"></div>
                                
                                <div className="relative flex items-center py-4">
                                    <div className="flex-grow border-t border-white/5"></div>
                                    <span className="flex-shrink mx-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Or email</span>
                                    <div className="flex-grow border-t border-white/5"></div>
                                </div>

                                <form onSubmit={handleEmailLogin} className="space-y-4">
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                        <input 
                                            type="text" 
                                            placeholder="Email or Username" 
                                            value={email} 
                                            onChange={e => setEmail(e.target.value)} 
                                            required 
                                            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/5 border border-white/5 focus:border-white/20 outline-none transition-all text-white placeholder:text-slate-600 text-sm"
                                        />
                                    </div>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                        <input 
                                            type="password" 
                                            placeholder="Password" 
                                            value={password} 
                                            onChange={e => setPassword(e.target.value)} 
                                            required 
                                            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/5 border border-white/5 focus:border-white/20 outline-none transition-all text-white placeholder:text-slate-600 text-sm"
                                        />
                                    </div>
                                    <BlurryButton type="submit" className="w-full" disabled={isLoading}>
                                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
                                    </BlurryButton>
                                </form>
                            </motion.div>
                        ) : (
                            <motion.form 
                                key="signup"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                onSubmit={handleEmailSignup} 
                                className="space-y-4"
                            >
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                    <input 
                                        type="text" 
                                        placeholder="Full Name" 
                                        value={fullName} 
                                        onChange={e => setFullName(e.target.value)} 
                                        required 
                                        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/5 border border-white/5 focus:border-white/20 outline-none transition-all text-white placeholder:text-slate-600 text-sm"
                                    />
                                </div>
                                <div className="relative">
                                    <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                    <input 
                                        type="text" 
                                        placeholder="Username" 
                                        value={username} 
                                        onChange={e => setUsername(e.target.value)} 
                                        required 
                                        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/5 border border-white/5 focus:border-white/20 outline-none transition-all text-white placeholder:text-slate-600 text-sm"
                                    />
                                </div>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                    <input 
                                        type="email" 
                                        placeholder="Email Address" 
                                        value={email} 
                                        onChange={e => setEmail(e.target.value)} 
                                        required 
                                        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/5 border border-white/5 focus:border-white/20 outline-none transition-all text-white placeholder:text-slate-600 text-sm"
                                    />
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                    <input 
                                        type="password" 
                                        placeholder="Password (min 6 chars)" 
                                        value={password} 
                                        onChange={e => setPassword(e.target.value)} 
                                        required 
                                        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/5 border border-white/5 focus:border-white/20 outline-none transition-all text-white placeholder:text-slate-600 text-sm"
                                    />
                                </div>
                                <BlurryButton type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
                                </BlurryButton>
                            </motion.form>
                        )}

                        {/* Guest Access */}
                        <div className="mt-12 pt-8 border-t border-white/10 text-center">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-6">Just want to try it out?</p>
                            <button 
                                onClick={onGuestAccess}
                                type="button"
                                className="flex items-center justify-center w-full py-4 px-6 rounded-2xl bg-white/5 border border-white/5 text-white font-bold uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all"
                            >
                                <User className="w-4 h-4 mr-3 text-slate-400" />
                                Continue as Guest
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default LoginPage;
