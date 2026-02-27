
import React from 'react';
import { Brain, Film, Copy, Check, Wand2, Loader2 } from 'lucide-react';
import BlurryButton from './Button';

interface VideoAnalysisViewProps {
    file: File | null;
    videoUrl: string;
    videoMeta: { duration: string; resolution: string } | null;
    analysisResult: string;
    isCopied: boolean;
    handleCopy: (text: string) => void;
    isGeneratingPrompt: boolean;
    onGeneratePrompt: () => void;
}

const VideoAnalysisView: React.FC<VideoAnalysisViewProps> = ({
    file, videoUrl, videoMeta, analysisResult, isCopied, handleCopy, isGeneratingPrompt, onGeneratePrompt
}) => {
    const isVideo = !videoUrl.startsWith('data:image/svg+xml') && (file?.type.startsWith('video/') || !file);

    return (
        <div className="flex flex-col gap-8">
            {/* Media Preview Card */}
            <div className="glassmorphic-card rounded-[2rem] p-8">
                <h2 className="text-lg font-bold mb-6 flex items-center gap-3 uppercase tracking-widest font-heading">
                    <Film className="w-5 h-5 text-white opacity-50"/>
                    Media Preview
                </h2>
                <div className="bg-black/40 rounded-2xl mb-6 overflow-hidden flex items-center justify-center aspect-video max-h-80 border border-white/10 shadow-inner">
                    {isVideo ? (
                        <video src={videoUrl} controls className="w-full h-full object-contain" key={videoUrl}></video>
                    ) : (
                        <img src={videoUrl} alt="Image Preview" className="w-full h-full object-contain" />
                    )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                        <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold mb-1">Duration</p>
                        <p className="font-bold text-sm">{videoMeta?.duration}</p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                        <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold mb-1">Resolution</p>
                        <p className="font-bold text-sm">{videoMeta?.resolution}</p>
                    </div>
                </div>
            </div>
          
            {/* Analysis Result Card */}
            <div className="glassmorphic-card rounded-[2rem] p-8">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-lg font-bold flex items-center gap-3 uppercase tracking-widest font-heading">
                        <Brain className="w-5 h-5 text-white opacity-50"/>
                        Content Analysis
                    </h2>
                    <button onClick={() => handleCopy(analysisResult)} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all">
                        {isCopied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                    </button>
                </div>
                
                <div className="bg-white/5 rounded-2xl p-6 mb-8 border border-white/5">
                    <pre className="text-sm text-slate-300 min-h-[200px] max-h-[500px] overflow-y-auto whitespace-pre-wrap font-mono leading-relaxed scrollbar-thin">
                        {analysisResult}
                    </pre>
                </div>

                <div className="border-t border-white/10 pt-8">
                     <p className="text-xs text-slate-500 mb-6 text-center font-medium uppercase tracking-widest">Ready to create? Turn this analysis into a structured generation prompt.</p>
                     <BlurryButton onClick={onGeneratePrompt} className="w-full" disabled={isGeneratingPrompt}>
                        {isGeneratingPrompt ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Wand2 className="w-5 h-5" /><span>Generate Prompt</span></>}
                    </BlurryButton>
                </div>
            </div>
        </div>
    );
};

export default VideoAnalysisView;
