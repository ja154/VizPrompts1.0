import React from 'react';
import { BrainCircuitIcon, FilmIcon } from './icons';
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
        <div className="animate-fade-in-slide-up animation-delay-300 flex flex-col gap-8">
            {/* Media Preview Card */}
            <div className="glassmorphic-card rounded-xl p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-800 dark:text-white">
                    <FilmIcon className="w-6 h-6 text-primary"/>
                    Media Preview
                </h2>
                <div className="bg-black rounded-lg mb-4 overflow-hidden flex items-center justify-center aspect-video max-h-80 border border-white/10">
                    {isVideo ? (
                        <video src={videoUrl} controls className="w-full h-full object-contain" key={videoUrl}></video>
                    ) : (
                        <img src={videoUrl} alt="Image Preview" className="w-full h-full object-contain" />
                    )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="glassmorphic-input p-3 rounded-lg">
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold mb-1">Duration</p>
                        <p className="font-medium">{videoMeta?.duration}</p>
                    </div>
                    <div className="glassmorphic-input p-3 rounded-lg">
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold mb-1">Resolution</p>
                        <p className="font-medium">{videoMeta?.resolution}</p>
                    </div>
                </div>
            </div>
          
            {/* Analysis Result Card */}
            <div className="glassmorphic-card rounded-xl p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800 dark:text-white">
                        <BrainCircuitIcon className="w-6 h-6 text-primary"/>
                        Content Analysis
                    </h2>
                    <button onClick={() => handleCopy(analysisResult)} className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-all duration-150 tooltip-container text-gray-500 dark:text-gray-400">
                        {isCopied ? <span className="fas fa-check text-green-500"></span> : <span className="far fa-copy"></span>}
                        <span className="tooltip-text">Copy Analysis</span>
                    </button>
                </div>
                
                <div className="glassmorphic-input rounded-lg p-4 mb-6">
                    <pre className="text-sm text-gray-700 dark:text-gray-300 min-h-[200px] max-h-[500px] overflow-y-auto whitespace-pre-wrap font-mono leading-relaxed scrollbar-thin">
                        {analysisResult}
                    </pre>
                </div>

                <div className="border-t border-gray-200 dark:border-white/10 pt-6">
                     <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 text-center">Ready to create? Turn this analysis into a structured generation prompt.</p>
                     <BlurryButton onClick={onGeneratePrompt} className="w-full" disabled={isGeneratingPrompt}>
                        {/* FIX: Replaced <i> with <span> for Font Awesome icon */}
                        {isGeneratingPrompt ? <><span className="fas fa-spinner fa-spin mr-2"></span>Generating Prompt...</> : <><span className="fas fa-magic mr-2"></span>Generate Prompt from Analysis</>}
                    </BlurryButton>
                </div>
            </div>
        </div>
    );
};

export default VideoAnalysisView;