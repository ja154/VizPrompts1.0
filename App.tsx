
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AnalysisState, PromptHistoryItem, User, ConsistencyResult, StructuredPrompt } from './types.ts';
import { extractFramesFromVideo, imageToDataUrl, getVideoMetadata } from './utils/video.ts';
import { generateStructuredPromptFromFrames, refinePrompt, testPromptConsistency, refineJsonPrompt, testJsonConsistency, remixVideoStyle, convertPromptToJson, analyzeVideoContent, generatePromptFromAnalysis } from './services/geminiService.ts';
import { BrainCircuitIcon, FilmIcon, LibraryIcon, MenuIcon, HistoryIcon, DashboardIcon, LogoutIcon, UserIcon, MagicWandIcon, CloseIcon, ResetIcon, AlertIcon, ChevronLeftIcon, ChevronRightIcon, LogoIcon, SpinnerIcon, SettingsIcon } from './components/icons.tsx';
import BlurryButton from './components/Button.tsx';
import LogoLoader from './components/LogoLoader.tsx';
import UploaderIcon from './components/UploaderIcon.tsx';
import ThemeSwitch from './components/ThemeSwitch.tsx';
import Auth from './components/Auth.tsx';
import LoginPage from './components/LoginPage.tsx';
import { useAuth } from './hooks/useAuth';
import ResultsView from './components/ResultsView.tsx';
import VideoAnalysisView from './components/VideoAnalysisView.tsx';
import ProfilePage from './components/ProfilePage.tsx';
import SettingsPage from './components/SettingsPage.tsx';
import HistoryPage from './components/HistoryPage.tsx';
import UserMenu from './components/UserMenu.tsx';
import PromptLibrary from './components/PromptLibrary.tsx';
import { PromptTemplate } from './data/promptLibrary.ts';
import FAQ from './components/FAQ.tsx';


type Theme = 'light' | 'dark';
export type AppView = 'main' | 'profile' | 'history' | 'settings';
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
        e.currentTarget.classList.add('border-primary', 'bg-primary/5');
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.currentTarget.classList.remove('border-primary', 'bg-primary/5');
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.currentTarget.classList.remove('border-primary', 'bg-primary/5');
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            onFileSelect(e.dataTransfer.files[0]);
            e.dataTransfer.clearData();
        }
    };

    return (
        <div className="w-full flex flex-col justify-center min-h-[350px]">
            {analysisState === AnalysisState.IDLE && (
                <div
                    onClick={() => fileInputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className="w-full group border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-12 cursor-pointer hover:border-primary dark:hover:border-primary hover:bg-primary/5 transition-all duration-300 ease-in-out flex flex-col items-center justify-center"
                >
                    <div className="w-24 h-24 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 mb-6 bg-gray-100 dark:bg-white/5 rounded-full">
                        <UploaderIcon />
                    </div>
                    <h3 className="text-xl font-semibold transition-colors duration-300 group-hover:text-primary text-center">Drag & drop your media here</h3>
                    <p className="text-base text-gray-500 dark:text-gray-400 mt-2 text-center">or click to browse files</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-4 text-center">Supports MP4, MOV, WEBM, JPG, PNG (Max 200MB)</p>
                    <input type="file" ref={fileInputRef} onChange={(e) => e.target.files && onFileSelect(e.target.files[0])} className="hidden" accept="video/*,image/*" />
                </div>
            )}

            {analysisState === AnalysisState.PREVIEW && file && (
                <div className="animate-fade-in-slide-up w-full" style={{ animationDuration: '300ms' }}>
                    <h3 className="text-2xl font-bold mb-6 text-center">Ready to Analyze?</h3>
                    <div className="bg-black rounded-xl mb-6 overflow-hidden flex items-center justify-center aspect-video max-h-[400px] mx-auto border border-white/10 shadow-lg">
                        {file?.type.startsWith('video/') ? (
                            <video src={videoUrl} controls className="w-full h-full object-contain"></video>
                        ) : (
                            <img src={videoUrl} alt="Image Preview" className="w-full h-full object-contain" />
                        )}
                    </div>
                    <p className="text-center text-lg font-medium text-gray-700 dark:text-gray-200 truncate mb-8 px-4" title={file.name}>{file.name}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
                        <BlurryButton onClick={onStartAnalysis} className="w-full !py-4 !text-base">
                            <MagicWandIcon className="mr-3 w-6 h-6" />
                            Generate Prompt
                        </BlurryButton>
                        <BlurryButton onClick={onStartVideoAnalysis} className="w-full !py-4 !text-base">
                            <BrainCircuitIcon className="w-6 h-6 mr-3" />
                            Understand Video
                        </BlurryButton>
                    </div>
                     <div className="mt-6 text-center">
                        <button
                            onClick={onResetState}
                            className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white underline transition-colors"
                        >
                            Choose Another File
                        </button>
                    </div>
                </div>
            )}

            {analysisState === AnalysisState.PROCESSING && (
                <div className="animate-fade-in-slide-up w-full max-w-xl mx-auto py-12">
                    <div className="flex justify-between mb-4">
                        <span className="text-lg font-medium text-gray-700 dark:text-gray-200">{progressMessage || 'Processing media...'}</span>
                        <span className="text-lg font-bold text-primary">{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden shadow-inner">
                        <div className="bg-gradient-to-r from-primary to-purple-500 h-4 rounded-full transition-all duration-300 ease-out shadow-[0_0_10px_rgba(75,43,238,0.5)]" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>
            )}

            {analysisState === AnalysisState.ERROR && (
                <div className="text-center animate-fade-in-slide-up py-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/20 mb-6">
                        <AlertIcon className="text-red-500 w-10 h-10" />
                    </div>
                    <h3 className="text-2xl font-bold text-red-500 mb-3">Analysis Failed</h3>
                    <p className="text-center text-red-500/80 text-base p-4 rounded-lg mb-8 max-w-lg mx-auto border border-red-200 dark:border-red-800/30 bg-red-50 dark:bg-red-900/10">{error}</p>
                    <BlurryButton onClick={onResetState} className="!px-8 !py-3">
                        <ResetIcon className="w-5 h-5 mr-2" />
                        Try Another File
                    </BlurryButton>
                </div>
            )}
        </div>
    );
};

const AnalyzedFilePreview: React.FC<{file: File, videoUrl: string, onReset: () => void}> = ({ file, videoUrl, onReset }) => (
    <div className="glassmorphic-card rounded-xl p-4 sm:p-6 animate-fade-in-slide-up flex items-center justify-between gap-4 border border-white/20 dark:border-white/10 shadow-lg">
        <div className="flex items-center gap-4 overflow-hidden">
            <div className="w-24 h-16 bg-black rounded-lg overflow-hidden flex-shrink-0 border border-white/10 shadow-sm group relative">
                {file?.type.startsWith('video/') ? (
                    <video src={videoUrl} className="w-full h-full object-cover"></video>
                ) : (
                    <img src={videoUrl} alt="Preview" className="w-full h-full object-cover" />
                )}
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors"></div>
            </div>
            <div className="flex-grow overflow-hidden">
                <p className="font-bold truncate text-gray-900 dark:text-white text-lg" title={file.name}>{file.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">{file.type.split('/')[1]}</p>
            </div>
        </div>
        <button onClick={onReset} className="p-2.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-gray-400 hover:text-red-500 group" title="Close">
            <CloseIcon className="w-6 h-6 transition-transform group-hover:scale-110" />
        </button>
    </div>
);


const App: React.FC = () => {
    // Core App State
    const [theme, setTheme] = useState<Theme>('dark');
    const { currentUser, userHistory, addToHistory, logout, isLoading: isAuthLoading } = useAuth();
    const [hasEnteredAsGuest, setHasEnteredAsGuest] = useState(false);
    const [currentView, setCurrentView] = useState<AppView>('main');
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isLibraryOpen, setIsLibraryOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    
    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    // Handle logout to reset guest status as well
    const handleLogout = () => {
        logout();
        setHasEnteredAsGuest(false);
    };

    const handleNavigate = (view: AppView) => {
        setCurrentView(view);
        setIsSidebarOpen(false);
    };

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
            setExtractedFrames(frameDataUrls); 
            
            setProgressMessage('Analyzing with Gemini Pro...');
            
            progressInterval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 95) {
                        if (progressInterval) clearInterval(progressInterval);
                        return prev;
                    }
                    return prev + 1;
                });
            }, 200);

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
                    JSON.parse(generatedPrompt); 
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
            setResultType('prompt'); 
            
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
    
    const handleToggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
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

    // -----------------------------------------------------------------------
    // Gated Rendering Logic
    // -----------------------------------------------------------------------
    
    if (isAuthLoading) {
        return (
            <div className="flex h-screen w-full bg-background-light dark:bg-background-dark items-center justify-center">
                 <SpinnerIcon className="w-10 h-10 text-primary-light dark:text-primary-dark animate-spin" />
            </div>
        );
    }

    if (!currentUser && !hasEnteredAsGuest) {
        return (
            <>
                <div className="fixed top-4 right-4 z-50">
                    <ThemeSwitch theme={theme} onToggleTheme={handleToggleTheme} />
                </div>
                <LoginPage onGuestAccess={() => setHasEnteredAsGuest(true)} />
            </>
        );
    }

    return (
        <div className="relative flex h-screen w-full overflow-hidden group/design-root dark:bg-background-dark bg-background-light" style={{backgroundImage: 'radial-gradient(circle at top left, rgba(75, 43, 238, 0.2), transparent 40%), radial-gradient(circle at bottom right, rgba(0, 123, 255, 0.2), transparent 40%)'}}>
            <video ref={videoRef} src={videoUrl} className="hidden" crossOrigin="anonymous" playsInline onLoadedData={() => { if (analysisState === AnalysisState.PROCESSING && file?.type.startsWith('video/')) { /* loaded */ } }} onError={() => { /* handle error */ }} />
            <canvas ref={canvasRef} className="hidden" />
            
            {/* Modals */}
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
            
            {/* Mobile Sidebar Backdrop */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 sm:hidden" 
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`group/sidebar fixed sm:relative z-30 h-full flex flex-col justify-between p-3 glassmorphic-sidebar transition-all duration-300 ease-in-out w-60 sm:w-20 sm:hover:w-60 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full sm:translate-x-0'} flex-shrink-0 overflow-hidden hover:shadow-2xl hover:shadow-black/20`}>
                <div>
                    {/* Sidebar Header / Logo */}
                    <div className="mb-6 flex h-14 items-center gap-4 px-2 cursor-pointer overflow-hidden" onClick={() => handleNavigate('main')}>
                        <div className="size-8 text-primary shrink-0">
                            <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><path clipRule="evenodd" d="M12.0799 24L4 19.2479L9.95537 8.75216L18.04 13.4961L18.0446 4H29.9554L29.96 13.4961L38.0446 8.75216L44 19.2479L35.92 24L44 28.7521L38.0446 39.2479L29.96 34.5039L29.9554 44H18.0446L18.04 34.5039L9.95537 39.2479L4 28.7521L12.0799 24Z" fill="currentColor" fillRule="evenodd"></path></svg>
                        </div>
                        <h2 className="text-xl font-bold leading-tight tracking-[-0.015em] transition-opacity duration-200 opacity-100 sm:opacity-0 sm:group-hover/sidebar:opacity-100 whitespace-nowrap text-gray-900 dark:text-white">VizPrompts</h2>
                    </div>

                    {/* Navigation */}
                    <nav className="flex flex-col gap-2">
                        <button onClick={() => handleNavigate('main')} className={`relative flex h-12 items-center gap-4 whitespace-nowrap rounded-lg px-4 overflow-hidden ${currentView === 'main' ? 'text-white bg-primary shadow-lg shadow-primary/30' : 'text-gray-500 dark:text-gray-300 transition-colors hover:bg-black/5 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white'}`}>
                            <span className="material-symbols-outlined shrink-0">dashboard</span>
                            <span className="font-medium transition-opacity duration-200 opacity-100 sm:opacity-0 sm:group-hover/sidebar:opacity-100">Dashboard</span>
                        </button>
                        
                        <button onClick={() => setIsLibraryOpen(true)} className={`relative flex h-12 items-center gap-4 whitespace-nowrap rounded-lg px-4 overflow-hidden text-gray-500 dark:text-gray-300 transition-colors hover:bg-black/5 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white`}>
                                <span className="material-symbols-outlined shrink-0">library_books</span>
                            <span className="font-medium transition-opacity duration-200 opacity-100 sm:opacity-0 sm:group-hover/sidebar:opacity-100">Templates</span>
                        </button>

                        <button onClick={() => handleNavigate('history')} className={`relative flex h-12 items-center gap-4 whitespace-nowrap rounded-lg px-4 overflow-hidden ${currentView === 'history' ? 'text-white bg-primary shadow-lg shadow-primary/30' : 'text-gray-500 dark:text-gray-300 transition-colors hover:bg-black/5 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white'}`}>
                            <span className="material-symbols-outlined shrink-0">history</span>
                            <span className="font-medium transition-opacity duration-200 opacity-100 sm:opacity-0 sm:group-hover/sidebar:opacity-100">History</span>
                        </button>

                        <button onClick={() => handleNavigate('profile')} className={`relative flex h-12 items-center gap-4 whitespace-nowrap rounded-lg px-4 overflow-hidden ${currentView === 'profile' ? 'text-white bg-primary shadow-lg shadow-primary/30' : 'text-gray-500 dark:text-gray-300 transition-colors hover:bg-black/5 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white'}`}>
                            <span className="material-symbols-outlined shrink-0">person</span>
                            <span className="font-medium transition-opacity duration-200 opacity-100 sm:opacity-0 sm:group-hover/sidebar:opacity-100">Profile</span>
                        </button>

                        <button onClick={() => handleNavigate('settings')} className={`relative flex h-12 items-center gap-4 whitespace-nowrap rounded-lg px-4 overflow-hidden ${currentView === 'settings' ? 'text-white bg-primary shadow-lg shadow-primary/30' : 'text-gray-500 dark:text-gray-300 transition-colors hover:bg-black/5 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white'}`}>
                            <SettingsIcon className="shrink-0 h-6 w-6" />
                            <span className="font-medium transition-opacity duration-200 opacity-100 sm:opacity-0 sm:group-hover/sidebar:opacity-100">Settings</span>
                        </button>
                    </nav>
                </div>

                {/* Footer Actions (Logout) */}
                <div>
                    <button onClick={currentUser ? handleLogout : () => setIsAuthModalOpen(true)} className="relative flex h-12 items-center gap-4 whitespace-nowrap rounded-lg px-4 text-gray-500 dark:text-gray-300 transition-colors hover:bg-black/5 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white w-full overflow-hidden">
                        <span className="material-symbols-outlined shrink-0">{currentUser ? 'logout' : 'login'}</span>
                        <span className="font-medium transition-opacity duration-200 opacity-100 sm:opacity-0 sm:group-hover/sidebar:opacity-100">{currentUser ? 'Logout' : 'Sign In'}</span>
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT LAYOUT */}
            <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
                
                {/* HEADER */}
                <header className="flex-shrink-0 flex items-center justify-between whitespace-nowrap px-4 sm:px-6 py-4 mb-2 z-10">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 sm:hidden text-gray-500 dark:text-gray-300">
                            <MenuIcon className="h-6 w-6" />
                        </button>
                        <h1 className="text-xl font-bold leading-tight tracking-[-0.015em] hidden sm:block text-gray-900 dark:text-white">
                            {currentView === 'main' && 'Dashboard'}
                            {currentView === 'history' && 'History'}
                            {currentView === 'profile' && 'Profile'}
                            {currentView === 'settings' && 'Settings'}
                        </h1>
                    </div>
                    
                    {/* Search Bar (Visual Only) */}
                    <div className="flex flex-1 justify-center items-center gap-6 px-8 hidden md:flex">
                        <div className="relative w-full max-w-xl">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                            <input className="form-input w-full rounded-full border-0 bg-gray-100 dark:bg-white/5 py-2.5 pl-12 pr-4 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary/80 transition-all duration-300 ease-in-out focus:scale-[1.02] text-gray-800 dark:text-gray-200" placeholder="Search prompts or media..." type="text"/>
                        </div>
                    </div>

                    {/* Right Actions */}
                    <div className="flex justify-end items-center gap-4">
                        <ThemeSwitch theme={theme} onToggleTheme={handleToggleTheme} />
                        {currentUser && (
                            <div 
                                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 ring-2 ring-primary/20 cursor-pointer hover:ring-primary/50 transition-all" 
                                onClick={() => handleNavigate('profile')} 
                                style={{backgroundImage: `url("${currentUser.profilePicture || ''}")`}}
                                title="View Profile"
                            ></div>
                        )}
                    </div>
                </header>

                {/* MAIN VIEW CONTENT (Scrollable) */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 scroll-smooth custom-scrollbar">
                    <div className="max-w-7xl mx-auto w-full flex flex-col gap-8 pb-20">
                        {currentView === 'main' && (
                            <>
                                {/* Dashboard Welcome */}
                                {analysisState === AnalysisState.IDLE && (
                                    <div className="flex flex-wrap justify-between gap-4 px-4 sm:px-0 mb-4 animate-fade-in-slide-up">
                                        <p className="text-3xl sm:text-4xl font-black leading-tight tracking-[-0.033em] min-w-72 text-gray-900 dark:text-white">
                                            Welcome, {currentUser?.fullName ? currentUser.fullName.split(' ')[0] : 'Creator'}!
                                        </p>
                                        <p className="text-gray-500 dark:text-gray-400 max-w-2xl text-lg mt-2">
                                            Upload an image or video to generate production-ready prompts or get deep insights with AI analysis.
                                        </p>
                                    </div>
                                )}
                                
                                {/* Main Content Wrapper */}
                                <div className={`w-full ${analysisState === AnalysisState.IDLE ? 'max-w-4xl mx-auto bg-white/60 dark:bg-[#221933]/80 rounded-2xl shadow-2xl shadow-black/30 backdrop-blur-sm border border-black/10 dark:border-[#2f2348] p-6 sm:p-8' : ''}`}>
                                    {analysisState === AnalysisState.IDLE ? (
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
                                    ) : (
                                        <div className={`grid grid-cols-1 ${analysisState === AnalysisState.SUCCESS ? 'lg:grid-cols-1 xl:grid-cols-2' : 'lg:grid-cols-1 max-w-4xl mx-auto'} gap-8`}>
                                            {analysisState === AnalysisState.SUCCESS ? (
                                                <div className="space-y-8 animate-fade-in-slide-up">
                                                    <AnalyzedFilePreview file={file!} videoUrl={videoUrl} onReset={resetState} />
                                                    <div className="glassmorphic-card rounded-xl p-6">
                                                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                                                            <LibraryIcon className="w-5 h-5 text-primary" />
                                                            Need Inspiration?
                                                        </h3>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                                                            Explore our curated library of high-quality prompts to kickstart your creative process.
                                                        </p>
                                                        <BlurryButton onClick={() => setIsLibraryOpen(true)} className="w-full">
                                                            Explore Library
                                                        </BlurryButton>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="w-full bg-white/60 dark:bg-[#221933]/80 rounded-2xl shadow-2xl shadow-black/30 backdrop-blur-sm border border-black/10 dark:border-[#2f2348] p-6 sm:p-8">
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
                                                </div>
                                            )}

                                            {/* Result Column */}
                                            {analysisState === AnalysisState.SUCCESS && (
                                                <div className="space-y-8">
                                                    {resultType === 'prompt' && structuredPrompt ? (
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
                                                    ) : resultType === 'video_analysis' && videoAnalysisResult ? (
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
                                                    ) : null}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                
                                {/* FAQ if idle */}
                                {analysisState === AnalysisState.IDLE && <FAQ />}
                            </>
                        )}

                        {currentView === 'profile' && <ProfilePage />}
                        {currentView === 'settings' && <SettingsPage theme={theme} onToggleTheme={handleToggleTheme} />}
                        {currentView === 'history' && <HistoryPage history={userHistory} onSelectHistoryItem={handleSelectHistoryItem} />}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default App;
