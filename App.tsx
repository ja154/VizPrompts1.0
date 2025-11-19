import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AnalysisState, PromptHistoryItem, User, ConsistencyResult, StructuredPrompt } from './types.ts';
import { extractFramesFromVideo, imageToDataUrl, getVideoMetadata } from './utils/video.ts';
import { generateStructuredPromptFromFrames, refinePrompt, testPromptConsistency, refineJsonPrompt, testJsonConsistency, remixVideoStyle, convertPromptToJson, analyzeVideoContent, generatePromptFromAnalysis } from './services/geminiService.ts';
import { BrainCircuitIcon, FilmIcon, PlusCircleIcon, LibraryIcon } from './components/icons.tsx';
import BlurryButton from './components/Button.tsx';
import LogoLoader from './components/LogoLoader.tsx';
import UploaderIcon from './components/UploaderIcon.tsx';
import ThemeSwitch from './components/ThemeSwitch.tsx';
import AnimatedAppName from './components/AnimatedAppName.tsx';
import Auth from './components/Auth.tsx';
import { useAuth } from './hooks/useAuth';
import GlowCard from './components/GlowCard.tsx';
import ResultsView from './components/ResultsView.tsx';
import VideoAnalysisView from './components/VideoAnalysisView.tsx';
import ProfilePage from './components/ProfilePage.tsx';
import HistoryPage from './components/HistoryPage.tsx';
import UserMenu from './components/UserMenu.tsx';
import PatternBackground from './components/PatternBackground.tsx';
import PromptLibrary from './components/PromptLibrary.tsx';
import { PromptTemplate } from './data/promptLibrary.ts';
import FAQ from './components/FAQ.tsx';


type Theme = 'light' | 'dark';
export type AppView = 'main' | 'profile' | 'history';
type ResultType = 'prompt' | 'video_analysis';

interface UploaderProps {
    analysisState: AnalysisState;
    file: File | null;
    videoUrl: string;
    error: string;
    progress: number;
    progressMessage: string;
    onFileSelect: (file: File) => void;
    onStartAnalysis: () => void;
    onStartVideoAnalysis: () => void;
    onResetState: () => void;
}

const Uploader: React.FC<UploaderProps> = ({
    analysisState, file, videoUrl, error, progress, progressMessage,
    onFileSelect, onStartAnalysis, onStartVideoAnalysis, onResetState
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.currentTarget.classList.add('border-purple-500', 'bg-purple-50', 'dark:bg-purple-900/20');
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.currentTarget.classList.remove('border-purple-500', 'bg-purple-50', 'dark:bg-purple-900/20');
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.currentTarget.classList.remove('border-purple-500', 'bg-purple-50', 'dark:bg-purple-900/20');
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            onFileSelect(e.dataTransfer.files[0]);
            e.dataTransfer.clearData();
        }
    };

    return (
        <GlowCard className="bg-bg-uploader-light dark:bg-bg-uploader-dark rounded-2xl p-8 shadow-lg border border-border-primary-light dark:border-border-primary-dark min-h-[350px] flex flex-col justify-center">
            {analysisState === AnalysisState.IDLE && (
                <div
                    onClick={() => fileInputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className="w-full group border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 cursor-pointer hover:border-gray-500 dark:hover:border-stone-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-300 ease-in-out transform hover:scale-[1.01]"
                >
                    <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="w-20 h-20 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                            <UploaderIcon />
                        </div>
                        <h3 className="text-lg font-medium transition-colors duration-300 group-hover:text-gray-700 dark:group-hover:text-stone-300">Drag & drop your video or image here</h3>
                        <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">or click to browse files</p>
                        <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">Supports MP4, MOV, WEBM, JPG, PNG (Max 200MB)</p>
                    </div>
                    <input type="file" ref={fileInputRef} onChange={(e) => e.target.files && onFileSelect(e.target.files[0])} className="hidden" accept="video/*,image/*" />
                </div>
            )}

            {analysisState === AnalysisState.PREVIEW && file && (
                <div className="animate-fade-in-slide-up" style={{ animationDuration: '300ms' }}>
                    <h3 className="text-xl font-bold mb-4 text-center">Ready to Analyze?</h3>
                    <div className="video-preview bg-black rounded-lg mb-4 overflow-hidden flex items-center justify-center">
                        {file?.type.startsWith('video/') ? (
                            <video src={videoUrl} controls className="w-full h-full object-contain"></video>
                        ) : (
                            <img src={videoUrl} alt="Image Preview" className="w-full h-full object-contain" />
                        )}
                    </div>
                    <p className="text-center text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark truncate" title={file.name}>{file.name}</p>
                    <div className="flex flex-col sm:flex-row gap-4 mt-6">
                        <BlurryButton onClick={onStartAnalysis} className="flex-1">
                            <span className="fas fa-magic mr-2"></span>
                            Generate Prompt
                        </BlurryButton>
                        <BlurryButton onClick={onStartVideoAnalysis} className="flex-1">
                            <BrainCircuitIcon className="w-5 h-5 mr-2" />
                            Understand Video
                        </BlurryButton>
                    </div>
                     <div className="mt-4">
                        <button
                            onClick={onResetState}
                            className="w-full group relative inline-flex items-center justify-center p-0.5 rounded-xl font-semibold transition-all duration-200 ease-in-out bg-bg-primary-light dark:bg-bg-primary-dark hover:bg-gray-200 dark:hover:bg-gray-700/80 text-text-primary-light dark:text-text-primary-dark"
                        >
                            <span className="relative w-full h-full px-5 py-2.5 text-sm rounded-lg leading-none flex items-center justify-center gap-2">
                                <span className="fas fa-undo mr-2"></span>
                                Choose Another File
                            </span>
                        </button>
                    </div>
                </div>
            )}

            {analysisState === AnalysisState.PROCESSING && (
                <div className="animate-fade-in-slide-up w-full">
                    <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark">{progressMessage || 'Processing media...'}</span>
                        <span className="text-sm font-medium">{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                        <div className="bg-purple-600 h-2.5 rounded-full progress-bar" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>
            )}

            {analysisState === AnalysisState.ERROR && (
                <div className="text-center animate-fade-in-slide-up">
                    <span className="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></span>
                    <h3 className="text-xl font-bold text-red-500 mb-2">Analysis Failed</h3>
                    <p className="text-center text-red-500/90 text-sm bg-red-500/10 p-3 rounded-lg mb-6">{error}</p>
                    <BlurryButton onClick={onResetState}>
                        <span className="fas fa-undo mr-2"></span>
                        Try Another File
                    </BlurryButton>
                </div>
            )}

            {(analysisState === AnalysisState.IDLE || analysisState === AnalysisState.PREVIEW) && error && (
                <p className="text-center text-red-500 mt-4">{error}</p>
            )}
        </GlowCard>
    );
};

const AnalysisInstructionSection: React.FC<{ onOpenLibrary: () => void }> = ({ onOpenLibrary }) => {
    return (
        <section className="space-y-8">
            <GlowCard className="bg-bg-secondary-light dark:bg-bg-secondary-dark rounded-2xl p-1 shadow-lg border border-border-primary-light dark:border-border-primary-dark">
                <div className="rounded-xl p-6">
                    <h3 className="text-xl font-bold mb-4 flex items-center">
                        <BrainCircuitIcon className="w-6 h-6 mr-3" />
                        AI Analysis Protocol
                    </h3>
                    <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                        Our AI deconstructs your media to infer goals, extract key elements, and outline constraints, generating a detailed, production-ready prompt. The result will be in a structured text format, which can then be converted to JSON if needed.
                    </p>
                </div>
            </GlowCard>
            <GlowCard className="bg-bg-secondary-light dark:bg-bg-secondary-dark rounded-2xl p-1 shadow-lg border border-border-primary-light dark:border-border-primary-dark">
                <div className="rounded-xl p-6">
                     <h3 className="text-xl font-bold mb-4 flex items-center">
                        <LibraryIcon className="w-6 h-6 mr-3" />
                        Need Inspiration?
                    </h3>
                    <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mb-6">
                        Explore our curated library of high-quality prompts to kickstart your creative process or see what's possible.
                    </p>
                    <BlurryButton onClick={onOpenLibrary}>
                        <PlusCircleIcon />
                        Explore Prompt Library
                    </BlurryButton>
                </div>
            </GlowCard>
        </section>
    );
};

const socialLinks = [
    { name: 'Facebook', href: 'https://www.facebook.com/profile.php?id=100089838724125', icon: <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M14 13.5h2.5l1-4H14v-2c0-1.03 0.01-1.93.93-2H17V2.04C16.38 2 15.65 2 14.96 2 12.57 2 11 3.6 11 6.22V9.5H8.5v4H11v7h3v-7z"/></svg> },
    { name: 'Twitter', href: 'https://x.com/aicreatorske?t=vIB_Wqjo1QWtb-9x-204zQ&s=08', icon: <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
    { name: 'Instagram', href: 'https://www.instagram.com/aicreatorske?igsh=MWwybG5rYnZncmFsNQ==', icon: <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153a4.908 4.908 0 011.153 1.772c.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122s-.013 3.056-.06 4.122c-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 01-1.153 1.772c-.556.556-1.112.9-1.772 1.153-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06s-3.056-.013-4.122-.06c-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 01-1.772-1.153 4.904 4.904 0 01-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12s.013-3.056.06-4.122c.05-1.065.217-1.79.465-2.428a4.88 4.88 0 011.153-1.772A4.897 4.897 0 015.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2zm0 5a5 5 0 100 10 5 5 0 000-10zm0 8a3 3 0 110-6 3 3 0 010 6zm5-8.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3z"/></svg> },
    { name: 'Linktree', href: 'https://linktr.ee/Jaygraphicz254', icon: <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12.723 1.95h-1.446L3.332 9.496l.723.723L12 2.275l7.945 7.944.723-.723-7.945-7.546zM12 5.512l-5.617 5.617 5.617 5.617 5.617-5.617-5.617-5.617zm-7.945 2.328L12 15.785l7.945-7.945.723.723L12 17.23 3.332 9.563l.723-.723z"/></svg> },
    { name: 'WhatsApp', href: 'https://chat.whatsapp.com/JdOhcFcENmsDpl7nQvJjPd', icon: <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.79.52 3.48 1.44 4.93l-1.54 5.62 5.76-1.52c1.4.88 3.03 1.4 4.75 1.4h.01c5.46 0 9.9-4.44 9.9-9.9C21.94 6.45 17.5 2 12.04 2zM9.51 8.24c.2-.35.49-.57.65-.6.2-.04.44-.04.64-.04.22 0 .5.02.72.31.22.29.84 1.01.84 2.4s0 1.63-.12 1.84c-.12.21-.49.52-1.04.52s-.88-.15-1.71-1.08c-.83-.93-1.37-2.06-1.37-2.06s-.11-.15-.11-.27.28-.42.28-.42zm7.42 5.09c-.19-.1-.4-.19-.67-.34s-1.6-.79-1.85-.88c-.25-.09-.43-.15-.61.15-.18.29-.7.88-.86 1.06-.16.18-.32.2-.47.05-.15-.15-.64-.23-1.22-.76-.45-.41-.75-.9-1.04-1.55-.29-.65-.6-1.29-.6-1.29s-.14-.23.09-.46c.23-.23.41-.39.56-.58.15-.19.2-.32.3-.53s.05-.28-.02-.43c-.07-.15-.61-1.47-.84-2-.23-.53-.46-.45-.6-.45s-.36-.01-.52-.01l-.43.01s-.41.06-.63.31c-.22.25-.84.82-.84 2s.84 2.32.96 2.47c.12.15 1.69 2.59 4.1 3.61.59.25 1.05.4 1.41.51.61.19 1.17.16 1.62.1.5-.06 1.59-.65 1.81-1.28.22-.63.22-1.17.15-1.28z"/></svg> },
    { name: 'Reddit', href: 'https://www.reddit.com/u/AIcreatorske/s/Bb8Y6bErp1', icon: <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2Zm1.69,14.23a1.4,1.4,0,0,1-3.38,0,1.39,1.39,0,0,1,1.69-2.31,1.39,1.39,0,0,1,1.69,2.31Zm.37-3.47a.79.79,0,0,1-.72.5,1.4,1.4,0,0,1-1.34,0,.79.79,0,0,1-.72-.5,1,1,0,0,1,1-1.15,3.48,3.48,0,0,1,1.75.49,1,1,0,0,1-.49,1.16ZM8.73,12.5a1.14,1.14,0,1,1,1.14-1.14A1.14,1.14,0,0,1,8.73,12.5Zm6.54,0a1.14,1.14,0,1,1,1.14-1.14A1.14,1.14,0,0,1,15.27,12.5Z"/></svg> },
];

const Footer = ({ onNavigate }: { onNavigate: (view: AppView) => void; }) => (
    <footer className="mt-24 border-t border-border-primary-light/50 dark:border-border-primary-dark/50 bg-bg-secondary-light/50 dark:bg-bg-secondary-dark/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                {/* Column 1: Brand */}
                <div className="md:col-span-12 lg:col-span-4">
                     <div onClick={() => onNavigate('main')} className="inline-flex flex-col items-start cursor-pointer group mb-4">
                        <LogoLoader />
                        <AnimatedAppName />
                    </div>
                    <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm max-w-xs">
                        Instantly convert any video or image into hyper-detailed, production-ready prompts for generative AI models.
                    </p>
                </div>
                
                {/* Spacer */}
                <div className="hidden lg:block lg:col-span-2"></div>

                {/* Column 2: Links */}
                <div className="md:col-span-6 lg:col-span-2">
                    <h3 className="font-semibold text-text-primary-light dark:text-text-primary-dark mb-4 uppercase tracking-wider text-sm">Links</h3>
                    <ul className="space-y-3">
                        <li><button onClick={() => onNavigate('main')} className="footer-link">Home</button></li>
                        <li><button onClick={() => onNavigate('profile')} className="footer-link">Profile</button></li>
                        <li><button onClick={() => onNavigate('history')} className="footer-link">History</button></li>
                    </ul>
                </div>

                {/* Column 3: Follow Us */}
                <div className="md:col-span-6 lg:col-span-4">
                    <h3 className="font-semibold text-text-primary-light dark:text-text-primary-dark mb-4 uppercase tracking-wider text-sm">Follow Us</h3>
                    <div className="flex flex-wrap gap-4">
                        {socialLinks.map(link => (
                            <a key={link.name} href={link.href} target="_blank" rel="noopener noreferrer" className="social-icon tooltip-container">
                                <span className="tooltip-text" style={{width: 'auto', padding: '5px 10px'}}>{link.name}</span>
                                {link.icon}
                            </a>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="mt-16 pt-8 border-t border-border-primary-light/50 dark:border-border-primary-dark/50 flex flex-col sm:flex-row justify-between items-center gap-4">
                <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark text-center sm:text-left">
                    © {new Date().getFullYear()} VizPrompts. All Rights Reserved.
                </p>
                <div className="flex space-x-6">
                    <a href="#" className="footer-link text-sm">Privacy Policy</a>
                    <a href="#" className="footer-link text-sm">Terms of Service</a>
                </div>
            </div>
        </div>
    </footer>
);

const ResultsPlaceholder = () => (
    <div className="animate-fade-in-slide-up animation-delay-300 sticky top-8">
        <div className="flex flex-col gap-8 opacity-60 pointer-events-none">
            <GlowCard className="bg-bg-secondary-light/80 dark:bg-bg-secondary-dark/80 rounded-2xl p-1 shadow-lg border border-border-primary-light/50 dark:border-border-primary-dark/50">
                <div className="rounded-xl p-6">
                    <h2 className="text-xl font-bold mb-4 flex items-center text-text-secondary-light dark:text-text-secondary-dark"><FilmIcon className="w-6 h-6 mr-2"/>Media Preview</h2>
                    <div className="video-preview bg-bg-uploader-light dark:bg-bg-uploader-dark rounded-lg mb-4 flex items-center justify-center">
                        <p className="text-text-secondary-light dark:text-text-secondary-dark p-4 text-center text-sm">Upload media to see a preview and metadata.</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-bg-uploader-light dark:bg-bg-uploader-dark p-3 rounded-lg">
                            <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">Duration</p>
                            <p className="font-medium">-:--</p>
                        </div>
                        <div className="bg-bg-uploader-light dark:bg-bg-uploader-dark p-3 rounded-lg">
                            <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">Resolution</p>
                            <p className="font-medium">- x -</p>
                        </div>
                    </div>
                </div>
            </GlowCard>

            <GlowCard className="bg-bg-secondary-light/80 dark:bg-bg-secondary-dark/80 rounded-2xl p-1 shadow-lg border border-border-primary-light/50 dark:border-border-primary-dark/50">
                <div className="rounded-xl p-6">
                    <h2 className="text-xl font-bold flex items-center mb-4 text-text-secondary-light dark:text-text-secondary-dark"><BrainCircuitIcon className="w-6 h-6 mr-2"/>Analysis Results</h2>
                     <div className="space-y-4">
                        <div className="bg-bg-uploader-light dark:bg-bg-uploader-dark p-3 rounded-lg h-16"></div>
                        <div className="bg-bg-uploader-light dark:bg-bg-uploader-dark p-3 rounded-lg h-24"></div>
                        <div className="bg-bg-uploader-light dark:bg-bg-uploader-dark p-3 rounded-lg h-16"></div>
                     </div>
                </div>
            </GlowCard>
        </div>
    </div>
);

const AnalyzedFilePreview: React.FC<{file: File, videoUrl: string, onReset: () => void}> = ({ file, videoUrl, onReset }) => (
    <GlowCard className="bg-bg-uploader-light dark:bg-bg-uploader-dark rounded-2xl p-6 shadow-lg border border-border-primary-light dark:border-border-primary-dark animate-fade-in-slide-up">
        <h3 className="text-xl font-bold mb-4">Analyzed Media</h3>
        <div className="flex items-center gap-4">
            <div className="w-24 h-16 bg-black rounded-lg overflow-hidden flex-shrink-0">
                {file?.type.startsWith('video/') ? (
                    <video src={videoUrl} className="w-full h-full object-cover"></video>
                ) : (
                    <img src={videoUrl} alt="Preview" className="w-full h-full object-cover" />
                )}
            </div>
            <div className="flex-grow overflow-hidden">
                <p className="font-medium truncate" title={file.name}>{file.name}</p>
                <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">{file.type}</p>
            </div>
        </div>
        <BlurryButton onClick={onReset} className="w-full mt-6">
            <span className="fas fa-plus mr-2"></span> Start New Analysis
        </BlurryButton>
    </GlowCard>
);

const App: React.FC = () => {
    // Core App State
    const [theme, setTheme] = useState<Theme>('dark');
    const { currentUser, userHistory, addToHistory, logout } = useAuth();
    const [currentView, setCurrentView] = useState<AppView>('main');
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [selectedHistoryItem, setSelectedHistoryItem] = useState<PromptHistoryItem | null>(null);
    const [isLibraryOpen, setIsLibraryOpen] = useState(false);

    // State lifted from Uploader
    const [file, setFile] = useState<File | null>(null);
    const [videoUrl, setVideoUrl] = useState<string>('');
    const [videoMeta, setVideoMeta] = useState<{ duration: string, resolution: string } | null>(null);
    const [analysisState, setAnalysisState] = useState<AnalysisState>(AnalysisState.IDLE);
    const [progress, setProgress] = useState(0);
    const [progressMessage, setProgressMessage] = useState('');
    const [error, setError] = useState('');
    
    // Results State
    const [resultType, setResultType] = useState<ResultType | null>(null);
    const [generatedPrompt, setGeneratedPrompt] = useState('');
    const [structuredPrompt, setStructuredPrompt] = useState<StructuredPrompt | null>(null);
    const [videoAnalysisResult, setVideoAnalysisResult] = useState<string | null>(null);
    
    // UI Interaction State
    const [isCopied, setIsCopied] = useState(false);
    const [isRefining, setIsRefining] = useState(false);
    const [isDetailing, setIsDetailing] = useState(false);
    const [refineInstruction, setRefineInstruction] = useState('');
    const [refineTone, setRefineTone] = useState('');
    const [refineStyle, setRefineStyle] = useState('');
    const [refineCamera, setRefineCamera] = useState('');
    const [refineLighting, setRefineLighting] = useState('');
    const [negativePrompt, setNegativePrompt] = useState('');
    const [extractedFrames, setExtractedFrames] = useState<string[]>([]);
    const [isTestingConsistency, setIsTestingConsistency] = useState(false);
    const [consistencyResult, setConsistencyResult] = useState<ConsistencyResult | null>(null);
    const [showConsistencyModal, setShowConsistencyModal] = useState(false);
    const [isRemixing, setIsRemixing] = useState(false);
    const [remixStyle, setRemixStyle] = useState('');
    const [isConvertingToJson, setIsConvertingToJson] = useState(false);
    const [isGeneratingPromptFromAnalysis, setIsGeneratingPromptFromAnalysis] = useState(false);
    
    const resetState = useCallback(() => {
        setFile(null);
        if (videoUrl) URL.revokeObjectURL(videoUrl);
        setVideoUrl('');
        setVideoMeta(null);
        setAnalysisState(AnalysisState.IDLE);
        setProgress(0);
        setProgressMessage('');
        setError('');
        setResultType(null);
        setGeneratedPrompt('');
        setStructuredPrompt(null);
        setVideoAnalysisResult(null);
        setIsCopied(false);
        setIsRefining(false);
        setIsDetailing(false);
        setRefineInstruction('');
        setRefineTone('');
        setRefineStyle('');
        setRefineCamera('');
        setRefineLighting('');
        setNegativePrompt('');
        setExtractedFrames([]);
        setIsTestingConsistency(false);
        setConsistencyResult(null);
        setShowConsistencyModal(false);
        setIsRemixing(false);
        setRemixStyle('');
        setIsConvertingToJson(false);
        setIsGeneratingPromptFromAnalysis(false);
    }, [videoUrl]);

    const populateStateFromAnalysis = (analysis: StructuredPrompt) => {
        setGeneratedPrompt(analysis.core_focus);
        setStructuredPrompt(analysis);
    };

    const handleFileSelect = async (selectedFile: File) => {
        resetState();
        const validTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm', 'image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!validTypes.includes(selectedFile.type)) {
            setError('Please upload a valid video (MP4, MOV, WEBM) or image (JPG, PNG, GIF) file.');
            return;
        }
        if (selectedFile.size > 200 * 1024 * 1024) {
            setError('File size exceeds 200MB limit.');
            return;
        }
        setFile(selectedFile);
        try {
            if (selectedFile.type.startsWith('video/')) {
                setVideoUrl(URL.createObjectURL(selectedFile));
                const meta = await getVideoMetadata(selectedFile);
                const minutes = Math.floor(meta.duration / 60);
                const seconds = Math.floor(meta.duration % 60).toString().padStart(2, '0');
                setVideoMeta({ duration: `${minutes}:${seconds}`, resolution: `${meta.width}x${meta.height}` });
            } else if (selectedFile.type.startsWith('image/')) {
                const dataUrl = await imageToDataUrl(selectedFile);
                const img = new Image();
                img.onload = () => setVideoMeta({ duration: 'N/A', resolution: `${img.width}x${img.height}` });
                img.src = dataUrl;
                setVideoUrl(dataUrl);
            }
            setAnalysisState(AnalysisState.PREVIEW);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not read file preview.');
            setAnalysisState(AnalysisState.IDLE);
            setFile(null);
        }
    };

    const handleStartAnalysis = async () => {
        if (!file) return;

        let progressInterval: ReturnType<typeof setInterval> | undefined;
        setAnalysisState(AnalysisState.PROCESSING);
        setProgress(0);
        setProgressMessage('Preparing media...');
        setError('');
        setResultType('prompt');

        try {
            let frameDataUrls: string[] = [];
            
            if (file.type.startsWith('video/')) {
                setProgressMessage('Extracting video frames...');
                frameDataUrls = await extractFramesFromVideo(file, 10, (prog) => {
                    setProgress(prog * 0.5);
                });
            } else if (file.type.startsWith('image/')) {
                setProgressMessage('Processing image...');
                frameDataUrls = [videoUrl];
                await new Promise(res => setTimeout(res, 500));
                setProgress(50);
            }
            
            if (frameDataUrls.length === 0) {
                throw new Error("Could not extract frames or process the media.");
            }
            setExtractedFrames(frameDataUrls);
            
            setProgressMessage('Analyzing with Gemini AI...');
            
            progressInterval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 95) {
                        if (progressInterval) clearInterval(progressInterval);
                        return prev;
                    }
                    return prev + 1;
                });
            }, 150);

            const finalAnalysis = await generateStructuredPromptFromFrames(frameDataUrls, (msg) => {
                 setProgressMessage(msg);
            });

            if (progressInterval) clearInterval(progressInterval);
            setProgress(100);
            
            populateStateFromAnalysis(finalAnalysis);
            addToHistory({
                id: Date.now().toString(),
                prompt: finalAnalysis.core_focus,
                structuredPrompt: finalAnalysis,
                thumbnail: frameDataUrls[0],
                timestamp: new Date().toISOString(),
            });

            setTimeout(() => {
                setAnalysisState(AnalysisState.SUCCESS);
            }, 300);

        } catch (err) {
            if (progressInterval) clearInterval(progressInterval);
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
            setAnalysisState(AnalysisState.ERROR);
        }
    };

    const handleStartVideoAnalysis = async () => {
        if (!file) return;

        let progressInterval: ReturnType<typeof setInterval> | undefined;
        setAnalysisState(AnalysisState.PROCESSING);
        setProgress(0);
        setProgressMessage('Preparing media...');
        setError('');
        setResultType('video_analysis');

        try {
            let frameDataUrls: string[] = [];
            
            if (file.type.startsWith('video/')) {
                setProgressMessage('Extracting video frames...');
                frameDataUrls = await extractFramesFromVideo(file, 10, (prog) => {
                    setProgress(prog * 0.5);
                });
            } else if (file.type.startsWith('image/')) {
                setProgressMessage('Processing image...');
                frameDataUrls = [videoUrl];
                await new Promise(res => setTimeout(res, 500));
                setProgress(50);
            }
            
            if (frameDataUrls.length === 0) {
                throw new Error("Could not extract frames or process the media.");
            }
            setExtractedFrames(frameDataUrls); // Store frames in case user wants to test consistency later, though that's not a feature for this view yet.
            
            setProgressMessage('Analyzing with Gemini Pro...');
            
            progressInterval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 95) {
                        if (progressInterval) clearInterval(progressInterval);
                        return prev;
                    }
                    return prev + 1;
                });
            }, 200); // Slower interval for the more powerful model

            const analysisResultText = await analyzeVideoContent(frameDataUrls, (msg) => {
                 setProgressMessage(msg);
            });

            if (progressInterval) clearInterval(progressInterval);
            setProgress(100);
            
            setVideoAnalysisResult(analysisResultText);

            setTimeout(() => {
                setAnalysisState(AnalysisState.SUCCESS);
            }, 300);

        } catch (err) {
            if (progressInterval) clearInterval(progressInterval);
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
            setAnalysisState(AnalysisState.ERROR);
        }
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const handleRefinePrompt = async (mode: 'refine' | 'detail') => {
        if (!generatedPrompt) return;
        if (mode === 'refine') setIsRefining(true);
        if (mode === 'detail') setIsDetailing(true);
        setError('');
        let instruction = '';
        if (mode === 'detail') {
            instruction = 'Add significantly more detail to the prompt. Make it richer, more descriptive, and include more sensory information and intricate visual elements. If the input is JSON, apply these details across all relevant fields like core_focus, constraints, and objective.';
        } else {
            instruction = 'Refine the following prompt. ';
            if (refineTone) instruction += `Give it a ${refineTone} tone. `;
            if (refineStyle) instruction += `Make the style ${refineStyle}. `;
            if (refineCamera) instruction += `Use ${refineCamera} camera work. `;
            if (refineLighting) instruction += `Incorporate ${refineLighting} lighting. `;
            if (refineInstruction) instruction += `Specifically: ${refineInstruction}.`;
            if (instruction.trim() === 'Refine the following prompt.') {
                instruction = 'Slightly rephrase and improve the prompt for clarity and impact.';
            }
        }
        try {
            const isJsonOutput = structuredPrompt?.objective === 'JSON Format Output';
            const newPrompt = isJsonOutput
                ? await refineJsonPrompt(generatedPrompt, instruction, negativePrompt)
                : await refinePrompt(generatedPrompt, instruction, negativePrompt);
            
            setGeneratedPrompt(newPrompt);
            if (structuredPrompt) {
                const newCoreFocus = isJsonOutput ? newPrompt : newPrompt;
                setStructuredPrompt(prev => prev ? { ...prev, core_focus: newCoreFocus } : null);
            }
        } catch (err) {
            setError(err instanceof Error ? `Failed to refine prompt: ${err.message}` : 'An unknown error occurred during refinement.');
        } finally {
            if (mode === 'refine') setIsRefining(false);
            if (mode === 'detail') setIsDetailing(false);
        }
    };

    const handleTestConsistency = async () => {
        if (!generatedPrompt || extractedFrames.length === 0) {
            setError("Cannot test consistency without a prompt and original media frames.");
            return;
        }

        setIsTestingConsistency(true);
        setConsistencyResult(null);
        setShowConsistencyModal(true);
        setError('');
        try {
            let result: ConsistencyResult;
            const isJsonOutput = structuredPrompt?.objective === 'JSON Format Output';

            if (isJsonOutput) {
                try {
                    JSON.parse(generatedPrompt); // Validate it's JSON before sending
                    result = await testJsonConsistency(generatedPrompt, extractedFrames);
                } catch (e) {
                     setError("The current text is not valid JSON and cannot be tested.");
                     setIsTestingConsistency(false);
                     return;
                }
            } else {
                result = await testPromptConsistency(generatedPrompt, extractedFrames);
            }
            setConsistencyResult(result);
        } catch (err) {
            setError(err instanceof Error ? `${err.message}` : 'An unknown error occurred during the consistency test.');
        } finally {
            setIsTestingConsistency(false);
        }
    };

    const handleApplyImprovements = (newOutput: string) => {
        setShowConsistencyModal(false);
        setConsistencyResult(null);
        setError('');
        setGeneratedPrompt(newOutput);
        if (structuredPrompt) {
            setStructuredPrompt(prev => prev ? { ...prev, core_focus: newOutput } : null);
        }
    };

    const handleRemixStyle = async () => {
        if (!remixStyle || extractedFrames.length === 0) {
            setError("Please select a style and ensure media is uploaded to remix.");
            return;
        }
        setIsRemixing(true);
        setError('');
        try {
            const newPrompt = await remixVideoStyle(extractedFrames, remixStyle);
            setGeneratedPrompt(newPrompt);
            setStructuredPrompt({
                objective: `A video in the style of ${remixStyle}, based on the original media.`,
                core_focus: newPrompt,
                constraints: `The aesthetic must be strictly '${remixStyle}'. All motion and subjects should be adapted to this style.`,
                enhancements: "The original motion has been re-interpreted in a new artistic style."
            });
        } catch (err) {
            setError(err instanceof Error ? `Failed to remix style: ${err.message}` : 'An unknown error occurred during remixing.');
        } finally {
            setIsRemixing(false);
        }
    };

    const handleConvertToJason = async () => {
        if (!structuredPrompt) return;
        try {
            JSON.parse(generatedPrompt);
            return;
        } catch (e) {
            // It's not JSON, proceed.
        }
    
        setIsConvertingToJson(true);
        setError('');
        try {
            const jsonString = await convertPromptToJson(structuredPrompt);
            setGeneratedPrompt(jsonString);
            setStructuredPrompt({
                objective: "JSON Format Output",
                core_focus: jsonString,
                constraints: "All details are contained within the JSON in the Core Focus section."
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to convert to JSON.');
        } finally {
            setIsConvertingToJson(false);
        }
    };

    const handleGeneratePromptFromAnalysis = async () => {
        if (!videoAnalysisResult) return;
        setIsGeneratingPromptFromAnalysis(true);
        setError('');
        try {
            const result = await generatePromptFromAnalysis(videoAnalysisResult);
            populateStateFromAnalysis(result);
            setResultType('prompt'); // Switch view to prompt results
            
            // Optional: Add this new prompt generation to history
            addToHistory({
                id: Date.now().toString(),
                prompt: result.core_focus,
                structuredPrompt: result,
                thumbnail: extractedFrames[0] || videoUrl, 
                timestamp: new Date().toISOString(),
            });
        } catch (err) {
             setError(err instanceof Error ? err.message : 'Failed to generate prompt from analysis.');
        } finally {
            setIsGeneratingPromptFromAnalysis(false);
        }
    };
    
    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    const handleToggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    const handleNavigate = (view: AppView) => {
        setCurrentView(view);
    };

    const handleSelectHistoryItem = (item: PromptHistoryItem) => {
        resetState();
        setAnalysisState(AnalysisState.SUCCESS);
        setResultType('prompt');
        setStructuredPrompt(item.structuredPrompt);
        setGeneratedPrompt(item.prompt);
        setVideoUrl(item.thumbnail);
        setVideoMeta({ duration: 'From History', resolution: 'N/A' });
        setFile(new File([], `${item.prompt.substring(0, 20)}.history`, { type: 'text/plain' }));
        setCurrentView('main');
    };
    
    const handleSelectPromptFromLibrary = (item: PromptTemplate) => {
        resetState();
        setAnalysisState(AnalysisState.SUCCESS);
        setResultType('prompt');
        setStructuredPrompt(item.structuredPrompt);
        setGeneratedPrompt(item.prompt);

        const placeholderSvg = `<svg xmlns="http://www.w3.org/2000/svg" class="w-full h-full p-8 text-gray-400 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>`;
        const placeholderDataUrl = `data:image/svg+xml;base64,${btoa(placeholderSvg)}`;
        setVideoUrl(placeholderDataUrl);

        setVideoMeta({ duration: 'N/A', resolution: 'From Library' });
        setFile(new File([], item.title, { type: 'text/plain' }));
        setExtractedFrames([]);
        setCurrentView('main');
    };

    return (
        <>
            <PatternBackground />

            {isAuthModalOpen && (
                <Auth 
                    isOpen={isAuthModalOpen} 
                    onClose={() => setIsAuthModalOpen(false)}
                    onAuthSuccess={() => setIsAuthModalOpen(false)}
                />
            )}

            <PromptLibrary 
                isOpen={isLibraryOpen}
                onClose={() => setIsLibraryOpen(false)}
                onSelectPrompt={handleSelectPromptFromLibrary}
            />

            <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <nav className="flex justify-between items-center w-full">
                    <div className="flex-1 flex justify-start">
                        {!currentUser && (
                            <BlurryButton onClick={() => setIsAuthModalOpen(true)}>
                                Sign In
                            </BlurryButton>
                        )}
                    </div>

                    <div className="flex-shrink-0">
                         <div onClick={() => handleNavigate('main')} className="flex items-center gap-2 cursor-pointer group">
                            <LogoLoader />
                        </div>
                    </div>

                    <div className="flex-1 flex justify-end items-center gap-4">
                       <ThemeSwitch theme={theme} onToggleTheme={handleToggleTheme} />
                       {currentUser && (
                            <UserMenu currentUser={currentUser} onNavigate={handleNavigate} onLogout={logout} />
                       )}
                    </div>
                </nav>
            </header>

            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
                {currentView === 'main' && (
                     <>
                        <div className="text-center mb-16">
                             <AnimatedAppName />
                            <p className="mt-4 max-w-3xl mx-auto text-lg text-text-secondary-light dark:text-text-secondary-dark animate-fade-in-slide-up animation-delay-200">
                                Instantly convert any video or image into hyper-detailed, production-ready prompts for generative AI models.
                            </p>
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-16">
                            <div className="space-y-8 animate-fade-in-slide-up animation-delay-100">
                                {analysisState === AnalysisState.SUCCESS ? (
                                    <AnalyzedFilePreview file={file!} videoUrl={videoUrl} onReset={resetState} />
                                ) : (
                                    <Uploader 
                                        analysisState={analysisState}
                                        file={file}
                                        videoUrl={videoUrl}
                                        error={error}
                                        progress={progress}
                                        progressMessage={progressMessage}
                                        onFileSelect={handleFileSelect}
                                        onStartAnalysis={handleStartAnalysis}
                                        onStartVideoAnalysis={handleStartVideoAnalysis}
                                        onResetState={resetState}
                                    />
                                )}
                                <AnalysisInstructionSection onOpenLibrary={() => setIsLibraryOpen(true)} />
                            </div>

                            <div>
                                {analysisState === AnalysisState.SUCCESS && resultType === 'prompt' && structuredPrompt ? (
                                    <ResultsView 
                                        file={file}
                                        videoUrl={videoUrl}
                                        videoMeta={videoMeta}
                                        generatedPrompt={generatedPrompt}
                                        structuredPrompt={structuredPrompt}
                                        isCopied={isCopied}
                                        isRefining={isRefining}
                                        isDetailing={isDetailing}
                                        refineTone={refineTone}
                                        refineStyle={refineStyle}
                                        refineCamera={refineCamera}
                                        refineLighting={refineLighting}
                                        refineInstruction={refineInstruction}
                                        negativePrompt={negativePrompt}
                                        setNegativePrompt={setNegativePrompt}
                                        handlePromptChange={(e) => setGeneratedPrompt(e.target.value)}
                                        handleCopy={handleCopy}
                                        handleRefinePrompt={handleRefinePrompt}
                                        setRefineTone={setRefineTone}
                                        setRefineStyle={setRefineStyle}
                                        setRefineCamera={setRefineCamera}
                                        setRefineLighting={setRefineLighting}
                                        setRefineInstruction={setRefineInstruction}
                                        isTestingConsistency={isTestingConsistency}
                                        consistencyResult={consistencyResult}
                                        showConsistencyModal={showConsistencyModal}
                                        onTestConsistency={handleTestConsistency}
                                        onCloseConsistencyModal={() => setShowConsistencyModal(false)}
                                        onApplyImprovements={handleApplyImprovements}
                                        hasOriginalFrames={extractedFrames.length > 0}
                                        error={error}
                                        isRemixing={isRemixing}
                                        remixStyle={remixStyle}
                                        setRemixStyle={setRemixStyle}
                                        handleRemixStyle={handleRemixStyle}
                                        isConvertingToJson={isConvertingToJson}
                                        onConvertToJason={handleConvertToJason}
                                    />
                                ) : analysisState === AnalysisState.SUCCESS && resultType === 'video_analysis' && videoAnalysisResult ? (
                                    <VideoAnalysisView
                                        file={file}
                                        videoUrl={videoUrl}
                                        videoMeta={videoMeta}
                                        analysisResult={videoAnalysisResult}
                                        isCopied={isCopied}
                                        handleCopy={handleCopy}
                                        isGeneratingPrompt={isGeneratingPromptFromAnalysis}
                                        onGeneratePrompt={handleGeneratePromptFromAnalysis}
                                    />
                                ) : (
                                    <ResultsPlaceholder />
                                )}
                            </div>
                        </div>
                        <FAQ />
                    </>
                )}

                {currentView === 'profile' && <ProfilePage />}
                {currentView === 'history' && <HistoryPage history={userHistory} onSelectHistoryItem={handleSelectHistoryItem} />}
            </main>

            <Footer onNavigate={handleNavigate} />
        </>
    );
};

export default App;