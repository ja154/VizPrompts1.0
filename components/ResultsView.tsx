import React, { useState } from 'react';
import { MagicWandIcon, BrainCircuitIcon, FilmIcon, TestPromptIcon, ChevronDownIcon, ArticleIcon } from './icons';
import { ConsistencyResult, StructuredPrompt } from '../types.ts';
import BlurryButton from './Button';
import GlowCard from './GlowCard';
import AnimatedList from './AnimatedList.tsx';
import { refinementOptions } from '../data/refinementOptions.ts';

interface ScoreGaugeProps {
    score: number;
}

const ScoreGauge: React.FC<ScoreGaugeProps> = ({ score }) => {
    const radius = 60;
    const stroke = 10;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    const getScoreColor = () => {
        if (score < 50) return 'text-red-500';
        if (score < 80) return 'text-yellow-500';
        return 'text-green-500';
    };

    return (
        <div className="relative flex items-center justify-center w-40 h-40">
            <svg
                height={radius * 2}
                width={radius * 2}
                className="-rotate-90"
            >
                <circle
                    className="text-gray-200 dark:text-gray-700"
                    strokeWidth={stroke}
                    stroke="currentColor"
                    fill="transparent"
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                />
                <circle
                    className={`${getScoreColor()} transition-all duration-1000 ease-out`}
                    strokeWidth={stroke}
                    strokeDasharray={circumference + ' ' + circumference}
                    style={{ strokeDashoffset }}
                    stroke="currentColor"
                    fill="transparent"
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                    strokeLinecap="round"
                />
            </svg>
            <span className={`absolute text-4xl font-bold ${getScoreColor()}`}>{score}</span>
        </div>
    );
};

interface ConsistencyModalProps {
    isOpen: boolean;
    onClose: () => void;
    isLoading: boolean;
    result: ConsistencyResult | null;
    error: string | null;
    onApplyImprovements: (prompt: string) => void;
}

const ConsistencyModal: React.FC<ConsistencyModalProps> = ({ isOpen, onClose, isLoading, result, error, onApplyImprovements }) => {
    const [isAnalysisVisible, setIsAnalysisVisible] = useState(false);
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in-slide-up" 
            style={{ animationDuration: '300ms' }}
            onClick={onClose}
        >
            <div 
                className="bg-bg-secondary-light dark:bg-bg-secondary-dark rounded-2xl p-1 max-w-lg w-full shadow-2xl border border-border-primary-light dark:border-border-primary-dark relative animate-scale-in flex flex-col max-h-[90vh]"
                style={{ animationDuration: '400ms' }}
                onClick={(e) => e.stopPropagation()}
            >
                <button onClick={onClose} className="absolute top-3 right-3 text-text-secondary-light dark:text-text-secondary-dark hover:text-red-500 transition-colors w-8 h-8 rounded-full bg-transparent hover:bg-black/10 dark:hover:bg-white/10 flex items-center justify-center z-10">
                    <i className="fas fa-times"></i>
                </button>
                <div className="p-8 overflow-y-auto">
                    <h2 className="text-xl font-bold text-center mb-6">Prompt Consistency Test</h2>
                    <div className="flex flex-col items-center justify-center min-h-[200px]">
                        {isLoading && (
                            <>
                                <div className="w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                                <p className="mt-4 text-text-secondary-light dark:text-text-secondary-dark">Analyzing consistency...</p>
                            </>
                        )}
                        {error && !isLoading && (
                             <p className="text-red-500 text-center text-sm bg-red-500/10 p-4 rounded-lg">{error}</p>
                        )}
                        {result && !isLoading && (
                            <div className="animate-fade-in-slide-up w-full">
                                <div className="flex justify-center">
                                  <ScoreGauge score={result.consistency_score} />
                                </div>
                                <p className="mt-4 text-center text-text-secondary-light dark:text-text-secondary-dark">{result.explanation}</p>
                                
                                {result.missing_details && result.missing_details.length > 0 && (
                                    <div className="text-left mt-4 bg-bg-uploader-light dark:bg-bg-uploader-dark p-4 rounded-lg border border-border-primary-light dark:border-border-primary-dark">
                                        <h4 className="font-semibold mb-2 text-text-primary-light dark:text-text-primary-dark">Missing Details:</h4>
                                        <ul className="list-disc list-inside space-y-1 text-sm text-text-secondary-light dark:text-text-secondary-dark">
                                            {result.missing_details.map((detail, index) => (
                                                <li key={index}>{detail}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {result.reasoning && (
                                    <div className="text-left mt-6 border-t border-border-primary-light dark:border-border-primary-dark pt-4">
                                        <button 
                                            onClick={() => setIsAnalysisVisible(!isAnalysisVisible)}
                                            className="w-full flex justify-between items-center text-left font-semibold"
                                            aria-expanded={isAnalysisVisible}
                                        >
                                            <span>Forensic Analysis</span>
                                            <ChevronDownIcon className={`w-5 h-5 transition-transform duration-200 ${isAnalysisVisible ? 'transform rotate-180' : ''}`} />
                                        </button>
                                        {isAnalysisVisible && (
                                            <div className="mt-2 space-y-4 text-sm text-text-secondary-light dark:text-text-secondary-dark animate-fade-in-slide-up" style={{animationDuration: '300ms'}}>
                                                <div className="bg-bg-uploader-light dark:bg-bg-uploader-dark p-3 rounded-lg">
                                                    <h5 className="font-bold text-text-primary-light dark:text-text-primary-dark">Prompt Analysis:</h5>
                                                    <p className="whitespace-pre-wrap font-mono text-xs">{result.reasoning.analysis_of_prompt}</p>
                                                </div>
                                                <div className="bg-bg-uploader-light dark:bg-bg-uploader-dark p-3 rounded-lg">
                                                    <h5 className="font-bold text-text-primary-light dark:text-text-primary-dark">Media Analysis:</h5>
                                                    <p className="whitespace-pre-wrap font-mono text-xs">{result.reasoning.analysis_of_media}</p>
                                                </div>
                                                <div className="bg-bg-uploader-light dark:bg-bg-uploader-dark p-3 rounded-lg">
                                                    <h5 className="font-bold text-text-primary-light dark:text-text-primary-dark">Comparison:</h5>
                                                    <p className="whitespace-pre-wrap font-mono text-xs">{result.reasoning.comparison}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {result.revised_prompt && (
                                    <div className="text-left mt-4">
                                        <h4 className="font-semibold mb-2 text-text-primary-light dark:text-text-primary-dark">Revised Prompt:</h4>
                                        <div className="relative bg-bg-uploader-light dark:bg-bg-uploader-dark p-4 rounded-lg border border-border-primary-light dark:border-border-primary-dark">
                                            <button 
                                                onClick={() => navigator.clipboard.writeText(result.revised_prompt)} 
                                                className="absolute top-2 right-2 p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700/80 transition-colors tooltip"
                                            >
                                                <i className="far fa-copy"></i>
                                                <span className="tooltip-text" style={{width: '100px'}}>Copy Text</span>
                                            </button>
                                            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark whitespace-pre-wrap font-mono pr-8">
                                                {result.revised_prompt}
                                            </p>
                                        </div>
                                    </div>
                                )}
                                {result.revised_prompt && (
                                    <div className="mt-6 border-t border-border-primary-light dark:border-border-primary-dark pt-4 text-center">
                                        <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mb-4">Implement these improvements?</p>
                                        <BlurryButton onClick={() => onApplyImprovements(result.revised_prompt)}>
                                            <i className="fas fa-check mr-2"></i>
                                            Apply & Close
                                        </BlurryButton>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};


interface ResultsViewProps {
    file: File | null;
    videoUrl: string;
    videoMeta: { duration: string; resolution: string } | null;
    generatedPrompt: string;
    structuredPrompt: StructuredPrompt | null;
    isCopied: boolean;
    isRefining: boolean;
    isDetailing: boolean;
    refineTone: string;
    refineStyle: string;
    refineCamera: string;
    refineLighting: string;
    refineInstruction: string;
    negativePrompt: string;
    setNegativePrompt: (value: string) => void;
    handlePromptChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    handleCopy: (text: string) => void;
    handleRefinePrompt: (mode: 'refine' | 'detail') => void;
    setRefineTone: (value: string) => void;
    setRefineStyle: (value: string) => void;
    setRefineCamera: (value: string) => void;
    setRefineLighting: (value: string) => void;
    setRefineInstruction: (value: string) => void;
    isTestingConsistency: boolean;
    consistencyResult: ConsistencyResult | null;
    showConsistencyModal: boolean;
    onTestConsistency: () => void;
    onCloseConsistencyModal: () => void;
    onApplyImprovements: (prompt: string) => void;
    hasOriginalFrames: boolean;
    error: string;
}

const ResultsView: React.FC<ResultsViewProps> = ({
    file, videoUrl, videoMeta, generatedPrompt, structuredPrompt,
    isCopied, isRefining, isDetailing,
    refineTone, refineStyle, refineCamera, refineLighting, refineInstruction,
    negativePrompt, setNegativePrompt,
    handlePromptChange, handleCopy, handleRefinePrompt,
    setRefineTone, setRefineStyle, setRefineCamera, setRefineLighting, setRefineInstruction,
    isTestingConsistency, consistencyResult, showConsistencyModal,
    onTestConsistency, onCloseConsistencyModal, onApplyImprovements, hasOriginalFrames, error
}) => {
    const isVideo = !videoUrl.startsWith('data:image/svg+xml') && (file?.type.startsWith('video/') || !file);

    return (
        <>
        <ConsistencyModal 
            isOpen={showConsistencyModal}
            onClose={onCloseConsistencyModal}
            isLoading={isTestingConsistency}
            result={consistencyResult}
            error={error}
            onApplyImprovements={onApplyImprovements}
        />
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
                    <h2 className="text-xl font-bold flex items-center"><BrainCircuitIcon className="w-6 h-6 mr-2 text-gray-700 dark:text-stone-300"/>Analysis Results</h2>
                  </div>
                  <div className="space-y-4">
                    <div>
                        <h3 className="font-semibold text-text-primary-light dark:text-text-primary-dark">Objective</h3>
                        <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark bg-bg-uploader-light dark:bg-bg-uploader-dark p-3 rounded-lg mt-1">{structuredPrompt?.objective}</p>
                    </div>
                     <div>
                        <div className="flex justify-between items-center mb-1">
                            <h3 className="font-semibold text-text-primary-light dark:text-text-primary-dark">Core Focus</h3>
                            <button onClick={() => handleCopy(generatedPrompt)} className="p-2 rounded-lg bg-bg-uploader-light dark:bg-bg-uploader-dark hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-150 transform active:scale-90 tooltip">
                                {isCopied ? <i className="fas fa-check text-green-500"></i> : <i className="far fa-copy"></i>}
                                <span className="tooltip-text">Copy prompt</span>
                            </button>
                        </div>
                        <textarea 
                            value={generatedPrompt}
                            onChange={handlePromptChange}
                            className="w-full prompt-textarea p-4 rounded-lg bg-bg-uploader-light dark:bg-bg-uploader-dark border border-border-primary-light dark:border-border-primary-dark focus:ring-2 focus:ring-purple-500 focus:border-transparent" placeholder="Your AI-generated text prompt will appear here..."></textarea>
                    </div>
                     <div>
                        <h3 className="font-semibold text-text-primary-light dark:text-text-primary-dark">Constraints</h3>
                        <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark bg-bg-uploader-light dark:bg-bg-uploader-dark p-3 rounded-lg mt-1 whitespace-pre-wrap">{structuredPrompt?.constraints}</p>
                    </div>
                    {structuredPrompt?.enhancements && (
                         <div>
                            <h3 className="font-semibold text-text-primary-light dark:text-text-primary-dark">Enhancements</h3>
                            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark bg-bg-uploader-light dark:bg-bg-uploader-dark p-3 rounded-lg mt-1">{structuredPrompt.enhancements}</p>
                        </div>
                    )}
                  </div>
                </div>
              </GlowCard>
              
              {/* Refine Card */}
              <GlowCard className="bg-bg-secondary-light dark:bg-bg-secondary-dark rounded-2xl p-1 shadow-lg border border-border-primary-light dark:border-border-primary-dark">
                <div className="rounded-xl p-6">
                  <h2 className="text-xl font-bold mb-4 flex items-center"><MagicWandIcon className="w-6 h-6 mr-2 text-gray-700 dark:text-stone-300" />Refine Prompt</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark mb-1">Tone</label>
                        <AnimatedList 
                            items={["Default", ...refinementOptions.tone]}
                            selectedItem={refineTone || "Default"}
                            onItemSelected={(item) => setRefineTone(item === "Default" ? "" : item)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark mb-1">Style</label>
                        <AnimatedList
                            items={["Default", ...refinementOptions.style]}
                            selectedItem={refineStyle || "Default"}
                            onItemSelected={(item) => setRefineStyle(item === "Default" ? "" : item)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark mb-1">Camera</label>
                        <AnimatedList
                            items={["Default", ...refinementOptions.camera]}
                            selectedItem={refineCamera || "Default"}
                            onItemSelected={(item) => setRefineCamera(item === "Default" ? "" : item)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark mb-1">Lighting</label>
                         <AnimatedList
                            items={["Default", ...refinementOptions.lighting]}
                            selectedItem={refineLighting || "Default"}
                            onItemSelected={(item) => setRefineLighting(item === "Default" ? "" : item)}
                        />
                    </div>
                  </div>
                  <div className="mb-4">
                    <label htmlFor="refine-instruction" className="block text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark mb-1">Custom Instruction</label>
                    <textarea id="refine-instruction" value={refineInstruction} onChange={(e) => setRefineInstruction(e.target.value)} placeholder="e.g., make it shorter, add a dragon" rows={2} className="w-full p-2 rounded-lg bg-bg-uploader-light dark:bg-bg-uploader-dark border border-border-primary-light dark:border-border-primary-dark focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-200 hover:border-purple-400 dark:hover:border-purple-500"></textarea>
                  </div>

                  <div className="mt-6 border-t border-border-primary-light dark:border-border-primary-dark pt-4">
                    <label htmlFor="negative-prompt" className="block text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark mb-1">Negative Prompt (Elements to Exclude)</label>
                    <textarea id="negative-prompt" value={negativePrompt} onChange={(e) => setNegativePrompt(e.target.value)} placeholder="e.g., blurry, cartoon, extra limbs, watermark" rows={2} className="w-full p-2 rounded-lg bg-bg-uploader-light dark:bg-bg-uploader-dark border border-border-primary-light dark:border-border-primary-dark focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-200 hover:border-purple-400 dark:hover:border-purple-500"></textarea>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 mt-4">
                      <BlurryButton onClick={() => handleRefinePrompt('refine')} disabled={isRefining || isDetailing}>
                        {isRefining ? (<><i className="fas fa-spinner fa-spin"></i><span>Refining...</span></>) : "Refine"}
                      </BlurryButton>
                       <BlurryButton onClick={() => handleRefinePrompt('detail')} disabled={isRefining || isDetailing}>
                        {isDetailing ? (<><i className="fas fa-spinner fa-spin"></i><span>Detailing...</span></>) : "Add More Detail"}
                      </BlurryButton>
                      <div className="tooltip-container">
                        <BlurryButton onClick={onTestConsistency} disabled={isTestingConsistency || !hasOriginalFrames}>
                          {isTestingConsistency ? (<><i className="fas fa-spinner fa-spin"></i><span>Testing...</span></>) : <><TestPromptIcon className="w-5 h-5 mr-2" /><span>Test Consistency</span></>}
                        </BlurryButton>
                        {!hasOriginalFrames && (
                          <span className="tooltip-text" style={{width: 200, bottom: '110%'}}>
                            Only available for new media uploads, not library prompts.
                          </span>
                        )}
                      </div>
                  </div>
                </div>
              </GlowCard>
            </div>
        </div>
        </>
    );
};

export default ResultsView;