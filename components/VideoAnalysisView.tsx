
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, Film, Copy, Check, Wand2, Loader2, AlertCircle, X } from 'lucide-react';
import BlurryButton from './Button';
import AnalysisStatus from './AnalysisStatus.tsx';
import { AnalysisState } from '../types.ts';

interface VideoAnalysisViewProps {
    file: File | null;
    videoUrl: string;
    videoMeta: { duration: string; resolution: string; isVideo: boolean } | null;
    analysisResult: string;
    isCopied: boolean;
    handleCopy: (text: string) => void;
    isGeneratingPrompt: boolean;
    onGeneratePrompt: () => void;
    error: string;
    onClearError: () => void;
    isNewResult: boolean;
}

const VideoAnalysisView: React.FC<VideoAnalysisViewProps> = ({
    file, videoUrl, videoMeta, analysisResult, isCopied, handleCopy, isGeneratingPrompt, onGeneratePrompt, error, onClearError, isNewResult
}) => {
    const isVideo = videoMeta?.isVideo ?? (file?.type.startsWith('video/') || false);
    const [showSuccess, setShowSuccess] = useState(isNewResult);

    useEffect(() => {
        if (isNewResult) {
            setShowSuccess(true);
            const timer = setTimeout(() => setShowSuccess(false), 5000);
            return () => clearTimeout(timer);
        } else {
            setShowSuccess(false);
        }
    }, [isNewResult]);

    return (
        <div className="flex flex-col gap-8">
            {/* Analysis Feedback */}
            <AnimatePresence>
                {showSuccess && !error && !isGeneratingPrompt && (
                    <AnalysisStatus 
                        state={AnalysisState.SUCCESS}
                        message=""
                        progress={100}
                        isCompact={true}
                    />
                )}
                {isGeneratingPrompt && (
                    <AnalysisStatus 
                        state={AnalysisState.PROCESSING}
                        message="Engineering Prompt..."
                        progress={50}
                        isCompact={true}
                    />
                )}
                {error && (
                    <AnalysisStatus 
                        state={AnalysisState.ERROR}
                        message=""
                        progress={0}
                        error={error}
                        isCompact={true}
                    />
                )}
            </AnimatePresence>

            {/* Media Preview Card */}
            <div className="glassmorphic-card rounded-[2rem] p-8">
                <h2 className="text-lg font-bold mb-6 flex items-center gap-3 uppercase tracking-widest font-heading text-slate-900 dark:text-white">
                    <Film className="w-5 h-5 text-slate-900 dark:text-white opacity-50"/>
                    Media Preview
                </h2>
                <div className="bg-black/40 rounded-2xl mb-6 overflow-hidden flex items-center justify-center aspect-video max-h-80 border border-black/5 dark:border-white/10 shadow-inner">
                    {isVideo ? (
                        <video src={videoUrl} controls className="w-full h-full object-contain" key={videoUrl}></video>
                    ) : (
                        <img src={videoUrl} referrerPolicy="no-referrer" alt="Image Preview" className="w-full h-full object-contain" />
                    )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-black/5 dark:bg-white/5 p-4 rounded-xl border border-black/5 dark:border-white/5">
                        <p className="text-[10px] text-slate-500 dark:text-white/60 uppercase tracking-[0.2em] font-bold mb-1">Duration</p>
                        <p className="font-bold text-sm text-slate-900 dark:text-white">{videoMeta?.duration}</p>
                    </div>
                    <div className="bg-black/5 dark:bg-white/5 p-4 rounded-xl border border-black/5 dark:border-white/5">
                        <p className="text-[10px] text-slate-500 dark:text-white/60 uppercase tracking-[0.2em] font-bold mb-1">Resolution</p>
                        <p className="font-bold text-sm text-slate-900 dark:text-white">{videoMeta?.resolution}</p>
                    </div>
                </div>
            </div>
          
            {/* Analysis Result Card */}
            <div className="glassmorphic-card rounded-[2rem] p-8">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-lg font-bold flex items-center gap-3 uppercase tracking-widest font-heading text-slate-900 dark:text-white">
                        <Brain className="w-5 h-5 text-slate-900 dark:text-white opacity-50"/>
                        Content Analysis
                    </h2>
                    <button onClick={() => handleCopy(analysisResult)} className="p-2 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-slate-500 dark:text-white/70 hover:text-black dark:hover:text-white transition-all">
                        {isCopied ? <Check size={16} className="text-emerald-500 dark:text-emerald-400" /> : <Copy size={16} />}
                    </button>
                </div>
                
                <div className="bg-black/5 dark:bg-white/5 rounded-2xl p-6 mb-8 border border-black/5 dark:border-white/5">
                    <pre className="text-sm text-slate-700 dark:text-white/80 min-h-[200px] max-h-[500px] overflow-y-auto whitespace-pre-wrap font-mono leading-relaxed scrollbar-thin">
                        {analysisResult}
                    </pre>
                </div>

                <div className="border-t border-black/10 dark:border-white/10 pt-8">
                     <p className="text-xs text-slate-500 dark:text-white/60 mb-6 text-center font-medium uppercase tracking-widest">Ready to create? Turn this analysis into a structured generation prompt.</p>
                     <BlurryButton onClick={onGeneratePrompt} className="w-full" disabled={isGeneratingPrompt}>
                        {isGeneratingPrompt ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Wand2 className="w-5 h-5" /><span>Generate Prompt</span></>}
                    </BlurryButton>
                </div>
            </div>
        </div>
    );
};

export default VideoAnalysisView;
