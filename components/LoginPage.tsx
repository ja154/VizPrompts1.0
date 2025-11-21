
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import BlurryButton from './Button';
import { SpinnerIcon, UserIcon } from './icons';
import AnimatedAppName from './AnimatedAppName';
import PatternBackground from './PatternBackground';

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
                // Use a slight delay to ensure container is rendered
                setTimeout(() => {
                     if (googleButtonRef.current) {
                        window.google.accounts.id.initialize({
                            client_id: document.querySelector('meta[name="google-client-id"]')?.getAttribute('content') || '',
                            callback: handleGoogleCredentialResponse,
                        });
                        googleButtonRef.current.innerHTML = ''; 
                        // Fix width issue: "100%" is invalid. Use pixel string.
                        // max-w-md is roughly 448px. padding is 2rem (32px) on each side (p-8). 
                        // Width available ~= 448 - 64 = 384px. 
                        // Google max width is 400. So "380" is safe.
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
            // Successful login automatically updates currentUser in App.tsx
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
        <div className="fixed inset-0 z-50 overflow-y-auto bg-background-light dark:bg-background-dark">
            <PatternBackground />
            
            {/* Changed flex layout to ensure scrolling on small screens */}
            <div className="min-h-full w-full flex flex-col items-center justify-center p-4 py-8 relative z-10">
                
                <div className="w-full max-w-md bg-white/80 dark:bg-[#131022]/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-white/10 overflow-hidden animate-scale-in my-auto">
                    
                    {/* Header Section */}
                    <div className="pt-8 pb-4 flex flex-col items-center justify-center">
                         <div className="transform scale-90">
                            <AnimatedAppName />
                         </div>
                         <p className="text-gray-500 dark:text-gray-400 text-sm mt-2 text-center px-4">AI-Powered Video to Prompt Generator</p>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-gray-200 dark:border-white/10">
                        <button 
                            onClick={() => { setActiveTab('login'); setError(''); }}
                            className={`flex-1 py-4 text-sm font-medium transition-all duration-200 ${activeTab === 'login' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'}`}
                        >
                            Sign In
                        </button>
                        <button 
                            onClick={() => { setActiveTab('signup'); setError(''); }}
                            className={`flex-1 py-4 text-sm font-medium transition-all duration-200 ${activeTab === 'signup' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'}`}
                        >
                            Create Account
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 sm:p-8">
                        {error && (
                            <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm text-center">
                                {error}
                            </div>
                        )}

                        {activeTab === 'login' ? (
                            <div className="space-y-6">
                                {/* Google Button Container */}
                                <div ref={googleButtonRef} className="w-full flex justify-center min-h-[40px]"></div>
                                
                                <div className="relative flex items-center">
                                    <div className="flex-grow border-t border-gray-300 dark:border-gray-700"></div>
                                    <span className="flex-shrink mx-4 text-xs uppercase text-gray-400">Or continue with email</span>
                                    <div className="flex-grow border-t border-gray-300 dark:border-gray-700"></div>
                                </div>

                                <form onSubmit={handleEmailLogin} className="space-y-4">
                                    <input 
                                        type="text" 
                                        placeholder="Email or Username" 
                                        value={email} 
                                        onChange={e => setEmail(e.target.value)} 
                                        required 
                                        className="w-full p-3 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                                    />
                                    <input 
                                        type="password" 
                                        placeholder="Password" 
                                        value={password} 
                                        onChange={e => setPassword(e.target.value)} 
                                        required 
                                        className="w-full p-3 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                                    />
                                    <BlurryButton type="submit" className="w-full py-3" disabled={isLoading}>
                                        {isLoading ? <SpinnerIcon className="w-5 h-5 animate-spin" /> : 'Sign In'}
                                    </BlurryButton>
                                </form>
                            </div>
                        ) : (
                            <form onSubmit={handleEmailSignup} className="space-y-4">
                                 <input 
                                    type="text" 
                                    placeholder="Full Name" 
                                    value={fullName} 
                                    onChange={e => setFullName(e.target.value)} 
                                    required 
                                    className="w-full p-3 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                                />
                                <input 
                                    type="text" 
                                    placeholder="Username" 
                                    value={username} 
                                    onChange={e => setUsername(e.target.value)} 
                                    required 
                                    className="w-full p-3 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                                />
                                <input 
                                    type="email" 
                                    placeholder="Email Address" 
                                    value={email} 
                                    onChange={e => setEmail(e.target.value)} 
                                    required 
                                    className="w-full p-3 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                                />
                                <input 
                                    type="password" 
                                    placeholder="Password (min 6 chars)" 
                                    value={password} 
                                    onChange={e => setPassword(e.target.value)} 
                                    required 
                                    className="w-full p-3 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                                />
                                <BlurryButton type="submit" className="w-full py-3" disabled={isLoading}>
                                    {isLoading ? <SpinnerIcon className="w-5 h-5 animate-spin" /> : 'Create Account'}
                                </BlurryButton>
                            </form>
                        )}

                        {/* Guest Access */}
                        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-white/10 text-center">
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Just want to try it out?</p>
                            <button 
                                onClick={onGuestAccess}
                                type="button"
                                className="flex items-center justify-center w-full py-2.5 px-4 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                            >
                                <UserIcon className="w-5 h-5 mr-2" />
                                Continue as Guest
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
