import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AnalysisState, PromptHistoryItem, User, ConsistencyResult, StructuredPrompt } from './types.ts';
import { extractFramesFromVideo, imageToDataUrl, getVideoMetadata } from './utils/video.ts';
import { generateStructuredPromptFromFrames, refinePrompt, testPromptConsistency, refineJsonPrompt, testJsonConsistency, remixVideoStyle, convertPromptToJson, analyzeVideoContent, generatePromptFromAnalysis } from './services/geminiService.ts';
import { BrainCircuitIcon, FilmIcon, PlusCircleIcon, LibraryIcon, MenuIcon, HistoryIcon, DashboardIcon, LogoutIcon, UserIcon } from './components/icons.tsx';
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
        <div className="glassmorphic-card rounded-xl p-8 min-h-[350px] flex flex-col justify-center">
            {analysisState === AnalysisState.IDLE && (
                <div
                    onClick={() => fileInputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className="w-full group border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 cursor-pointer hover:border-primary dark:hover:border-primary hover:bg-primary/5 transition-all duration-300 ease-in-out flex flex-col items-center justify-center"
                >
                    <div className="w-20 h-20 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 mb-4">
                        <UploaderIcon />
                    </div>
                    <h3 className="text-lg font-medium transition-colors duration-300 group-hover:text-primary">Drag & drop your video or image here</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">or click to browse files</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">Supports MP4, MOV, WEBM, JPG, PNG (Max 200MB)</p>
                    <input type="file" ref={fileInputRef} onChange={(e) => e.target.files && onFileSelect(e.target.files[0])} className="hidden" accept="video/*,image/*" />
                </div>
            )}

            {analysisState === AnalysisState.PREVIEW && file && (
                <div className="animate-fade-in-slide-up w-full" style={{ animationDuration: '300ms' }}>
                    <h3 className="text-xl font-bold mb-4 text-center">Ready to Analyze?</h3>
                    <div className="bg-black rounded-lg mb-4 overflow-hidden flex items-center justify-center aspect-video max-h-64 mx-auto">
                        {file?.type.startsWith('video/') ? (
                            <video src={videoUrl} controls className="w-full h-full object-contain"></video>
                        ) : (
                            <img src={videoUrl} alt="Image Preview" className="w-full h-full object-contain" />
                        )}
                    </div>
                    <p className="text-center text-sm font-medium text-gray-600 dark:text-gray-300 truncate mb-6" title={file.name}>{file.name}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <BlurryButton onClick={onStartAnalysis} className="w-full">
                            <span className="fas fa-magic mr-2"></span>
                            Generate Prompt
                        </BlurryButton>
                        <BlurryButton onClick={onStartVideoAnalysis} className="w-full">
                            <BrainCircuitIcon className="w-5 h-5 mr-2" />
                            Understand Video
                        </BlurryButton>
                    </div>
                     <div className="mt-4 text-center">
                        <button
                            onClick={onResetState}
                            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white underline transition-colors"
                        >
                            Choose Another File
                        </button>
                    </div>
                </div>
            )}

            {analysisState === AnalysisState.PROCESSING && (
                <div className="animate-fade-in-slide-up w-full">
                    <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{progressMessage || 'Processing media...'}</span>
                        <span className="text-sm font-medium text-primary">{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                        <div className="bg-primary h-2.5 rounded-full transition-all duration-300 ease-out" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>
            )}

            {analysisState === AnalysisState.ERROR && (
                <div className="text-center animate-fade-in-slide-up">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
                        <span className="fas fa-exclamation-triangle text-2xl text-red-500"></span>
                    </div>
                    <h3 className="text-xl font-bold text-red-500 mb-2">Analysis Failed</h3>
                    <p className="text-center text-red-500/80 text-sm p-3 rounded-lg mb-6 max-w-md mx-auto">{error}</p>
                    <BlurryButton onClick={onResetState}>
                        <span className="fas fa-undo mr-2"></span>
                        Try Another File
                    </BlurryButton>
                </div>
            )}
        </div>
    );
};

const AnalyzedFilePreview: React.FC<{file: File, videoUrl: string, onReset: () => void}> = ({ file, videoUrl, onReset }) => (
    <div className="glassmorphic-card rounded-xl p-6 animate-fade-in-slide-up flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 overflow-hidden">
            <div className="w-20 h-14 bg-black rounded-lg overflow-hidden flex-shrink-0 border border-white/10">
                {file?.type.startsWith('video/') ? (
                    <video src={videoUrl} className="w-full h-full object-cover"></video>
                ) : (
                    <img src={videoUrl} alt="Preview" className="w-full h-full object-cover" />
                )}
            </div>
            <div className="flex-grow overflow-hidden">
                <p className="font-bold truncate" title={file.name}>{file.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">{file.type.split('/')[1]}</p>
            </div>
        </div>
        <button onClick={onReset} className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary">
            <span className="fas fa-times text-lg"></span>
        </button>
    </div>
);

const App: React.FC = () => {
    // Core App State
    const [theme, setTheme] = useState<Theme>('dark');
    const { currentUser, userHistory, addToHistory, logout } = useAuth();
    const [currentView, setCurrentView] = useState<AppView>('main');
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [selectedHistoryItem, setSelectedHistoryItem] = useState<PromptHistoryItem | null>(null);
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
        setIsSidebarOpen(false); // Close sidebar on mobile nav
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
        <div className="flex h-screen w-full bg-background-light dark:bg-background-dark text-gray-900 dark:text-white overflow-hidden font-sans selection:bg-primary/30">
            <PatternBackground />

            {/* Mobile Sidebar Backdrop */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden animate-fade-in-slide-up" 
                    style={{animationDuration: '200ms'}}
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed md:static z-50 h-full w-64 glassmorphic-sidebar border-r border-white/20 flex flex-col justify-between transition-transform duration-300 ease-in-out
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                <div className="p-6">
                     <div onClick={() => handleNavigate('main')} className="flex items-center gap-3 cursor-pointer group mb-10">
                        <LogoLoader /> 
                        <div className="font-display font-bold text-xl tracking-tight group-hover:text-primary transition-colors">VizPrompts</div>
                    </div>
                    
                    <nav className="space-y-2">
                        <button onClick={() => handleNavigate('main')} className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group ${currentView === 'main' ? 'bg-primary text-white shadow-lg shadow-primary/25' : 'text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10'}`}>
                            <DashboardIcon className="w-6 h-6" />
                            <span className="font-medium">Dashboard</span>
                        </button>
                        <button onClick={() => setIsLibraryOpen(true)} className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10 transition-all duration-200 group">
                             <LibraryIcon className="w-6 h-6 group-hover:text-primary transition-colors" />
                            <span className="font-medium">Templates</span>
                        </button>
                         <button onClick={() => handleNavigate('history')} className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group ${currentView === 'history' ? 'bg-primary text-white shadow-lg shadow-primary/25' : 'text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10'}`}>
                            <HistoryIcon className="w-6 h-6 group-hover:text-primary transition-colors" />
                            <span className="font-medium">History</span>
                        </button>
                    </nav>
                </div>

                <div className="p-6 border-t border-gray-200 dark:border-white/10 space-y-2">
                     {currentUser ? (
                         <button onClick={logout} className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-all duration-200 group">
                             <LogoutIcon className="w-6 h-6" />
                            <span className="font-medium">Logout</span>
                        </button>
                     ) : (
                        <button onClick={() => setIsAuthModalOpen(true)} className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-primary/10 hover:text-primary transition-all duration-200 group">
                             <UserIcon className="w-6 h-6" />
                            <span className="font-medium">Sign In</span>
                        </button>
                     )}
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                {/* Header */}
                <header className="h-20 glassmorphic flex items-center justify-between px-6 sm:px-10 shrink-0 z-30">
                     <div className="flex items-center gap-4">
                        <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                            <MenuIcon className="w-6 h-6 text-gray-700 dark:text-white" />
                        </button>
                        <h1 className="text-xl font-display font-bold hidden sm:block">
                            {currentView === 'main' && 'Dashboard'}
                            {currentView === 'history' && 'History'}
                            {currentView === 'profile' && 'Profile'}
                        </h1>
                     </div>

                     <div className="flex items-center gap-4 sm:gap-6">
                        <ThemeSwitch theme={theme} onToggleTheme={handleToggleTheme} />
                        {currentUser && (
                            <div className="h-8 w-[1px] bg-gray-300 dark:bg-white/20"></div>
                        )}
                        {currentUser ? (
                            <UserMenu currentUser={currentUser} onNavigate={handleNavigate} onLogout={logout} />
                        ) : null}
                     </div>
                </header>

                {/* Scrollable Content Area */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-8 md:p-10">
                    <div className="max-w-7xl mx-auto space-y-8">
                        {/* View Routing */}
                        {currentView === 'main' && (
                             <>
                                {analysisState === AnalysisState.IDLE && (
                                    <div className="text-center mb-10 animate-fade-in-slide-up">
                                        <h2 className="text-3xl sm:text-4xl font-bold font-display tracking-tight mb-4">
                                            What will you create today?
                                        </h2>
                                        <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-lg">
                                            Upload an image or video to generate production-ready prompts or get deep insights with AI analysis.
                                        </p>
                                    </div>
                                )}

                                <div className={`grid grid-cols-1 ${analysisState === AnalysisState.SUCCESS ? 'lg:grid-cols-1 xl:grid-cols-2' : 'lg:grid-cols-1 max-w-4xl mx-auto'} gap-8`}>
                                     {analysisState === AnalysisState.SUCCESS ? (
                                        <div className="space-y-8 animate-fade-in-slide-up">
                                            <AnalyzedFilePreview file={file!} videoUrl={videoUrl} onReset={resetState} />
                                            <div className="glassmorphic-card rounded-xl p-6">
                                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
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
                                {analysisState === AnalysisState.IDLE && <FAQ />}
                            </>
                        )}

                        {currentView === 'profile' && <ProfilePage />}
                        {currentView === 'history' && <HistoryPage history={userHistory} onSelectHistoryItem={handleSelectHistoryItem} />}
                    </div>
                </main>
            </div>

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
        </div>
    );
};

export default App;