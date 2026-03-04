import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
    LayoutDashboard, 
    Library, 
    History, 
    Settings, 
    User, 
    LogOut, 
    Zap, 
    Menu, 
    Wand2, 
    Brain, 
    X, 
    Loader2, 
    Monitor, 
    Globe, 
    Play,
    ChevronRight,
    Sparkles
} from 'lucide-react';
import { AnalysisState, PromptHistoryItem, ConsistencyResult, StructuredPrompt } from './types.ts';
import { extractFramesFromVideo, imageToDataUrl, getVideoMetadata } from './utils/video.ts';
import { generateStructuredPromptFromFrames, refinePrompt, testPromptConsistency, refineJsonPrompt, testJsonConsistency, remixVideoStyle, convertPromptToJson, analyzeVideoContent, generatePromptFromAnalysis } from './services/geminiService.ts';
import { BrainCircuitIcon, MenuIcon, HistoryIcon, UserIcon, MagicWandIcon, CloseIcon, SpinnerIcon, SettingsIcon, LayoutIcon, GlobeAltIcon, ActionIcon } from './components/icons.tsx';
import BlurryButton from './components/Button.tsx';
import ThemeSwitch from './components/ThemeSwitch.tsx';
import LoginPage from './components/LoginPage.tsx';
import { useAuth } from './hooks/useAuth';
import ResultsView from './components/ResultsView.tsx';
import VideoAnalysisView from './components/VideoAnalysisView.tsx';
import ProfilePage from './components/ProfilePage.tsx';
import SettingsPage from './components/SettingsPage.tsx';
import HistoryPage from './components/HistoryPage.tsx';
import PromptLibrary from './components/PromptLibrary.tsx';
import FAQ from './components/FAQ.tsx';

type Theme = 'light' | 'dark';
export type AppView = 'main' | 'profile' | 'history' | 'settings';
type ResultType = 'prompt' | 'video_analysis';

const App: React.FC = () => {
    const [theme, setTheme] = useState<Theme>('dark');
    const { currentUser, userHistory, addToHistory, logout, isLoading: isAuthLoading } = useAuth();
    const [hasEnteredAsGuest, setHasEnteredAsGuest] = useState(false);
    const [currentView, setCurrentView] = useState<AppView>('main');
    const [isLibraryOpen, setIsLibraryOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const [file, setFile] = useState<File | null>(null);
    const [videoUrl, setVideoUrl] = useState<string>('');
    const [videoMeta, setVideoMeta] = useState<{ duration: string, resolution: string, isVideo: boolean } | null>(null);
    const [analysisState, setAnalysisState] = useState<AnalysisState>(AnalysisState.IDLE);
    const [progress, setProgress] = useState(0);
    const [progressMessage, setProgressMessage] = useState('');
    const [error, setError] = useState('');
    
    const [resultType, setResultType] = useState<ResultType | null>(null);
    const [generatedPrompt, setGeneratedPrompt] = useState('');
    const [structuredPrompt, setStructuredPrompt] = useState<StructuredPrompt | null>(null);
    const [videoAnalysisResult, setVideoAnalysisResult] = useState<string | null>(null);
    
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

    useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
    }, [theme]);

    const resetState = useCallback(() => {
        setFile(null);
        if (videoUrl) URL.revokeObjectURL(videoUrl);
        setVideoUrl('');
        setVideoMeta(null);
        setAnalysisState(AnalysisState.IDLE);
        setProgress(0);
        setGeneratedPrompt('');
        setStructuredPrompt(null);
        setVideoAnalysisResult(null);
        setExtractedFrames([]);
    }, [videoUrl]);

    const handleFileSelect = async (selectedFile: File) => {
        resetState();
        setFile(selectedFile);
        try {
            if (selectedFile.type.startsWith('video/')) {
                setVideoUrl(URL.createObjectURL(selectedFile));
                const meta = await getVideoMetadata(selectedFile);
                setVideoMeta({ 
                    duration: `${Math.floor(meta.duration/60)}:${Math.floor(meta.duration%60).toString().padStart(2,'0')}`, 
                    resolution: `${meta.width}x${meta.height}`,
                    isVideo: true
                });
            } else {
                const dataUrl = await imageToDataUrl(selectedFile);
                setVideoUrl(dataUrl);
                const img = new Image();
                img.src = dataUrl;
                await img.decode();
                setVideoMeta({ 
                    duration: 'N/A', 
                    resolution: `${img.naturalWidth}x${img.naturalHeight}`,
                    isVideo: false
                });
            }
            setAnalysisState(AnalysisState.PREVIEW);
        } catch (err) { 
            console.error(err);
            setError('Failed to load visual asset.'); 
        }
    };

    const handleStartAnalysis = async (customInstruction?: string) => {
        setAnalysisState(AnalysisState.PROCESSING);
        setResultType('prompt');
        try {
            const isVideo = file?.type.startsWith('video/');
            const frames = extractedFrames.length > 0 ? extractedFrames : (isVideo ? await extractFramesFromVideo(file!, 12, p => setProgress(p*0.5)) : [videoUrl]);
            setExtractedFrames(frames);
            const result = await generateStructuredPromptFromFrames(frames, setProgressMessage, customInstruction);
            setGeneratedPrompt(result.core_focus);
            setStructuredPrompt(result);
            addToHistory({ id: Date.now().toString(), prompt: result.core_focus, structuredPrompt: result, thumbnail: frames[0], timestamp: new Date().toISOString() });
            setAnalysisState(AnalysisState.SUCCESS);
        } catch (err) { 
            console.error(err);
            setAnalysisState(AnalysisState.ERROR); 
            setError('Studio intelligence encountered an error.'); 
        }
    };

    const handleStartVideoAnalysis = async () => {
        setAnalysisState(AnalysisState.PROCESSING);
        setResultType('video_analysis');
        try {
            const isVideo = file?.type.startsWith('video/');
            const frames = isVideo ? await extractFramesFromVideo(file!, 12, p => setProgress(p*0.5)) : [videoUrl];
            setExtractedFrames(frames);
            const result = await analyzeVideoContent(frames, setProgressMessage);
            setVideoAnalysisResult(result);
            setAnalysisState(AnalysisState.SUCCESS);
        } catch (err) { 
            console.error(err);
            setAnalysisState(AnalysisState.ERROR); 
            setError('Analysis failed.'); 
        }
    };

    if (isAuthLoading) return <div className="h-screen flex items-center justify-center bg-background-dark"><SpinnerIcon className="size-10 text-primary" /></div>;
    if (!currentUser && !hasEnteredAsGuest) return <LoginPage onGuestAccess={() => setHasEnteredAsGuest(true)} />;

    const navItems = [
        { id: 'main', icon: <LayoutDashboard size={22} />, label: 'Launchpad' },
        { id: 'library', icon: <Library size={22} />, label: 'Library', action: () => setIsLibraryOpen(true) },
        { id: 'history', icon: <History size={22} />, label: 'History' },
        { id: 'settings', icon: <Settings size={22} />, label: 'Studio Settings' }
    ];

    return (
        <div className="flex h-screen w-full transition-colors duration-500 bg-transparent text-white overflow-hidden">
            {/* Expanded Sidebar */}
            <aside className={`fixed sm:relative z-50 h-full flex flex-col p-4 glassmorphic-sidebar transition-all duration-500 ease-in-out ${isSidebarOpen ? 'translate-x-0 w-72' : '-translate-x-full sm:translate-x-0 sm:w-20 hover:w-72'} group/sidebar`}>
                <div className="flex items-center gap-4 mb-10 px-2 overflow-hidden cursor-pointer" onClick={() => setCurrentView('main')}>
                    <div className="size-12 bg-white text-background-dark rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-white/10 glow-pulse">
                        <Zap size={24} fill="currentColor" />
                    </div>
                    <span className="text-xl font-bold tracking-tighter transition-opacity duration-300 opacity-0 group-hover/sidebar:opacity-100 sm:group-hover/sidebar:opacity-100 font-heading uppercase">VizPrompts<span className="text-primary">.</span></span>
                </div>

                <nav className="flex-1 space-y-3">
                    {navItems.map(item => (
                        <button key={item.id} onClick={item.action || (() => setCurrentView(item.id as any))} className={`w-full flex items-center gap-4 p-3.5 rounded-2xl transition-all duration-300 ${currentView === item.id ? 'bg-white text-background-dark shadow-xl shadow-white/10' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}>
                            <div className="shrink-0">{item.icon}</div>
                            <span className="font-bold text-sm whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 uppercase tracking-wider">{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="mt-auto space-y-4">
                    <button onClick={() => setCurrentView('profile')} className="w-full flex items-center gap-4 p-2.5 rounded-2xl text-slate-300 hover:text-white hover:bg-white/5 transition-all group/profile">
                        <div className="size-10 rounded-xl overflow-hidden ring-2 ring-white/10 shrink-0"><UserIcon imgSrc={currentUser?.profilePicture} className="size-full" /></div>
                        <div className="flex flex-col text-left opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 truncate">
                            <span className="text-sm font-bold truncate uppercase tracking-tight">{currentUser?.fullName || 'Guest User'}</span>
                            <span className="text-[10px] text-slate-400 truncate uppercase tracking-widest">Studio Pro Plan</span>
                        </div>
                    </button>
                    <button onClick={logout} className="w-full flex items-center gap-4 p-3.5 rounded-2xl text-slate-300 hover:text-rose-400 hover:bg-rose-400/10 transition-all">
                        <LogOut size={20} className="shrink-0" />
                        <span className="font-bold text-sm opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 uppercase tracking-wider">Exit Studio</span>
                    </button>
                </div>
            </aside>

            {/* Content Stage */}
            <main className="flex-1 overflow-y-auto scroll-smooth relative">
                <header className="flex items-center justify-between px-8 py-6 sticky top-0 bg-background-dark/80 backdrop-blur-md z-40 border-b border-white/5">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsSidebarOpen(true)} className="sm:hidden text-slate-400"><Menu size={24} /></button>
                        <nav className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                           <span className="hover:text-white cursor-pointer transition-colors" onClick={() => setCurrentView('main')}>Studio</span>
                           <ChevronRight size={12} className="text-slate-500" />
                           <span className="text-slate-200">{currentView}</span>
                        </nav>
                    </div>
                    <div className="flex items-center gap-6">
                        <ThemeSwitch theme={theme} onToggleTheme={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} />
                        <div className="hidden sm:flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                            <div className="size-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.5)]"></div>
                            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Engine Online</span>
                        </div>
                    </div>
                </header>

                <div className="max-w-7xl mx-auto p-8 space-y-12 pb-32">
                    {currentView === 'main' && (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4 }}
                            className="space-y-16 py-8"
                        >
                            {analysisState === AnalysisState.IDLE ? (
                                <div className="space-y-16">
                                    <div className="text-center space-y-8 max-w-4xl mx-auto">
                                        <h1 className="text-5xl sm:text-7xl font-bold tracking-tighter leading-[1.1] text-white font-heading uppercase">
                                            Visual <br/>Intelligence <br/><span className="text-primary italic">for Prompters.</span>
                                        </h1>
                                        <p className="text-lg text-slate-300 font-medium leading-relaxed max-w-2xl mx-auto">
                                            Analyze cinematic motion and high-fidelity photos to extract perfect generation prompts for Sora, Kling, and Midjourney.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                        <div className="md:col-span-2 group p-[1px] rounded-[2rem] bg-gradient-to-br from-white/20 via-white/5 to-transparent shadow-2xl">
                                            <label className="block h-full bg-background-dark/40 rounded-[1.95rem] p-12 cursor-pointer hover:bg-white/5 transition-all duration-500 border border-white/5">
                                                <input type="file" className="hidden" accept="video/*,image/*" onChange={e => e.target.files?.[0] && handleFileSelect(e.target.files[0])} />
                                                <div className="flex flex-col items-center justify-center h-full text-center space-y-8">
                                                    <div className="size-24 bg-white/5 rounded-full flex items-center justify-center group-hover:scale-110 transition-all duration-500 shadow-inner border border-white/10">
                                                        <Sparkles className="size-10 text-white" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-2xl font-bold uppercase tracking-wider font-heading">Drop visual script</h3>
                                                        <p className="text-slate-400 mt-3 font-medium tracking-wide">MP4, MOV, RAW, JPEG up to 4K resolution</p>
                                                    </div>
                                                </div>
                                            </label>
                                        </div>

                                        <div className="flex flex-col gap-8">
                                            <div onClick={() => setIsLibraryOpen(true)} className="flex-1 p-8 rounded-[2rem] glassmorphic-card border-white/5 shadow-xl hover:-translate-y-2 cursor-pointer transition-all duration-500 group flex flex-col justify-between">
                                                <div className="size-14 bg-white/5 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:bg-white group-hover:text-background-dark transition-all duration-500">
                                                    <Library size={24} />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold uppercase tracking-wider font-heading mb-2">Library</h3>
                                                    <p className="text-xs text-slate-400 font-medium leading-relaxed">Browse 50+ curated templates for visual consistency.</p>
                                                </div>
                                            </div>
                                            <div onClick={() => setCurrentView('history')} className="flex-1 p-8 rounded-[2rem] glassmorphic-card border-white/5 shadow-xl hover:-translate-y-2 cursor-pointer transition-all duration-500 group flex flex-col justify-between">
                                                <div className="size-14 bg-white/5 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:bg-white group-hover:text-background-dark transition-all duration-500">
                                                    <History size={24} />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold uppercase tracking-wider font-heading mb-2">History</h3>
                                                    <p className="text-xs text-slate-400 font-medium leading-relaxed">Recover your previous visual engineering sessions.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <FAQ />
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                                    <div className="lg:col-span-5 space-y-8 sticky top-28">
                                        <div className="p-2 rounded-[2rem] glassmorphic-card border-white/10 shadow-2xl">
                                            <div className="aspect-video bg-black/40 rounded-[1.8rem] overflow-hidden ring-1 ring-white/10 shadow-inner relative flex items-center justify-center group">
                                                {file?.type.startsWith('video/') ? (
                                                    <video src={videoUrl} controls className="size-full object-contain" />
                                                ) : (
                                                    <img src={videoUrl} className="size-full object-contain" />
                                                )}
                                                <button onClick={resetState} className="absolute top-6 right-6 size-12 bg-black/80 rounded-full flex items-center justify-center hover:bg-rose-500 transition-all duration-300 opacity-0 group-hover:opacity-100"><X size={20} /></button>
                                            </div>
                                            <div className="px-6 py-5 flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                                                <span className="truncate max-w-[200px]">{file?.name}</span>
                                                <div className="flex gap-6">
                                                    {videoMeta?.isVideo && <span>{videoMeta?.duration}</span>}
                                                    <span>{videoMeta?.resolution}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {analysisState === AnalysisState.PREVIEW && (
                                            <div className="flex flex-col gap-4">
                                                <BlurryButton onClick={() => handleStartAnalysis()} className="!p-6 !text-lg uppercase tracking-widest font-heading"><Wand2 size={24} /> Engineer Prompt</BlurryButton>
                                                <BlurryButton onClick={handleStartVideoAnalysis} className="!p-6 !text-lg uppercase tracking-widest font-heading !bg-white/5 shadow-xl text-slate-300 hover:text-white"><Brain size={24} /> Scene Analytics</BlurryButton>
                                            </div>
                                        )}

                                        {analysisState === AnalysisState.PROCESSING && (
                                            <div className="p-10 rounded-[2.5rem] glassmorphic-card border-white/5 text-center space-y-8">
                                                <Loader2 className="size-16 mx-auto text-white animate-spin opacity-50" />
                                                <div className="space-y-6">
                                                    <p className="text-xl font-bold uppercase tracking-widest font-heading">{progressMessage}</p>
                                                    <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                                                        <div className="bg-white h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(255,255,255,0.5)]" style={{width:`${progress}%`}} />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="lg:col-span-7">
                                        <AnimatePresence mode="wait">
                                            {analysisState === AnalysisState.SUCCESS && (
                                                <motion.div 
                                                    initial={{ opacity: 0, x: 20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: -20 }}
                                                    transition={{ duration: 0.5 }}
                                                >
                                                    {resultType === 'prompt' ? (
                                                        <ResultsView 
                                                            file={file} videoUrl={videoUrl} videoMeta={videoMeta} generatedPrompt={generatedPrompt} structuredPrompt={structuredPrompt} isCopied={isCopied} isRefining={isRefining} isDetailing={isDetailing} refineTone={refineTone} refineStyle={refineStyle} refineCamera={refineCamera} refineLighting={refineLighting} refineInstruction={refineInstruction} negativePrompt={negativePrompt} setNegativePrompt={setNegativePrompt} handlePromptChange={e => setGeneratedPrompt(e.target.value)} handleCopy={t => {navigator.clipboard.writeText(t); setIsCopied(true); setTimeout(()=>setIsCopied(false),2000)}} handleRefinePrompt={async m => {
                                                                const isJson = structuredPrompt?.objective === 'JSON Format Output';
                                                                const inst = m === 'detail' ? 'Expand this prompt with extreme production-level detail. Focus on micro-textures, cinematic lighting nuances, specific camera lens characteristics, and atmospheric depth.' : `Tone: ${refineTone}, Style: ${refineStyle}, Camera: ${refineCamera}, Light: ${refineLighting}. ${refineInstruction}`;
                                                                m === 'detail' ? setIsDetailing(true) : setIsRefining(true);
                                                                const res = isJson ? await refineJsonPrompt(generatedPrompt, inst, negativePrompt) : await refinePrompt(generatedPrompt, inst, negativePrompt);
                                                                setGeneratedPrompt(res);
                                                                setIsDetailing(false); setIsRefining(false);
                                                            }} setRefineTone={setRefineTone} setRefineStyle={setRefineStyle} setRefineCamera={setRefineCamera} setRefineLighting={setRefineLighting} setRefineInstruction={setRefineInstruction} isTestingConsistency={isTestingConsistency} consistencyResult={consistencyResult} showConsistencyModal={showConsistencyModal} onTestConsistency={async () => {
                                                                setIsTestingConsistency(true); setShowConsistencyModal(true);
                                                                const res = structuredPrompt?.objective === 'JSON Format Output' ? await testJsonConsistency(generatedPrompt, extractedFrames) : await testPromptConsistency(generatedPrompt, extractedFrames);
                                                                setConsistencyResult(res); setIsTestingConsistency(false);
                                                            }} onCloseConsistencyModal={() => setShowConsistencyModal(false)} onApplyImprovements={p => {setGeneratedPrompt(p); setShowConsistencyModal(false)}} onRegenerate={handleStartAnalysis} hasOriginalFrames={extractedFrames.length > 0} error={error} isRemixing={isRemixing} remixStyle={remixStyle} setRemixStyle={setRemixStyle} handleRemixStyle={async () => {
                                                                setIsRemixing(true); const res = await remixVideoStyle(extractedFrames, remixStyle); setGeneratedPrompt(res); setIsRemixing(false);
                                                            }} isConvertingToJson={isConvertingToJson} onConvertToJason={async () => {
                                                                setIsConvertingToJson(true); const res = await convertPromptToJson(structuredPrompt!); setGeneratedPrompt(res); setStructuredPrompt(p => ({...p!, objective: 'JSON Format Output'})); setIsConvertingToJson(false);
                                                            }}
                                                        />
                                                    ) : <VideoAnalysisView file={file} videoUrl={videoUrl} videoMeta={videoMeta} analysisResult={videoAnalysisResult!} isCopied={isCopied} handleCopy={t => {navigator.clipboard.writeText(t); setIsCopied(true); setTimeout(()=>setIsCopied(false),2000)}} isGeneratingPrompt={isGeneratingPromptFromAnalysis} onGeneratePrompt={async () => {
                                                        setIsGeneratingPromptFromAnalysis(true); const res = await generatePromptFromAnalysis(videoAnalysisResult!); setGeneratedPrompt(res.core_focus); setStructuredPrompt(res); setResultType('prompt'); setIsGeneratingPromptFromAnalysis(false);
                                                    }} />}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {currentView === 'profile' && <ProfilePage />}
                    {currentView === 'settings' && <SettingsPage theme={theme} onToggleTheme={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} />}
                    {currentView === 'history' && <HistoryPage history={userHistory} onSelectHistoryItem={item => { resetState(); setAnalysisState(AnalysisState.SUCCESS); setResultType('prompt'); setStructuredPrompt(item.structuredPrompt); setGeneratedPrompt(item.prompt); setVideoUrl(item.thumbnail); setCurrentView('main'); }} />}
                </div>
            </main>

            <PromptLibrary isOpen={isLibraryOpen} onClose={() => setIsLibraryOpen(false)} onSelectPrompt={item => { resetState(); setAnalysisState(AnalysisState.SUCCESS); setResultType('prompt'); setStructuredPrompt(item.structuredPrompt); setGeneratedPrompt(item.prompt); setCurrentView('main'); }} />
        </div>
    );
};

export default App;