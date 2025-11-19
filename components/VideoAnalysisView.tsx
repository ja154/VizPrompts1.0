import React from 'react';
import { BrainCircuitIcon, FilmIcon } from './icons';
import GlowCard from './GlowCard';
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
        <div className="animate-fade-in-slide-up animation-delay-300">
            <div className="flex flex-col gap-8">
                <GlowCard className="bg-bg-secondary-light dark:bg-bg-secondary-dark rounded-2xl p-1 shadow-lg border border-border-primary-light dark:border-border-primary-dark">
                    <div className="rounded-xl p-6">
                        <h2 className="text-xl font-bold mb-4 flex items-center"><FilmIcon className="w-6 h-6 mr-2 text-gray-700 dark:text-stone-300"/>Media Preview</h2>
                        <div className="video-preview bg-black rounded-lg mb-4 overflow-hidden flex items-center justify-center">
                            {isVideo ? (
                                <video src={videoUrl} controls className="w-full h-full object-contain" key={videoUrl}></video>
                            ) : (
                                <img src={videoUrl} alt="Image Preview" className="w-full h-full object-contain" />
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-bg-uploader-light dark:bg-bg-uploader-dark p-3 rounded-lg">
                                <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">Duration</p>
                                <p className="font-medium">{videoMeta?.duration}</p>
                            </div>
                            <div className="bg-bg-uploader-light dark:bg-bg-uploader-dark p-3 rounded-lg">
                                <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">Resolution</p>
                                <p className="font-medium">{videoMeta?.resolution}</p>
                            </div>
                        </div>
                    </div>
                </GlowCard>
              
                <GlowCard className="bg-bg-secondary-light dark:bg-bg-secondary-dark rounded-2xl p-1 shadow-lg border border-border-primary-light dark:border-border-primary-dark">
                    <div className="rounded-xl p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold flex items-center"><BrainCircuitIcon className="w-6 h-6 mr-2 text-gray-700 dark:text-stone-300"/>Video Content Analysis</h2>
                            <button onClick={() => handleCopy(analysisResult)} className="p-2 rounded-lg bg-bg-uploader-light dark:bg-bg-uploader-dark hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-150 transform active:scale-90 tooltip-container">
                                {isCopied ? <span className="fas fa-check text-green-500"></span> : <span className="far fa-copy"></span>}
                                <span className="tooltip-text">Copy Analysis</span>
                            </button>
                        </div>
                        <pre className="text-sm text-text-secondary-light dark:text-text-secondary-dark bg-bg-uploader-light dark:bg-bg-uploader-dark p-4 rounded-lg min-h-[200px] max-h-[500px] overflow-y-auto whitespace-pre-wrap font-sans">
                            {analysisResult}
                        </pre>

                        <div className="mt-6 border-t border-border-primary-light dark:border-border-primary-dark pt-6">
                             <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mb-4 text-center">Want to turn this analysis into a generative prompt?</p>
                             <BlurryButton onClick={onGeneratePrompt} className="w-full" disabled={isGeneratingPrompt}>
                                {/* FIX: Replaced <i> with <span> for Font Awesome icon */}
                                {isGeneratingPrompt ? <><span className="fas fa-spinner fa-spin mr-2"></span>Generating Prompt...</> : <><span className="fas fa-magic mr-2"></span>Generate Prompt from Analysis</>}
                            </BlurryButton>
                        </div>
                    </div>
                </GlowCard>
            </div>
        </div>
    );
};

export default VideoAnalysisView;