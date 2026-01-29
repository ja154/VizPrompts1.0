import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AnalysisState, PromptHistoryItem, User, ConsistencyResult, StructuredPrompt } from './types.ts';
import { extractFramesFromVideo, imageToDataUrl, getVideoMetadata } from './utils/video.ts';
import { generateStructuredPromptFromFrames, refinePrompt, testPromptConsistency, refineJsonPrompt, testJsonConsistency, remixVideoStyle, convertPromptToJson, analyzeVideoContent, generatePromptFromAnalysis } from './services/geminiService.ts';
import { BrainCircuitIcon, FilmIcon, MenuIcon, HistoryIcon, LogoutIcon, UserIcon, MagicWandIcon, CloseIcon, ResetIcon, SpinnerIcon, SettingsIcon, LayoutIcon } from './components/icons.tsx';
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
import { PromptTemplate } from './data/promptLibrary.ts';
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
    const [videoMeta, setVideoMeta] = useState<{ duration: string, resolution: string } | null>(null);
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
                setVideoMeta({ duration: `${Math.floor(meta.duration/60)}:${Math.floor(meta.duration%60).toString().padStart(2,'0')}`, resolution: `${meta.width}x${meta.height}` });
            } else {
                const dataUrl = await imageToDataUrl(selectedFile);
                setVideoUrl(dataUrl);
            }
            setAnalysisState(AnalysisState.PREVIEW);
        } catch (err) { setError('Failed to load file.'); }
    };

    const handleStartAnalysis = async () => {
        setAnalysisState(AnalysisState.PROCESSING);
        setResultType('prompt');
        try {
            const frames = file?.type.startsWith('video/') ? await extractFramesFromVideo(file, 8, p => setProgress(p*0.5)) : [videoUrl];
            setExtractedFrames(frames);
            const result = await generateStructuredPromptFromFrames(frames, setProgressMessage);
            setGeneratedPrompt(result.core_focus);
            setStructuredPrompt(result);
            addToHistory({ id: Date.now().toString(), prompt: result.core_focus, structuredPrompt: result, thumbnail: frames[0], timestamp: new Date().toISOString() });
            setAnalysisState(AnalysisState.SUCCESS);
        } catch (err) { setAnalysisState(AnalysisState.ERROR); setError('API Error.'); }
    };

    const handleStartVideoAnalysis = async () => {
        setAnalysisState(AnalysisState.PROCESSING);
        setResultType('video_analysis');
        try {
            const frames = file?.type.startsWith('video/') ? await extractFramesFromVideo(file, 8, p => setProgress(p*0.5)) : [videoUrl];
            setExtractedFrames(frames);
            const result = await analyzeVideoContent(frames, setProgressMessage);
            setVideoAnalysisResult(result);
            setAnalysisState(AnalysisState.SUCCESS);
        } catch (err) { setAnalysisState(AnalysisState.ERROR); setError('API Error.'); }
    };

    if (isAuthLoading) return <div className="h-screen flex items-center justify-center bg-black"><SpinnerIcon className="size-10 text-primary" /></div>;
    if (!currentUser && !hasEnteredAsGuest) return <LoginPage onGuestAccess={() => setHasEnteredAsGuest(true)} />;

    return (
        <div className="flex h-screen w-full bg-background-light dark:bg-background-dark font-sans text-gray-900 dark:text-white transition-colors duration-300">
            {/* Sidebar */}
            <aside className={`fixed sm:relative z-50 h-full flex flex-col p-4 glassmorphic-sidebar transition-all duration-300 ${isSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full sm:translate-x-0 sm:w-20 hover:w-64'} group/sidebar`}>
                <div className="flex items-center gap-4 mb-10 px-2 overflow-hidden cursor-pointer" onClick={() => setCurrentView('main')}>
                    <div className="size-10 bg-primary rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-primary/40">
                        <span className="material-symbols-outlined">bolt</span>
                    </div>
                    <span className="text-xl font-black transition-opacity opacity-0 group-hover/sidebar:opacity-100 sm:group-hover/sidebar:opacity-100">VizPrompts</span>
                </div>

                <nav className="flex-1 space-y-2">
                    {[
                        { id: 'main', icon: 'dashboard', label: 'Dashboard' },
                        { id: 'library', icon: 'auto_awesome_motion', label: 'Library', action: () => setIsLibraryOpen(true) },
                        { id: 'history', icon: 'history', label: 'History' },
                        { id: 'profile', icon: 'person', label: 'Profile' },
                        { id: 'settings', icon: 'settings', label: 'Settings' }
                    ].map(item => (
                        <button key={item.id} onClick={item.action || (() => setCurrentView(item.id as any))} className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all ${currentView === item.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-400 hover:bg-black/5 dark:hover:bg-white/5'}`}>
                            <span className="material-symbols-outlined shrink-0">{item.icon}</span>
                            <span className="font-bold whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100">{item.label}</span>
                        </button>
                    ))}
                </nav>

                <button onClick={logout} className="flex items-center gap-4 p-3 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-all mt-auto">
                    <span className="material-symbols-outlined shrink-0">logout</span>
                    <span className="font-bold opacity-0 group-hover/sidebar:opacity-100">Logout</span>
                </button>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto scroll-smooth">
                <header className="flex items-center justify-between p-6 sticky top-0 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md z-40">
                    <button onClick={() => setIsSidebarOpen(true)} className="sm:hidden material-symbols-outlined">menu</button>
                    <div className="hidden sm:block">
                        <h2 className="text-sm font-black uppercase tracking-widest text-gray-400">VizPrompts Pro Studio</h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <ThemeSwitch theme={theme} onToggleTheme={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} />
                        <div className="size-10 rounded-full border-2 border-primary/20 p-0.5"><UserIcon imgSrc={currentUser?.profilePicture} className="size-full rounded-full" /></div>
                    </div>
                </header>

                <div className="max-w-7xl mx-auto p-6 space-y-8 pb-20">
                    {currentView === 'main' && (
                        <>
                            {analysisState === AnalysisState.IDLE ? (
                                <div className="space-y-12 py-10">
                                    <div className="text-center space-y-4 max-w-2xl mx-auto animate-fade-in-slide-up">
                                        <h1 className="text-5xl font-black tracking-tight leading-tight">Video-to-Prompt Intelligence</h1>
                                        <p className="text-lg text-gray-400">Turn cinematic motion into production-ready prompts for MJ, Sora, and Kling.</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in-slide-up animation-delay-100">
                                        <div onClick={() => setIsLibraryOpen(true)} className="p-8 rounded-3xl bg-white/60 dark:bg-black/20 border border-black/5 dark:border-white/5 shadow-xl hover:scale-[1.02] cursor-pointer transition-all group">
                                            <div className="size-12 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-500 mb-6 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                                                <LayoutIcon />
                                            </div>
                                            <h3 className="text-xl font-bold mb-2">Prompt Library</h3>
                                            <p className="text-sm text-gray-400">Browse curated templates for cinematic consistency.</p>
                                        </div>
                                        <div className="col-span-1 md:col-span-2 relative group p-1 bg-gradient-to-br from-primary via-purple-500 to-pink-500 rounded-3xl shadow-2xl overflow-hidden shadow-primary/20">
                                            <label className="block bg-white dark:bg-[#0a0a0a] rounded-[1.35rem] p-8 h-full cursor-pointer hover:bg-transparent transition-colors">
                                                <input type="file" className="hidden" onChange={e => e.target.files?.[0] && handleFileSelect(e.target.files[0])} />
                                                <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                                                    <div className="size-16 bg-primary/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform"><span className="material-symbols-outlined text-4xl text-primary">upload_file</span></div>
                                                    <div>
                                                        <h3 className="text-2xl font-black group-hover:text-white transition-colors">Drop your creative here</h3>
                                                        <p className="text-gray-400">Supports 4K MP4, MOV, and high-res stills</p>
                                                    </div>
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                    <FAQ />
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                                    <div className="lg:col-span-5 space-y-6">
                                        <div className="p-4 rounded-3xl bg-white/40 dark:bg-black/40 border border-black/5 dark:border-white/5 backdrop-blur-xl">
                                            <div className="aspect-video bg-black rounded-2xl overflow-hidden ring-1 ring-white/10 shadow-2xl relative">
                                                {file?.type.startsWith('video/') ? <video src={videoUrl} controls className="size-full object-contain" /> : <img src={videoUrl} className="size-full object-contain" />}
                                                <button onClick={resetState} className="absolute top-4 right-4 size-10 bg-black/60 rounded-full flex items-center justify-center hover:bg-red-500 transition-colors"><CloseIcon /></button>
                                            </div>
                                            <div className="p-4 flex justify-between items-center text-xs font-bold text-gray-400">
                                                <span className="uppercase tracking-widest">{file?.name}</span>
                                                <div className="flex gap-4">
                                                    <span>{videoMeta?.duration}</span>
                                                    <span>{videoMeta?.resolution}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {analysisState === AnalysisState.PREVIEW && (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-scale-in">
                                                <BlurryButton onClick={handleStartAnalysis} className="!p-5 !text-lg"><MagicWandIcon className="size-6" /> Generate Prompt</BlurryButton>
                                                <BlurryButton onClick={handleStartVideoAnalysis} className="!p-5 !text-lg"><BrainCircuitIcon className="size-6" /> Deep Analysis</BlurryButton>
                                            </div>
                                        )}

                                        {analysisState === AnalysisState.PROCESSING && (
                                            <div className="p-8 rounded-3xl bg-white/40 dark:bg-black/40 border border-black/5 dark:border-white/5 text-center space-y-6">
                                                <SpinnerIcon className="size-16 mx-auto text-primary" />
                                                <div className="space-y-2">
                                                    <p className="text-xl font-bold">{progressMessage}</p>
                                                    <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-1.5 overflow-hidden"><div className="bg-primary h-full transition-all" style={{width:`${progress}%`}} /></div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="lg:col-span-7">
                                        {analysisState === AnalysisState.SUCCESS && (
                                            <div className="animate-fade-in-slide-up">
                                                {resultType === 'prompt' ? (
                                                    <ResultsView 
                                                        file={file} videoUrl={videoUrl} videoMeta={videoMeta} generatedPrompt={generatedPrompt} structuredPrompt={structuredPrompt} isCopied={isCopied} isRefining={isRefining} isDetailing={isDetailing} refineTone={refineTone} refineStyle={refineStyle} refineCamera={refineCamera} refineLighting={refineLighting} refineInstruction={refineInstruction} negativePrompt={negativePrompt} setNegativePrompt={setNegativePrompt} handlePromptChange={e => setGeneratedPrompt(e.target.value)} handleCopy={t => {navigator.clipboard.writeText(t); setIsCopied(true); setTimeout(()=>setIsCopied(false),2000)}} handleRefinePrompt={async m => {
                                                            const isJson = structuredPrompt?.objective === 'JSON Format Output';
                                                            const inst = m === 'detail' ? 'Add extreme detail' : `Tone: ${refineTone}, Style: ${refineStyle}, Camera: ${refineCamera}, Light: ${refineLighting}. ${refineInstruction}`;
                                                            m === 'detail' ? setIsDetailing(true) : setIsRefining(true);
                                                            const res = isJson ? await refineJsonPrompt(generatedPrompt, inst, negativePrompt) : await refinePrompt(generatedPrompt, inst, negativePrompt);
                                                            setGeneratedPrompt(res);
                                                            setIsDetailing(false); setIsRefining(false);
                                                        }} setRefineTone={setRefineTone} setRefineStyle={setRefineStyle} setRefineCamera={setRefineCamera} setRefineLighting={setRefineLighting} setRefineInstruction={setRefineInstruction} isTestingConsistency={isTestingConsistency} consistencyResult={consistencyResult} showConsistencyModal={showConsistencyModal} onTestConsistency={async () => {
                                                            setIsTestingConsistency(true); setShowConsistencyModal(true);
                                                            const res = structuredPrompt?.objective === 'JSON Format Output' ? await testJsonConsistency(generatedPrompt, extractedFrames) : await testPromptConsistency(generatedPrompt, extractedFrames);
                                                            setConsistencyResult(res); setIsTestingConsistency(false);
                                                        }} onCloseConsistencyModal={() => setShowConsistencyModal(false)} onApplyImprovements={p => {setGeneratedPrompt(p); setShowConsistencyModal(false)}} hasOriginalFrames={extractedFrames.length > 0} error={error} isRemixing={isRemixing} remixStyle={remixStyle} setRemixStyle={setRemixStyle} handleRemixStyle={async () => {
                                                            setIsRemixing(true); const res = await remixVideoStyle(extractedFrames, remixStyle); setGeneratedPrompt(res); setIsRemixing(false);
                                                        }} isConvertingToJson={isConvertingToJson} onConvertToJason={async () => {
                                                            setIsConvertingToJson(true); const res = await convertPromptToJson(structuredPrompt!); setGeneratedPrompt(res); setStructuredPrompt(p => ({...p!, objective: 'JSON Format Output'})); setIsConvertingToJson(false);
                                                        }}
                                                    />
                                                ) : <VideoAnalysisView file={file} videoUrl={videoUrl} videoMeta={videoMeta} analysisResult={videoAnalysisResult!} isCopied={isCopied} handleCopy={t => {navigator.clipboard.writeText(t); setIsCopied(true); setTimeout(()=>setIsCopied(false),2000)}} isGeneratingPrompt={isGeneratingPromptFromAnalysis} onGeneratePrompt={async () => {
                                                    setIsGeneratingPromptFromAnalysis(true); const res = await generatePromptFromAnalysis(videoAnalysisResult!); setGeneratedPrompt(res.core_focus); setStructuredPrompt(res); setResultType('prompt'); setIsGeneratingPromptFromAnalysis(false);
                                                }} />}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </>
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