import React, { useState } from 'react';
import { 
    Wand2, 
    Brain, 
    Film, 
    CheckCircle2, 
    ChevronDown, 
    FileText, 
    Paintbrush, 
    Copy, 
    Check, 
    Loader2, 
    Sparkles,
    AlertCircle,
    X,
    Monitor,
    Microscope
} from 'lucide-react';
import { ConsistencyResult, StructuredPrompt } from '../types.ts';
import BlurryButton from './Button';
import AnimatedList from './AnimatedList.tsx';
import { refinementOptions } from '../data/refinementOptions.ts';
import { remixStyles } from '../data/remixStyles.ts';
import SyntaxHighlightedTextarea from './SyntaxHighlightedTextarea.tsx';
import EvidenceView from './EvidenceView.tsx';

interface ScoreGaugeProps {
    score: number;
}

const ScoreGauge: React.FC<ScoreGaugeProps> = ({ score }) => {
    const radius = 60;
    const stroke = 8;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    const getScoreColor = () => {
        if (score < 50) return '#ef4444';
        if (score < 80) return '#f59e0b';
        return '#10b981';
    };

    return (
        <div className="relative flex items-center justify-center w-40 h-40">
            <svg
                height={radius * 2}
                width={radius * 2}
                className="-rotate-90"
            >
                <circle
                    className="text-white/5"
                    strokeWidth={stroke}
                    stroke="currentColor"
                    fill="transparent"
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                />
                <circle
                    className="transition-all duration-1000 ease-out"
                    strokeWidth={stroke}
                    strokeDasharray={circumference + ' ' + circumference}
                    style={{ strokeDashoffset, stroke: getScoreColor() }}
                    fill="transparent"
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                    strokeLinecap="round"
                />
            </svg>
            <span className="absolute text-4xl font-bold font-heading" style={{ color: getScoreColor() }}>{score}</span>
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
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4" 
            onClick={onClose}
        >
            <div 
                className="bg-background-dark rounded-[2rem] p-1 max-w-lg w-full shadow-2xl border border-white/10 relative flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors">
                    <X size={24} />
                </button>
                <div className="p-10 overflow-y-auto">
                    <h2 className="text-xl font-bold text-center mb-8 uppercase tracking-widest font-heading">Consistency Test</h2>
                    <div className="flex flex-col items-center justify-center min-h-[200px]">
                        {isLoading && (
                            <div className="text-center space-y-4">
                                <Loader2 className="w-12 h-12 text-white animate-spin mx-auto opacity-50" />
                                <p className="text-slate-400 font-medium uppercase tracking-widest text-xs">Analyzing consistency...</p>
                            </div>
                        )}
                        {error && !isLoading && (
                             <div className="text-rose-400 text-center text-sm bg-rose-400/10 p-6 rounded-2xl border border-rose-400/20 flex flex-col items-center gap-3">
                                <AlertCircle size={24} />
                                <p>{error}</p>
                             </div>
                        )}
                        {result && !isLoading && (
                            <div className="w-full space-y-8">
                                <div className="flex justify-center">
                                  <ScoreGauge score={result.consistency_score} />
                                </div>
                                <p className="text-center text-slate-300 font-medium leading-relaxed">{result.explanation}</p>
                                
                                {result.missing_details && result.missing_details.length > 0 && (
                                    <div className="text-left bg-white/5 p-6 rounded-2xl border border-white/10">
                                        <h4 className="font-bold mb-3 text-white uppercase tracking-wider text-xs">Missing Details</h4>
                                        <ul className="space-y-2 text-sm text-slate-400">
                                            {result.missing_details.map((detail, index) => (
                                                <li key={index} className="flex items-start gap-2">
                                                    <span className="text-primary mt-1">•</span>
                                                    <span>{detail}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {result.reasoning && (
                                    <div className="text-left border-t border-white/10 pt-6">
                                        <button 
                                            onClick={() => setIsAnalysisVisible(!isAnalysisVisible)}
                                            className="w-full flex justify-between items-center text-left font-bold uppercase tracking-widest text-xs text-slate-400 hover:text-white transition-colors"
                                        >
                                            <span>Forensic Analysis</span>
                                            <ChevronDown size={16} className={`transition-transform duration-300 ${isAnalysisVisible ? 'rotate-180' : ''}`} />
                                        </button>
                                        {isAnalysisVisible && (
                                            <div className="mt-4 space-y-4 text-xs text-slate-400">
                                                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                                    <h5 className="font-bold text-white mb-2 uppercase tracking-tighter">Prompt Analysis</h5>
                                                    <p className="whitespace-pre-wrap font-mono leading-relaxed">{result.reasoning.analysis_of_prompt}</p>
                                                </div>
                                                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                                    <h5 className="font-bold text-white mb-2 uppercase tracking-tighter">Media Analysis</h5>
                                                    <p className="whitespace-pre-wrap font-mono leading-relaxed">{result.reasoning.analysis_of_media}</p>
                                                </div>
                                                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                                    <h5 className="font-bold text-white mb-2 uppercase tracking-tighter">Comparison</h5>
                                                    <p className="whitespace-pre-wrap font-mono leading-relaxed">{result.reasoning.comparison}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {result.revised_output && (
                                    <div className="text-left space-y-3">
                                        <h4 className="font-bold uppercase tracking-widest text-xs text-slate-400">Revised Output</h4>
                                        <div className="relative group">
                                            <button 
                                                onClick={() => navigator.clipboard.writeText(result.revised_output)} 
                                                className="absolute top-4 right-4 p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all z-10"
                                            >
                                                <Copy size={16} />
                                            </button>
                                            <SyntaxHighlightedTextarea
                                                mode={result.revised_output.trim().startsWith('{') ? 'json' : 'text'}
                                                value={result.revised_output}
                                                onChange={() => {}} 
                                                readOnly={true}
                                            />
                                        </div>
                                    </div>
                                )}
                                {result.revised_output && (
                                    <div className="mt-8 border-t border-white/10 pt-8 text-center">
                                        <BlurryButton onClick={() => onApplyImprovements(result.revised_output)} className="w-full">
                                            <Check size={18} />
                                            Apply Improvements
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
    onRegenerate: (instruction?: string) => void;
    hasOriginalFrames: boolean;
    error: string;
    isRemixing: boolean;
    remixStyle: string;
    setRemixStyle: (value: string) => void;
    handleRemixStyle: () => void;
    isConvertingToJson: boolean;
    onConvertToJSON: () => void;
    extractedFrames: string[];
}

const ResultsView: React.FC<ResultsViewProps> = ({
    file, videoUrl, videoMeta, generatedPrompt, structuredPrompt,
    isCopied, isRefining, isDetailing,
    refineTone, refineStyle, refineCamera, refineLighting, refineInstruction,
    negativePrompt, setNegativePrompt,
    handlePromptChange, handleCopy, handleRefinePrompt,
    setRefineTone, setRefineStyle, setRefineCamera, setRefineLighting, setRefineInstruction,
    isTestingConsistency, consistencyResult, showConsistencyModal,
    onTestConsistency, onCloseConsistencyModal, onApplyImprovements, onRegenerate, hasOriginalFrames, error,
    // FIX: Corrected duplicate destructuring of 'setRefineStyle' to 'setRemixStyle'
    isRemixing, remixStyle, setRemixStyle, handleRemixStyle,
    isConvertingToJson, onConvertToJSON,
    extractedFrames
}) => {
    const isVideo = videoMeta?.isVideo;
    const isJsonOutput = structuredPrompt?.objective === 'JSON Format Output';
    const [activeTab, setActiveTab] = useState<'prompt' | 'evidence'>('prompt');

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
        <div className="flex flex-col gap-8">
            {/* Tab switcher */}
            <div className="flex p-1 bg-black/5 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/8">
                <button
                onClick={() => setActiveTab('prompt')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all duration-300
                    ${activeTab === 'prompt' ? 'bg-background-dark dark:bg-white text-white dark:text-background-dark shadow-lg' : 'text-slate-500 dark:text-slate-400 hover:text-black dark:hover:text-white'}`}
                >
                <Brain size={14} />
                Prompt
                </button>
                <button
                onClick={() => setActiveTab('evidence')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all duration-300
                    ${activeTab === 'evidence' ? 'bg-background-dark dark:bg-white text-white dark:text-background-dark shadow-lg' : 'text-slate-500 dark:text-slate-400 hover:text-black dark:hover:text-white'}`}
                >
                <Microscope size={14} />
                Evidence
                </button>
            </div>

            <div className={activeTab === 'evidence' ? 'block' : 'hidden'}>
                <EvidenceView
                frames={extractedFrames}
                structuredPrompt={structuredPrompt!}
                />
            </div>
            <div className={activeTab === 'prompt' ? 'block' : 'hidden'}>
              {/* Media Preview */}
              <div className="glassmorphic-card rounded-[2rem] p-8">
                  <h2 className="text-lg font-bold mb-6 flex items-center gap-3 uppercase tracking-widest font-heading text-slate-900 dark:text-white">
                      <Film className="w-5 h-5 text-slate-900 dark:text-white opacity-50"/>
                      Media Preview
                  </h2>
                  <div className="bg-black/40 rounded-2xl mb-6 overflow-hidden flex items-center justify-center aspect-video max-h-64 border border-black/5 dark:border-white/10 shadow-inner">
                    {isVideo ? (
                        <video src={videoUrl} controls className="w-full h-full object-contain" key={videoUrl}></video>
                    ) : (
                        <img src={videoUrl} alt="Image Preview" className="w-full h-full object-contain" />
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {isVideo && (
                        <div className="bg-black/5 dark:bg-white/5 p-4 rounded-xl border border-black/5 dark:border-white/5">
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] font-bold mb-1">Duration</p>
                            <p className="font-bold text-sm text-slate-900 dark:text-white">{videoMeta?.duration}</p>
                        </div>
                    )}
                    <div className={`${isVideo ? 'col-span-1' : 'col-span-2'} bg-black/5 dark:bg-white/5 p-4 rounded-xl border border-black/5 dark:border-white/5`}>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] font-bold mb-1">Resolution</p>
                      <p className="font-bold text-sm text-slate-900 dark:text-white">{videoMeta?.resolution}</p>
                    </div>
                  </div>
              </div>
              
              {/* Analysis Results */}
              <div className="glassmorphic-card rounded-[2rem] p-8">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold flex items-center gap-3 uppercase tracking-widest font-heading text-slate-900 dark:text-white">
                        <Brain className="w-5 h-5 text-slate-900 dark:text-white opacity-50"/>
                        Analysis Results
                    </h2>
                  </div>
                  <div className="space-y-8">
                    {!isJsonOutput && (
                        <div>
                            <h3 className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] mb-3">Objective</h3>
                            <div className="bg-black/5 dark:bg-white/5 p-5 rounded-xl border border-black/5 dark:border-white/5 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                                {structuredPrompt?.objective}
                            </div>
                        </div>
                    )}
                     <div>
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Core Focus</h3>
                            <button onClick={() => handleCopy(generatedPrompt)} className="p-2 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-black dark:hover:text-white transition-all">
                                {isCopied ? <Check size={16} className="text-emerald-500 dark:text-emerald-400" /> : <Copy size={16} />}
                            </button>
                        </div>
                        <div className="rounded-xl overflow-hidden border border-black/10 dark:border-white/10">
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
                            <h3 className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] mb-3">Constraints</h3>
                            <div className="bg-black/5 dark:bg-white/5 p-5 rounded-xl border border-black/5 dark:border-white/5 text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                                {structuredPrompt?.constraints}
                            </div>
                        </div>
                     )}
                  </div>
              </div>
              
              {/* Refine Card */}
              <div className="glassmorphic-card rounded-[2rem] p-8 relative">
                  <h2 className="text-lg font-bold mb-8 flex items-center gap-3 uppercase tracking-widest font-heading text-slate-900 dark:text-white">
                      <Sparkles className="w-5 h-5 text-slate-900 dark:text-white opacity-50" />
                      Refine Prompt
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2">Tone</label>
                        <AnimatedList 
                            items={["Default", ...refinementOptions.tone]}
                            selectedItem={refineTone || "Default"}
                            onItemSelected={(item) => setRefineTone(item === "Default" ? "" : item)}
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2">Style</label>
                        <AnimatedList
                            items={["Default", ...refinementOptions.style]}
                            selectedItem={refineStyle || "Default"}
                            onItemSelected={(item) => setRefineStyle(item === "Default" ? "" : item)}
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2">Camera</label>
                        <AnimatedList
                            items={["Default", ...refinementOptions.camera]}
                            selectedItem={refineCamera || "Default"}
                            onItemSelected={(item) => setRefineCamera(item === "Default" ? "" : item)}
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2">Lighting</label>
                         <AnimatedList
                            items={["Default", ...refinementOptions.lighting]}
                            selectedItem={refineLighting || "Default"}
                            onItemSelected={(item) => setRefineLighting(item === "Default" ? "" : item)}
                        />
                    </div>
                  </div>
                  <div className="mb-8">
                    <label htmlFor="refine-instruction" className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2">Custom Instruction</label>
                    <textarea id="refine-instruction" value={refineInstruction} onChange={(e) => setRefineInstruction(e.target.value)} placeholder="e.g., make it shorter, add a dragon" rows={2} className="w-full p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 focus:border-black/20 dark:focus:border-white/20 outline-none transition-all text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600"></textarea>
                  </div>

                  <div className="mb-8 border-t border-black/10 dark:border-white/10 pt-8">
                    <label htmlFor="negative-prompt" className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2">Negative Prompt</label>
                    <textarea id="negative-prompt" value={negativePrompt} onChange={(e) => setNegativePrompt(e.target.value)} placeholder="e.g., blurry, cartoon, extra limbs, watermark" rows={2} className="w-full p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 focus:border-black/20 dark:focus:border-white/20 outline-none transition-all text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600"></textarea>
                  </div>

                  <div className="flex flex-wrap gap-4">
                      <BlurryButton onClick={() => handleRefinePrompt('refine')} disabled={isRefining || isDetailing} className="flex-1 min-w-[140px]">
                        {isRefining ? (<Loader2 className="w-4 h-4 animate-spin" />) : "Refine"}
                      </BlurryButton>
                       <BlurryButton onClick={() => handleRefinePrompt('detail')} disabled={isRefining || isDetailing} className="flex-1 min-w-[140px]">
                        {isDetailing ? (<Loader2 className="w-4 h-4 animate-spin" />) : "Detail"}
                      </BlurryButton>
                      
                      <BlurryButton onClick={onConvertToJSON} disabled={isConvertingToJson || isJsonOutput} className="flex-1 min-w-[140px]">
                        {isConvertingToJson ? (<Loader2 className="w-4 h-4 animate-spin" />) : "JSON"}
                      </BlurryButton>
                      
                      <BlurryButton onClick={onTestConsistency} disabled={isTestingConsistency || !hasOriginalFrames} className="flex-1 min-w-[140px]">
                        {isTestingConsistency ? (<Loader2 className="w-4 h-4 animate-spin" />) : "Test"}
                      </BlurryButton>

                      <BlurryButton onClick={() => onRegenerate(refineInstruction)} disabled={isRefining || isDetailing || !hasOriginalFrames} className="w-full">
                         <Wand2 className="w-5 h-5" />
                         Generate
                      </BlurryButton>
                  </div>
              </div>

                {/* Video Style Remix Card */}
              <div className="glassmorphic-card rounded-[2rem] p-8 relative">
                    <h2 className="text-lg font-bold mb-8 flex items-center gap-3 uppercase tracking-widest font-heading text-slate-900 dark:text-white">
                        <Paintbrush className="w-5 h-5 text-slate-900 dark:text-white opacity-50" />
                        Style Remix
                    </h2>
                    <div className="grid grid-cols-1 gap-6 mb-8">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2">Target Style</label>
                            <AnimatedList
                                items={remixStyles.map(s => s.name)}
                                selectedItem={remixStyle || null}
                                onItemSelected={setRemixStyle}
                                placeholder="Select a style"
                            />
                        </div>
                    </div>
                    <div>
                        <BlurryButton onClick={handleRemixStyle} disabled={isRemixing || !hasOriginalFrames || !remixStyle} className="w-full">
                            {isRemixing ? (<Loader2 className="w-4 h-4 animate-spin" />) : "Remix Style"}
                        </BlurryButton>
                    </div>
              </div>
            </div>
        </div>
        </>
    );
};

export default ResultsView;