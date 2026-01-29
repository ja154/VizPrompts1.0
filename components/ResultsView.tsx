
import React, { useState } from 'react';
import { MagicWandIcon, BrainCircuitIcon, FilmIcon, TestPromptIcon, ChevronDownIcon, ArticleIcon, PaintBrushIcon, CopyIcon, CheckIcon, SpinnerIcon } from './icons';
import { ConsistencyResult, StructuredPrompt } from '../types.ts';
import BlurryButton from './Button';
import AnimatedList from './AnimatedList.tsx';
import { refinementOptions } from '../data/refinementOptions.ts';
import { remixStyles } from '../data/remixStyles.ts';
import SyntaxHighlightedTextarea from './SyntaxHighlightedTextarea.tsx';

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
    onApplyImprovements: (output: string) => void;
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
                className="bg-white dark:bg-[#171122] rounded-2xl p-1 max-w-lg w-full shadow-2xl border border-gray-200 dark:border-white/10 relative animate-scale-in flex flex-col max-h-[90vh]"
                style={{ animationDuration: '400ms' }}
                onClick={(e) => e.stopPropagation()}
            >
                <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-red-500 transition-colors w-8 h-8 rounded-full bg-transparent hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center z-10">
                    <span className="material-symbols-outlined">close</span>
                </button>
                <div className="p-8 overflow-y-auto">
                    <h2 className="text-xl font-bold text-center mb-6">Prompt Consistency Test</h2>
                    <div className="flex flex-col items-center justify-center min-h-[200px]">
                        {isLoading && (
                            <>
                                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                                <p className="mt-4 text-gray-500">Analyzing consistency...</p>
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
                                <p className="mt-4 text-center text-gray-600 dark:text-gray-300">{result.explanation}</p>
                                
                                {result.missing_details && result.missing_details.length > 0 && (
                                    <div className="text-left mt-4 bg-gray-100 dark:bg-white/5 p-4 rounded-lg border border-gray-200 dark:border-white/10">
                                        <h4 className="font-semibold mb-2 text-gray-800 dark:text-gray-200">Missing Details:</h4>
                                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                                            {result.missing_details.map((detail, index) => (
                                                <li key={index}>{detail}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {result.reasoning && (
                                    <div className="text-left mt-6 border-t border-gray-200 dark:border-white/10 pt-4">
                                        <button 
                                            onClick={() => setIsAnalysisVisible(!isAnalysisVisible)}
                                            className="w-full flex justify-between items-center text-left font-semibold"
                                            aria-expanded={isAnalysisVisible}
                                        >
                                            <span>Forensic Analysis</span>
                                            <ChevronDownIcon className={`w-5 h-5 transition-transform duration-200 ${isAnalysisVisible ? 'transform rotate-180' : ''}`} />
                                        </button>
                                        {isAnalysisVisible && (
                                            <div className="mt-2 space-y-4 text-sm text-gray-600 dark:text-gray-400 animate-fade-in-slide-up" style={{animationDuration: '300ms'}}>
                                                <div className="bg-gray-100 dark:bg-white/5 p-3 rounded-lg">
                                                    <h5 className="font-bold text-gray-800 dark:text-white">Prompt Analysis:</h5>
                                                    <p className="whitespace-pre-wrap font-mono text-xs">{result.reasoning.analysis_of_prompt}</p>
                                                </div>
                                                <div className="bg-gray-100 dark:bg-white/5 p-3 rounded-lg">
                                                    <h5 className="font-bold text-gray-800 dark:text-white">Media Analysis:</h5>
                                                    <p className="whitespace-pre-wrap font-mono text-xs">{result.reasoning.analysis_of_media}</p>
                                                </div>
                                                <div className="bg-gray-100 dark:bg-white/5 p-3 rounded-lg">
                                                    <h5 className="font-bold text-gray-800 dark:text-white">Comparison:</h5>
                                                    <p className="whitespace-pre-wrap font-mono text-xs">{result.reasoning.comparison}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {result.revised_output && (
                                    <div className="text-left mt-4">
                                        <h4 className="font-semibold mb-2">Revised Output:</h4>
                                        <div className="relative">
                                            <button 
                                                onClick={() => navigator.clipboard.writeText(result.revised_output)} 
                                                className="absolute top-2 right-2 p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-white/10 transition-colors z-10 text-gray-500 dark:text-gray-400"
                                            >
                                                <CopyIcon className="h-5 w-5" />
                                            </button>
                                            <SyntaxHighlightedTextarea
                                                mode={result.revised_output.trim().startsWith('{') ? 'json' : 'text'}
                                                value={result.revised_output}
                                                onChange={() => {}} // No-op for read-only
                                                readOnly={true}
                                            />
                                        </div>
                                    </div>
                                )}
                                {result.revised_output && (
                                    <div className="mt-6 border-t border-gray-200 dark:border-white/10 pt-4 text-center">
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Implement these improvements?</p>
                                        <BlurryButton onClick={() => onApplyImprovements(result.revised_output)}>
                                            <CheckIcon className="mr-2 h-4 w-4"/>
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
    videoMeta: { duration: string; resolution: string, isVideo: boolean } | null;
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
    onApplyImprovements: (output: string) => void;
    hasOriginalFrames: boolean;
    error: string;
    isRemixing: boolean;
    remixStyle: string;
    setRemixStyle: (value: string) => void;
    handleRemixStyle: () => void;
    isConvertingToJson: boolean;
    onConvertToJason: () => void;
}

const ResultsView: React.FC<ResultsViewProps> = ({
    file, videoUrl, videoMeta, generatedPrompt, structuredPrompt,
    isCopied, isRefining, isDetailing,
    refineTone, refineStyle, refineCamera, refineLighting, refineInstruction,
    negativePrompt, setNegativePrompt,
    handlePromptChange, handleCopy, handleRefinePrompt,
    setRefineTone, setRefineStyle, setRefineCamera, setRefineLighting, setRefineInstruction,
    isTestingConsistency, consistencyResult, showConsistencyModal,
    onTestConsistency, onCloseConsistencyModal, onApplyImprovements, hasOriginalFrames, error,
    isRemixing, remixStyle, setRemixStyle, handleRemixStyle,
    isConvertingToJson, onConvertToJason
}) => {
    const isVideo = videoMeta?.isVideo;
    const isJsonOutput = structuredPrompt?.objective === 'JSON Format Output';

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
        <div className="animate-fade-in-slide-up animation-delay-300 flex flex-col gap-8">
            
              {/* Media Preview */}
              <div className="glassmorphic-card rounded-xl p-6">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-800 dark:text-white">
                      <FilmIcon className="w-6 h-6 text-primary"/>
                      Media Preview
                  </h2>
                  <div className="bg-black rounded-lg mb-4 overflow-hidden flex items-center justify-center aspect-video max-h-64 border border-white/10">
                    {isVideo ? (
                        <video src={videoUrl} controls className="w-full h-full object-contain" key={videoUrl}></video>
                    ) : (
                        <img src={videoUrl} alt="Image Preview" className="w-full h-full object-contain" />
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {isVideo && (
                        <div className="glassmorphic-input p-3 rounded-lg">
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold mb-1">Duration</p>
                        <p className="font-medium">{videoMeta?.duration}</p>
                        </div>
                    )}
                    <div className={`${isVideo ? 'col-span-1' : 'col-span-2'} glassmorphic-input p-3 rounded-lg`}>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold mb-1">Resolution</p>
                      <p className="font-medium">{videoMeta?.resolution}</p>
                    </div>
                  </div>
              </div>
              
              {/* Analysis Results */}
              <div className="glassmorphic-card rounded-xl p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800 dark:text-white">
                        <BrainCircuitIcon className="w-6 h-6 text-primary"/>
                        Analysis Results
                    </h2>
                  </div>
                  <div className="space-y-6">
                    {!isJsonOutput && (
                        <div>
                            <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-2">Objective</h3>
                            <div className="glassmorphic-input p-4 rounded-lg text-sm text-gray-600 dark:text-gray-300">
                                {structuredPrompt?.objective}
                            </div>
                        </div>
                    )}
                     <div>
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-semibold text-gray-700 dark:text-gray-200">Core Focus</h3>
                            <button onClick={() => handleCopy(generatedPrompt)} className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-gray-500 dark:text-gray-400">
                                {isCopied ? <CheckIcon className="text-green-500 h-5 w-5" /> : <CopyIcon className="h-5 w-5" />}
                            </button>
                        </div>
                        <div className="glassmorphic-input rounded-lg overflow-hidden">
                            {isJsonOutput ? (
                                <SyntaxHighlightedTextarea
                                    mode="json"
                                    value={generatedPrompt}
                                    onChange={handlePromptChange}
                                    placeholder="Your AI-generated JSON prompt will appear here..."
                                />
                            ) : (
                                <SyntaxHighlightedTextarea
                                    mode="text"
                                    value={generatedPrompt}
                                    onChange={handlePromptChange}
                                    placeholder="Your AI-generated text prompt will appear here..."
                                />
                            )}
                        </div>
                    </div>
                     {!isJsonOutput && (
                        <div>
                            <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-2">Constraints</h3>
                            <div className="glassmorphic-input p-4 rounded-lg text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                                {structuredPrompt?.constraints}
                            </div>
                        </div>
                     )}
                  </div>
              </div>
              
              {/* Refine Card */}
              <div className="glassmorphic-card rounded-xl p-6 relative">
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-800 dark:text-white">
                      <MagicWandIcon className="w-6 h-6 text-primary" />
                      Refine Prompt
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Tone</label>
                        <AnimatedList 
                            items={["Default", ...refinementOptions.tone]}
                            selectedItem={refineTone || "Default"}
                            onItemSelected={(item) => setRefineTone(item === "Default" ? "" : item)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Style</label>
                        <AnimatedList
                            items={["Default", ...refinementOptions.style]}
                            selectedItem={refineStyle || "Default"}
                            onItemSelected={(item) => setRefineStyle(item === "Default" ? "" : item)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Camera</label>
                        <AnimatedList
                            items={["Default", ...refinementOptions.camera]}
                            selectedItem={refineCamera || "Default"}
                            onItemSelected={(item) => setRefineCamera(item === "Default" ? "" : item)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Lighting</label>
                         <AnimatedList
                            items={["Default", ...refinementOptions.lighting]}
                            selectedItem={refineLighting || "Default"}
                            onItemSelected={(item) => setRefineLighting(item === "Default" ? "" : item)}
                        />
                    </div>
                  </div>
                  <div className="mb-6">
                    <label htmlFor="refine-instruction" className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Custom Instruction</label>
                    <textarea id="refine-instruction" value={refineInstruction} onChange={(e) => setRefineInstruction(e.target.value)} placeholder="e.g., make it shorter, add a dragon" rows={2} className="w-full p-3 rounded-lg glassmorphic-input focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm"></textarea>
                  </div>

                  <div className="mb-6 border-t border-gray-200 dark:border-white/10 pt-6">
                    <label htmlFor="negative-prompt" className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Negative Prompt (Elements to Exclude)</label>
                    <textarea id="negative-prompt" value={negativePrompt} onChange={(e) => setNegativePrompt(e.target.value)} placeholder="e.g., blurry, cartoon, extra limbs, watermark" rows={2} className="w-full p-3 rounded-lg glassmorphic-input focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm"></textarea>
                  </div>

                  <div className="flex flex-wrap gap-3">
                      <BlurryButton onClick={() => handleRefinePrompt('refine')} disabled={isRefining || isDetailing}>
                        {isRefining ? (<><SpinnerIcon className="w-4 h-4 mr-2 animate-spin" /><span>Refining...</span></>) : "Refine"}
                      </BlurryButton>
                       <BlurryButton onClick={() => handleRefinePrompt('detail')} disabled={isRefining || isDetailing}>
                        {isDetailing ? (<><SpinnerIcon className="w-4 h-4 mr-2 animate-spin" /><span>Detailing...</span></>) : "Add More Detail"}
                      </BlurryButton>
                      
                      <BlurryButton onClick={onConvertToJason} disabled={isConvertingToJson || isJsonOutput}>
                        {isConvertingToJson ? (<><SpinnerIcon className="w-4 h-4 mr-2 animate-spin" /><span>Converting...</span></>) : <><ArticleIcon className="w-5 h-5 mr-2" /><span>Convert to JSON</span></>}
                      </BlurryButton>
                      
                      <BlurryButton onClick={onTestConsistency} disabled={isTestingConsistency || !hasOriginalFrames}>
                        {isTestingConsistency ? (<><SpinnerIcon className="w-4 h-4 mr-2 animate-spin" /><span>Testing...</span></>) : <><TestPromptIcon className="w-5 h-5 mr-2" /><span>Test Consistency</span></>}
                      </BlurryButton>
                  </div>
              </div>

                {/* Video Style Remix Card */}
              <div className="glassmorphic-card rounded-xl p-6 relative">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-800 dark:text-white">
                        <PaintBrushIcon className="w-6 h-6 text-primary" />
                        Media Style Remix
                    </h2>
                    <div className="grid grid-cols-1 gap-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Target Style</label>
                            <AnimatedList
                                items={remixStyles.map(s => s.name)}
                                selectedItem={remixStyle || null}
                                onItemSelected={setRemixStyle}
                                placeholder="Select a style"
                            />
                        </div>
                    </div>
                    <div>
                        <BlurryButton onClick={handleRemixStyle} disabled={isRemixing || !hasOriginalFrames || !remixStyle}>
                            {isRemixing ? (<><SpinnerIcon className="w-4 h-4 mr-2 animate-spin" /><span>Remixing...</span></>) : "Remix Style"}
                        </BlurryButton>
                    </div>
              </div>
        </div>
        </>
    );
};

export default ResultsView;
