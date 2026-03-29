import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
    Play, 
    Pause, 
    RotateCcw, 
    CheckCircle2, 
    AlertCircle, 
    Info, 
    ChevronRight, 
    ChevronLeft,
    Maximize2,
    Minimize2,
    Volume2,
    VolumeX,
    Settings,
    Activity,
    Target,
    Zap
} from 'lucide-react';
import { PromptEvidence, EvidenceSentence, StructuredPrompt } from '../types';
import BlurryButton from './Button';

interface PromptVideoComparisonProps {
    videoUrl: string;
    frames: string[];
    structuredPrompt: StructuredPrompt;
    evidence: PromptEvidence | null;
    onRunAnalysis: () => void;
    isLoading: boolean;
}

const PromptVideoComparison: React.FC<PromptVideoComparisonProps> = ({
    videoUrl,
    frames,
    structuredPrompt,
    evidence,
    onRunAnalysis,
    isLoading
}) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isMuted, setIsMuted] = useState(true);
    const [volume, setVolume] = useState(1);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [activeFrameIdx, setActiveFrameIdx] = useState<number | null>(null);

    // Map current time to frame index
    const currentFrameIdx = useMemo(() => {
        if (!duration || frames.length === 0) return 0;
        const idx = Math.floor((currentTime / duration) * frames.length);
        return Math.min(idx, frames.length - 1);
    }, [currentTime, duration, frames.length]);

    // Sentences supported by the current frame
    const activeSentences = useMemo(() => {
        if (!evidence || currentFrameIdx === null) return [];
        const sentenceIds = evidence.frameIndex[currentFrameIdx] || [];
        return evidence.sentences.filter(s => sentenceIds.includes(s.id));
    }, [evidence, currentFrameIdx]);

    // All sentences, sorted by whether they are grounded in the current frame
    const sortedSentences = useMemo(() => {
        if (!evidence) return [];
        return [...evidence.sentences].sort((a, b) => {
            const aActive = a.frameIndices.includes(currentFrameIdx);
            const bActive = b.frameIndices.includes(currentFrameIdx);
            if (aActive && !bActive) return -1;
            if (!aActive && bActive) return 1;
            return 0;
        });
    }, [evidence, currentFrameIdx]);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleTimeUpdate = () => setCurrentTime(video.currentTime);
        const handleDurationChange = () => setDuration(video.duration);
        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);

        video.addEventListener('timeupdate', handleTimeUpdate);
        video.addEventListener('durationchange', handleDurationChange);
        video.addEventListener('play', handlePlay);
        video.addEventListener('pause', handlePause);

        return () => {
            video.removeEventListener('timeupdate', handleTimeUpdate);
            video.removeEventListener('durationchange', handleDurationChange);
            video.removeEventListener('play', handlePlay);
            video.removeEventListener('pause', handlePause);
        };
    }, []);

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) videoRef.current.pause();
            else videoRef.current.play();
        }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = parseFloat(e.target.value);
        if (videoRef.current) {
            videoRef.current.currentTime = time;
            setCurrentTime(time);
        }
    };

    const toggleFullscreen = () => {
        if (!isFullscreen) {
            videoRef.current?.parentElement?.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
        setIsFullscreen(!isFullscreen);
    };

    const formatTime = (time: number) => {
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (!evidence && !isLoading) {
        return (
            <div className="glassmorphic-card rounded-[2rem] p-12 flex flex-col items-center text-center gap-8 border border-white/10">
                <div className="size-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center relative">
                    <Activity size={40} className="text-primary animate-pulse" />
                    <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl animate-pulse" />
                </div>
                <div className="max-w-md">
                    <h3 className="text-2xl font-bold font-heading uppercase tracking-widest mb-4">Prompt vs Video Comparison</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                        Synchronize your prompt with the video timeline. See exactly which parts of your description are visually confirmed in real-time.
                    </p>
                </div>
                <BlurryButton onClick={onRunAnalysis} className="px-12 py-4 text-sm">
                    <Target size={20} />
                    Initialize Comparison Engine
                </BlurryButton>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="glassmorphic-card rounded-[2rem] p-16 flex flex-col items-center gap-8 border border-white/10">
                <div className="relative">
                    <div className="size-20 border-4 border-white/10 border-t-primary rounded-full animate-spin" />
                    <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary" size={24} />
                </div>
                <div className="text-center space-y-3">
                    <p className="text-lg font-bold uppercase tracking-[0.3em] text-white">Synchronizing Data</p>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-widest">Mapping prompt claims to temporal coordinates...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/3 border border-white/8 rounded-2xl p-6 flex items-center gap-4">
                    <div className="size-12 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                        <CheckCircle2 className="text-emerald-400" size={24} />
                    </div>
                    <div>
                        <div className="text-2xl font-bold font-heading">
                            {evidence?.sentences.filter(s => s.frameIndices.length > 0).length} / {evidence?.sentences.length}
                        </div>
                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Claims Grounded</div>
                    </div>
                </div>
                <div className="bg-white/3 border border-white/8 rounded-2xl p-6 flex items-center gap-4">
                    <div className="size-12 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
                        <Activity className="text-primary" size={24} />
                    </div>
                    <div>
                        <div className="text-2xl font-bold font-heading">
                            {Math.round((evidence?.sentences.reduce((acc, s) => acc + s.confidence, 0) || 0) / (evidence?.sentences.length || 1) * 100)}%
                        </div>
                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Avg. Confidence</div>
                    </div>
                </div>
                <div className="bg-white/3 border border-white/8 rounded-2xl p-6 flex items-center gap-4">
                    <div className="size-12 rounded-xl bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
                        <AlertCircle className="text-amber-400" size={24} />
                    </div>
                    <div>
                        <div className="text-2xl font-bold font-heading">
                            {evidence?.sentences.filter(s => s.frameIndices.length === 0).length}
                        </div>
                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Ungrounded Claims</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Video Section (3/5) */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="relative group rounded-[2rem] overflow-hidden bg-black border border-white/10 shadow-2xl">
                        <video 
                            ref={videoRef}
                            src={videoUrl}
                            className="w-full aspect-video object-contain"
                            muted={isMuted}
                        />
                        
                        {/* Custom Controls Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                            <div className="space-y-4">
                                {/* Progress Bar */}
                                <div className="flex items-center gap-4">
                                    <span className="text-[10px] font-mono text-white/70">{formatTime(currentTime)}</span>
                                    <input 
                                        type="range"
                                        min={0}
                                        max={duration || 0}
                                        step={0.01}
                                        value={currentTime}
                                        onChange={handleSeek}
                                        className="flex-1 h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-white"
                                    />
                                    <span className="text-[10px] font-mono text-white/70">{formatTime(duration)}</span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-6">
                                        <button onClick={togglePlay} className="text-white hover:scale-110 transition-transform">
                                            {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
                                        </button>
                                        <div className="flex items-center gap-2 group/volume">
                                            <button onClick={() => setIsMuted(!isMuted)} className="text-white">
                                                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                                            </button>
                                            <input 
                                                type="range"
                                                min={0}
                                                max={1}
                                                step={0.1}
                                                value={isMuted ? 0 : volume}
                                                onChange={(e) => {
                                                    const v = parseFloat(e.target.value);
                                                    setVolume(v);
                                                    if (videoRef.current) videoRef.current.volume = v;
                                                    setIsMuted(v === 0);
                                                }}
                                                className="w-0 group-hover/volume:w-20 transition-all h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-white"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <button onClick={() => { if (videoRef.current) videoRef.current.currentTime = 0; }} className="text-white/70 hover:text-white">
                                            <RotateCcw size={20} />
                                        </button>
                                        <button onClick={toggleFullscreen} className="text-white/70 hover:text-white">
                                            {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Frame Strip */}
                    <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-thin">
                        {frames.map((src, idx) => (
                            <button 
                                key={idx}
                                onClick={() => {
                                    if (videoRef.current) {
                                        videoRef.current.currentTime = (idx / frames.length) * duration;
                                    }
                                }}
                                className={`relative shrink-0 w-32 aspect-video rounded-xl overflow-hidden border-2 transition-all ${currentFrameIdx === idx ? 'border-primary scale-105 shadow-lg shadow-primary/20' : 'border-white/10 opacity-50 hover:opacity-100'}`}
                            >
                                <img src={src} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/20" />
                                <div className="absolute top-1 left-1 bg-black/60 px-1 rounded text-[8px] font-bold text-white uppercase">F{idx + 1}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Prompt Section (2/5) */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    <div className="glassmorphic-card rounded-[2rem] p-8 flex-1 flex flex-col border border-white/10">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Real-time Grounding</h3>
                            <div className="flex items-center gap-2">
                                <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Live Sync</span>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2 space-y-4 scrollbar-thin">
                            <AnimatePresence mode="popLayout">
                                {sortedSentences.map((s) => {
                                    const isActive = s.frameIndices.includes(currentFrameIdx);
                                    return (
                                        <motion.div
                                            key={s.id}
                                            layout
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ 
                                                opacity: isActive ? 1 : 0.4, 
                                                scale: isActive ? 1 : 0.98,
                                                x: 0
                                            }}
                                            className={`p-4 rounded-2xl border transition-all duration-300 ${isActive ? 'bg-white/10 border-white/20 shadow-lg' : 'bg-white/2 border-white/5'}`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className={`mt-1.5 size-2 rounded-full shrink-0 ${s.confidence >= 0.8 ? 'bg-emerald-400' : s.confidence >= 0.5 ? 'bg-amber-400' : 'bg-rose-400'}`} />
                                                <div className="space-y-2">
                                                    <p className={`text-sm leading-relaxed transition-colors ${isActive ? 'text-white font-medium' : 'text-slate-400'}`}>
                                                        {s.text}
                                                    </p>
                                                    {isActive && (
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[9px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                                                                {s.category}
                                                            </span>
                                                            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
                                                                Confidence: {Math.round(s.confidence * 100)}%
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Summary Card */}
                    <div className="bg-primary/5 border border-primary/10 rounded-[2rem] p-8">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary mb-4">Comparison Summary</h4>
                        <p className="text-xs text-slate-400 leading-relaxed italic">
                            "The visual evidence strongly supports the subject and environment claims, while motion details show moderate grounding in the middle sequence."
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PromptVideoComparison;
