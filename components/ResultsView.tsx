import React, { useState } from 'react';
import { MagicWandIcon, ArticleIcon, BrainCircuitIcon, FilmIcon, TestPromptIcon, ChevronDownIcon } from './icons';
import { ConsistencyResult, VideoAnalysis } from '../types.ts';
import BlurryButton from './Button';
import GlowCard from './GlowCard';
import AnimatedList from './AnimatedList.tsx';
import { refinementOptions } from '../data/refinementOptions.ts';

type JsonView = 'structured' | 'detailed' | 'superStructured';

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

                                {result.suggested_improvements && (
                                    <div className="text-left mt-4">
                                        <h4 className="font-semibold mb-2 text-text-primary-light dark:text-text-primary-dark">Suggested Improvement:</h4>
                                        <div className="relative bg-bg-uploader-light dark:bg-bg-uploader-dark p-4 rounded-lg border border-border-primary-light dark:border-border-primary-dark">
                                            <button 
                                                onClick={() => navigator.clipboard.writeText(result.suggested_improvements)} 
                                                className="absolute top-2 right-2 p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700/80 transition-colors tooltip"
                                            >
                                                <i className="far fa-copy"></i>
                                                <span className="tooltip-text" style={{width: '100px'}}>Copy Text</span>
                                            </button>
                                            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark whitespace-pre-wrap font-mono pr-8">
                                                {result.suggested_improvements}
                                            </p>
                                        </div>
                                    </div>
                                )}
                                {result.suggested_improvements && (
                                    <div className="mt-6 border-t border-border-primary-light dark:border-border-primary-dark pt-4 text-center">
                                        <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mb-4">Implement these improvements?</p>
                                        <BlurryButton onClick={() => onApplyImprovements(result.suggested_improvements)}>
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
    videoAnalysis: VideoAnalysis | null;
    isCopied: boolean;
    isJsonCopied: boolean;
    isUpdatingJson: boolean;
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
    handleCopy: (text: string, type: 'prompt' | 'json') => void;
    resetState: () => void;
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
    file, videoUrl, videoMeta, generatedPrompt, videoAnalysis,
    isCopied, isJsonCopied, isUpdatingJson, isRefining, isDetailing,
    refineTone, refineStyle, refineCamera, refineLighting, refineInstruction,
    negativePrompt, setNegativePrompt,
    handlePromptChange, handleCopy, resetState, handleRefinePrompt,
    setRefineTone, setRefineStyle, setRefineCamera, setRefineLighting, setRefineInstruction,
    isTestingConsistency, consistencyResult, showConsistencyModal,
    onTestConsistency, onCloseConsistencyModal, onApplyImprovements, hasOriginalFrames, error
}) => {
    const [currentJsonView, setCurrentJsonView] = useState<JsonView>('detailed');

    const isVideo = !videoUrl.startsWith('data:image/svg+xml') && (file?.type.startsWith('video/') || !file);

    const getJsonForView = () => {
        if (!videoAnalysis) return 'Analysis data not available.';
        switch (currentJsonView) {
            case 'structured':
                return JSON.stringify(videoAnalysis.holistic_impression, null, 2);
            case 'detailed':
                return JSON.stringify(videoAnalysis.systematic_deconstruction, null, 2);
            case 'superStructured':
                return JSON.stringify(videoAnalysis, null, 2);
            default:
                return '';
        }
    };

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
        <section className="max-w-6xl mx-auto mt-16 animate-fade-in-slide-up animation-delay-300">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              <GlowCard className="bg-bg-secondary-light dark:bg-bg-secondary-dark rounded-2xl p-1 shadow-lg border border-border-primary-light dark:border-border-primary-dark lg:col-span-2">
                <div className="rounded-xl p-6">
                  <h2 className="text-xl font-bold mb-4 flex items-center"><FilmIcon className="w-6 h-6 mr-2 text-gray-700 dark:text-stone-300"/>Media Analysis</h2>
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
              
              <GlowCard className="lg:col-span-3 bg-bg-secondary-light dark:bg-bg-secondary-dark rounded-2xl p-1 shadow-lg border border-border-primary-light dark:border-border-primary-dark">
                <div className="rounded-xl p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold flex items-center"><ArticleIcon className="w-6 h-6 mr-2 text-gray-700 dark:text-stone-300"/>Text Prompt</h2>
                    <div className="flex items-center space-x-2">
                      <button onClick={() => handleCopy(generatedPrompt, 'prompt')} className="p-2 rounded-lg bg-bg-uploader-light dark:bg-bg-uploader-dark hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-150 transform active:scale-90 tooltip">
                        {isCopied ? <i className="fas fa-check text-green-500"></i> : <i className="far fa-copy"></i>}
                        <span className="tooltip-text">Copy prompt</span>
                      </button>
                      <button onClick={resetState} className="p-2 rounded-lg bg-bg-uploader-light dark:bg-bg-uploader-dark hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-150 transform active:scale-90 tooltip">
                        <i className="fas fa-plus"></i>
                        <span className="tooltip-text">New Analysis</span>
                      </button>
                    </div>
                  </div>
                  <textarea 
                    value={generatedPrompt}
                    onChange={handlePromptChange}
                    className="w-full prompt-textarea p-4 rounded-lg bg-bg-uploader-light dark:bg-bg-uploader-dark border border-border-primary-light dark:border-border-primary-dark focus:ring-2 focus:ring-purple-500 focus:border-transparent" placeholder="Your AI-generated text prompt will appear here..."></textarea>
                </div>
              </GlowCard>
              
              {/* Refine Card */}
              <GlowCard className="lg:col-span-5 bg-bg-secondary-light dark:bg-bg-secondary-dark rounded-2xl p-1 shadow-lg border border-border-primary-light dark:border-border-primary-dark">
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
                      <div className="tooltip">
                        <BlurryButton onClick={onTestConsistency} disabled={isTestingConsistency || !hasOriginalFrames}>
                          {isTestingConsistency ? (<><i className="fas fa-spinner fa-spin"></i><span>Testing...</span></>) : <><TestPromptIcon className="w-5 h-5 mr-2" /><span>Test Consistency</span></>}
                        </BlurryButton>
                        {!hasOriginalFrames && (
                          <span className="tooltip-text" style={{width: 200, bottom: '110%'}}>
                            Only available for new media uploads, not for history items or library prompts.
                          </span>
                        )}
                      </div>
                  </div>
                </div>
              </GlowCard>
    
              <GlowCard className="lg:col-span-5 bg-bg-secondary-light dark:bg-bg-secondary-dark rounded-2xl p-1 shadow-lg border border-border-primary-light dark:border-border-primary-dark">
                <div className="rounded-xl p-6">
                   <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-bold flex items-center">
                        <BrainCircuitIcon className="w-6 h-6 mr-2 text-gray-700 dark:text-stone-300"/>
                        JSON Prompt
                        {isUpdatingJson && <i className="fas fa-spinner fa-spin ml-3 text-gray-700 dark:text-stone-300"></i>}
                      </h2>
                       <div className="flex space-x-2">
                           <button onClick={() => handleCopy(getJsonForView(), 'json')} className="p-2 rounded-lg bg-bg-uploader-light dark:bg-bg-uploader-dark hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-150 transform active:scale-90 tooltip">
                               {isJsonCopied ? <i className="fas fa-check text-green-500"></i> : <i className="far fa-copy"></i>}
                               <span className="tooltip-text">Copy JSON</span>
                           </button>
                       </div>
                   </div>
    
                    <div className="mb-4 flex flex-wrap gap-2">
                        <button onClick={() => setCurrentJsonView('structured')} className={`px-3 py-1 rounded-lg font-medium transition-all duration-200 ${currentJsonView === 'structured' ? 'bg-purple-600 text-white' : 'bg-bg-uploader-light dark:bg-bg-uploader-dark hover:bg-gray-100 dark:hover:bg-gray-700'}`}>Structured</button>
                        <button 
                          onClick={() => setCurrentJsonView('detailed')} 
                          className={`px-3 py-1 rounded-lg font-medium transition-all duration-200 ${currentJsonView === 'detailed' ? 'bg-purple-600 text-white' : 'bg-bg-uploader-light dark:bg-bg-uploader-dark hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                        >Detailed</button>
                        <button 
                          onClick={() => setCurrentJsonView('superStructured')} 
                          className={`px-3 py-1 rounded-lg font-medium transition-all duration-200 ${currentJsonView === 'superStructured' ? 'bg-purple-600 text-white' : 'bg-bg-uploader-light dark:bg-bg-uploader-dark hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                        >Super Structured</button>
                    </div>
                    
                    <pre className="w-full p-4 rounded-lg bg-bg-uploader-light dark:bg-bg-uploader-dark border border-border-primary-light dark:border-border-primary-dark overflow-auto" style={{minHeight: '200px', maxHeight: '400px'}}>
                      <code>
                        {getJsonForView()}
                      </code>
                    </pre>
                </div>
              </GlowCard>
            </div>
        </section>
        </>
    );
};

export default ResultsView;