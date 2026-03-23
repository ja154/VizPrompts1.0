import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, Microscope, Info, CheckCircle2, AlertCircle, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { PromptEvidence, EvidenceSentence, StructuredPrompt } from '../types';
import { generatePromptEvidence } from '../services/geminiService';
import BlurryButton from './Button';

// ─── Category colour tokens ────────────────────────────────────────────────
const CATEGORY_STYLES: Record<EvidenceSentence['category'], { bg: string; border: string; label: string }> = {
  subject:        { bg: 'bg-violet-500/15',  border: 'border-violet-500/40',  label: 'Subject'       },
  environment:    { bg: 'bg-teal-500/15',    border: 'border-teal-500/40',    label: 'Environment'   },
  cinematography: { bg: 'bg-sky-500/15',     border: 'border-sky-500/40',     label: 'Camera'        },
  lighting:       { bg: 'bg-amber-500/15',   border: 'border-amber-500/40',   label: 'Lighting'      },
  color:          { bg: 'bg-rose-500/15',    border: 'border-rose-500/40',    label: 'Color'         },
  motion:         { bg: 'bg-emerald-500/15', border: 'border-emerald-500/40', label: 'Motion'        },
  detail:         { bg: 'bg-orange-500/15',  border: 'border-orange-500/40',  label: 'Detail'        },
  other:          { bg: 'bg-white/8',        border: 'border-white/15',       label: 'Other'         },
};

// ─── Confidence indicator ──────────────────────────────────────────────────
const ConfidenceDot: React.FC<{ confidence: number }> = ({ confidence }) => {
  const color =
    confidence >= 0.8 ? 'bg-emerald-400 shadow-emerald-400/40'
    : confidence >= 0.5 ? 'bg-amber-400 shadow-amber-400/40'
    : confidence > 0  ? 'bg-rose-400 shadow-rose-400/40'
    : 'bg-white/20';

  const title =
    confidence >= 0.8 ? 'High confidence — clearly visible in frame'
    : confidence >= 0.5 ? 'Medium confidence — partially visible'
    : confidence > 0  ? 'Low confidence — weakly supported'
    : 'Ungrounded — not found in any frame';

  return (
    <span
      title={title}
      className={`inline-block shrink-0 size-2 rounded-full shadow-sm ${color}`}
      style={{ boxShadow: confidence > 0 ? undefined : 'none' }}
    />
  );
};

// ─── Legend ────────────────────────────────────────────────────────────────
const Legend: React.FC = () => {
  const [open, setOpen] = useState(false);
  return (
    <div className="mb-6">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors"
      >
        <Info size={12} />
        Legend
        {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(Object.entries(CATEGORY_STYLES) as [EvidenceSentence['category'], typeof CATEGORY_STYLES[keyof typeof CATEGORY_STYLES]][])
                .filter(([k]) => k !== 'other')
                .map(([key, val]) => (
                  <div key={key} className={`px-3 py-2 rounded-xl border text-[10px] font-bold uppercase tracking-widest ${val.bg} ${val.border}`}>
                    {val.label}
                  </div>
                ))}
            </div>
            <div className="mt-3 flex items-center gap-6">
              <span className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                <span className="size-2 rounded-full bg-emerald-400" /> High confidence
              </span>
              <span className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                <span className="size-2 rounded-full bg-amber-400" /> Medium
              </span>
              <span className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                <span className="size-2 rounded-full bg-rose-400" /> Low
              </span>
              <span className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                <span className="size-2 rounded-full bg-white/20" /> Ungrounded
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Frame thumbnail ───────────────────────────────────────────────────────
interface FrameThumbProps {
  src: string;
  index: number;
  isActive: boolean;
  isHighlighted: boolean;
  isDimmed: boolean;
  sentenceCount: number;
  onClick: () => void;
  onHover: (idx: number | null) => void;
}

const FrameThumb: React.FC<FrameThumbProps> = ({
  src, index, isActive, isHighlighted, isDimmed, sentenceCount, onClick, onHover,
}) => (
  <motion.button
    layout
    onClick={onClick}
    onMouseEnter={() => onHover(index)}
    onMouseLeave={() => onHover(null)}
    className={`
      relative rounded-2xl overflow-hidden border-2 transition-all duration-200 cursor-pointer
      ${isActive   ? 'border-white shadow-lg shadow-white/20 scale-[1.04]' : ''}
      ${isHighlighted && !isActive ? 'border-white/60 scale-[1.02]' : ''}
      ${!isActive && !isHighlighted ? 'border-white/10 hover:border-white/30' : ''}
      ${isDimmed ? 'opacity-30' : 'opacity-100'}
    `}
    style={{ aspectRatio: '16/9' }}
    aria-label={`Frame ${index + 1}`}
  >
    <img src={src} alt={`Frame ${index + 1}`} className="w-full h-full object-cover" />

    {/* Frame number badge */}
    <div className="absolute top-1.5 left-1.5 bg-black/70 backdrop-blur-sm px-1.5 py-0.5 rounded-md">
      <span className="text-[9px] font-bold text-white uppercase tracking-wider">F{index + 1}</span>
    </div>

    {/* Sentence count badge */}
    {sentenceCount > 0 && (
      <div className="absolute bottom-1.5 right-1.5 bg-white/90 text-background-dark px-1.5 py-0.5 rounded-md">
        <span className="text-[9px] font-bold uppercase tracking-wider">{sentenceCount}</span>
      </div>
    )}

    {/* Active ring glow */}
    {isActive && (
      <div className="absolute inset-0 ring-2 ring-white/30 ring-inset rounded-2xl pointer-events-none" />
    )}
  </motion.button>
);

// ─── Sentence chip ─────────────────────────────────────────────────────────
interface SentenceChipProps {
  sentence: EvidenceSentence;
  isActive: boolean;
  isHighlighted: boolean;
  isDimmed: boolean;
  frameCount: number;
  onClick: () => void;
  onHover: (id: string | null) => void;
}

const SentenceChip: React.FC<SentenceChipProps> = ({
  sentence, isActive, isHighlighted, isDimmed, frameCount, onClick, onHover,
}) => {
  const style = CATEGORY_STYLES[sentence.category] || CATEGORY_STYLES.other;
  const isUngrounded = sentence.frameIndices.length === 0;

  return (
    <motion.div
      layout
      onClick={onClick}
      onMouseEnter={() => onHover(sentence.id)}
      onMouseLeave={() => onHover(null)}
      className={`
        relative flex items-start gap-2.5 px-4 py-3 rounded-2xl border cursor-pointer
        transition-all duration-200 select-none
        ${isActive ? `${style.bg} ${style.border} ring-1 ring-white/20` : ''}
        ${isHighlighted && !isActive ? `${style.bg} ${style.border}` : ''}
        ${!isActive && !isHighlighted ? 'bg-white/3 border-white/8 hover:bg-white/6 hover:border-white/15' : ''}
        ${isDimmed ? 'opacity-25' : 'opacity-100'}
      `}
    >
      <ConfidenceDot confidence={sentence.confidence} />

      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-200 leading-relaxed font-medium">{sentence.text}</p>
        <div className="mt-1.5 flex items-center gap-3 flex-wrap">
          <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${style.bg} ${style.border}`}>
            {style.label}
          </span>
          {isUngrounded ? (
            <span className="flex items-center gap-1 text-[9px] font-bold text-rose-400 uppercase tracking-widest">
              <AlertCircle size={10} /> No frame match
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
              <CheckCircle2 size={10} className="text-emerald-400" />
              {sentence.frameIndices.length === 1
                ? `Frame ${sentence.frameIndices[0] + 1}`
                : `Frames ${sentence.frameIndices.map(i => i + 1).join(', ')}`}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// ─── Stats bar ─────────────────────────────────────────────────────────────
const StatsBar: React.FC<{ evidence: PromptEvidence }> = ({ evidence }) => {
  const total = evidence.sentences.length;
  const grounded = evidence.sentences.filter(s => s.frameIndices.length > 0).length;
  const highConf = evidence.sentences.filter(s => s.confidence >= 0.8).length;
  const ungrounded = total - grounded;
  const pct = total > 0 ? Math.round((grounded / total) * 100) : 0;

  return (
    <div className="flex flex-wrap items-center gap-6 mb-6 px-6 py-4 rounded-2xl bg-white/3 border border-white/8">
      <div className="text-center">
        <div className="text-2xl font-bold font-heading">{pct}%</div>
        <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Grounded</div>
      </div>
      <div className="w-px h-8 bg-white/10" />
      <div className="text-center">
        <div className="text-2xl font-bold font-heading text-emerald-400">{highConf}</div>
        <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">High conf.</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold font-heading text-amber-400">{grounded - highConf}</div>
        <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Med/low conf.</div>
      </div>
      {ungrounded > 0 && (
        <div className="text-center">
          <div className="text-2xl font-bold font-heading text-rose-400">{ungrounded}</div>
          <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Ungrounded</div>
        </div>
      )}
      {/* Coverage bar */}
      <div className="flex-1 min-w-32">
        <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="h-full rounded-full bg-emerald-400"
          />
        </div>
        <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">
          {grounded} of {total} claims evidence-grounded
        </div>
      </div>
    </div>
  );
};

// ─── Main component ────────────────────────────────────────────────────────
interface EvidenceViewProps {
  frames: string[];
  structuredPrompt: StructuredPrompt;
}

const EvidenceView: React.FC<EvidenceViewProps> = ({ frames, structuredPrompt }) => {
  const [evidence, setEvidence] = useState<PromptEvidence | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Interaction state
  const [activeFrameIdx, setActiveFrameIdx] = useState<number | null>(null);
  const [activeSentenceId, setActiveSentenceId] = useState<string | null>(null);
  const [hoveredFrameIdx, setHoveredFrameIdx] = useState<number | null>(null);
  const [hoveredSentenceId, setHoveredSentenceId] = useState<string | null>(null);

  // Derived: which frame / sentence is the "focus" (active beats hovered)
  const focusFrame = activeFrameIdx ?? hoveredFrameIdx;
  const focusSentence = activeSentenceId ?? hoveredSentenceId;

  // Set of sentence IDs supported by the currently focused frame
  const highlightedSentenceIds = useMemo<Set<string>>(() => {
    if (focusFrame === null || !evidence) return new Set();
    return new Set(evidence.frameIndex[focusFrame] ?? []);
  }, [focusFrame, evidence]);

  // Set of frame indices cited by the currently focused sentence
  const highlightedFrameIdxs = useMemo<Set<number>>(() => {
    if (!focusSentence || !evidence) return new Set();
    const s = evidence.sentences.find(x => x.id === focusSentence);
    return new Set(s?.frameIndices ?? []);
  }, [focusSentence, evidence]);

  // Whether we're in "frame-focused" or "sentence-focused" mode
  // (determines which set of highlights takes precedence)
  const frameIsFocus = focusFrame !== null && focusSentence === null;
  const sentenceIsFocus = focusSentence !== null;
  const anyFocus = frameIsFocus || sentenceIsFocus;

  const handleRunAnalysis = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const result = await generatePromptEvidence(structuredPrompt.core_focus, frames);
      setEvidence(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Evidence analysis failed.');
    } finally {
      setIsLoading(false);
    }
  }, [structuredPrompt.core_focus, frames]);

  const handleFrameClick = useCallback((idx: number) => {
    setActiveSentenceId(null);
    setActiveFrameIdx(prev => (prev === idx ? null : idx));
  }, []);

  const handleSentenceClick = useCallback((id: string) => {
    setActiveFrameIdx(null);
    setActiveSentenceId(prev => (prev === id ? null : id));
  }, []);

  // ── Empty / loading state ────────────────────────────────────────────────
  if (!evidence && !isLoading) {
    return (
      <div className="glassmorphic-card rounded-[2rem] p-10 flex flex-col items-center text-center gap-6 border border-white/10">
        <div className="size-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
          <Microscope size={32} className="text-slate-500" />
        </div>
        <div>
          <h3 className="text-lg font-bold font-heading uppercase tracking-widest mb-2">Evidence Inspector</h3>
          <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
            Runs a grounding analysis that maps every claim in the prompt to the specific
            frames that visually support it.
          </p>
        </div>
        {frames.length === 0 ? (
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-widest">
            <HelpCircle size={14} />
            Requires original media frames — re-analyse a video or image first.
          </div>
        ) : (
          <BlurryButton onClick={handleRunAnalysis} className="px-10">
            <Microscope size={18} />
            Run evidence analysis
          </BlurryButton>
        )}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="glassmorphic-card rounded-[2rem] p-12 flex flex-col items-center gap-6 border border-white/10">
        <Loader2 className="size-12 text-white animate-spin opacity-40" />
        <div className="space-y-2 text-center">
          <p className="text-sm font-bold uppercase tracking-widest">Mapping evidence…</p>
          <p className="text-xs text-slate-400">
            Tracing each prompt claim back to specific frames
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glassmorphic-card rounded-[2rem] p-8 border border-rose-500/20 bg-rose-500/5 text-center space-y-4">
        <AlertCircle className="size-10 text-rose-400 mx-auto" />
        <p className="text-sm text-rose-300">{error}</p>
        <BlurryButton onClick={handleRunAnalysis}>Retry</BlurryButton>
      </div>
    );
  }

  // ── Main view ────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 h-[800px] overflow-y-auto scrollbar-thin pr-2">

      {/* Stats */}
      <StatsBar evidence={evidence!} />

      {/* Legend */}
      <Legend />

      {/* Hint */}
      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
        Click a frame to see its supported claims — click a claim to see its source frames
      </p>

      {/* Side-by-side layout */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">

        {/* ── LEFT: Frame grid ─────────────────────────────────────────── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Source frames ({frames.length})
            </h3>
            {activeFrameIdx !== null && (
              <button
                onClick={() => setActiveFrameIdx(null)}
                className="text-[9px] font-bold text-slate-500 hover:text-white uppercase tracking-widest transition-colors"
              >
                Clear
              </button>
            )}
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 xl:grid-cols-3 gap-2">
            {frames.map((src, idx) => {
              const sentCount = evidence?.frameIndex[idx]?.length ?? 0;
              const isActive = activeFrameIdx === idx;
              const isHighlighted = highlightedFrameIdxs.has(idx);
              const isDimmed = anyFocus && !isActive && !isHighlighted &&
                !(hoveredFrameIdx === idx) && !(frameIsFocus && focusFrame === idx);

              return (
                <FrameThumb
                  key={idx}
                  src={src}
                  index={idx}
                  isActive={isActive}
                  isHighlighted={isHighlighted && sentenceIsFocus}
                  isDimmed={isDimmed}
                  sentenceCount={sentCount}
                  onClick={() => handleFrameClick(idx)}
                  onHover={setHoveredFrameIdx}
                />
              );
            })}
          </div>

          {/* Active frame detail panel */}
          <AnimatePresence mode="wait">
            {activeFrameIdx !== null && evidence && (
              <motion.div
                key={`frame-detail-${activeFrameIdx}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="p-4 rounded-2xl bg-white/3 border border-white/8 space-y-2"
              >
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                  Frame {activeFrameIdx + 1} supports {highlightedSentenceIds.size} claim{highlightedSentenceIds.size !== 1 ? 's' : ''}
                </p>
                <img
                  src={frames[activeFrameIdx]}
                  alt={`Frame ${activeFrameIdx + 1} expanded`}
                  className="w-full rounded-xl border border-white/10 object-cover"
                  style={{ maxHeight: '200px', objectFit: 'cover' }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── RIGHT: Annotated sentences ───────────────────────────────── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Prompt claims ({evidence!.sentences.length})
            </h3>
            {activeSentenceId !== null && (
              <button
                onClick={() => setActiveSentenceId(null)}
                className="text-[9px] font-bold text-slate-500 hover:text-white uppercase tracking-widest transition-colors"
              >
                Clear
              </button>
            )}
          </div>

          <div className="space-y-2 max-h-[680px] overflow-y-auto pr-1 scrollbar-thin">
            {evidence!.sentences.map(s => {
              const isActive = activeSentenceId === s.id;
              const isHighlighted = highlightedSentenceIds.has(s.id) && frameIsFocus;
              const isDimmed = anyFocus && !isActive && !isHighlighted &&
                hoveredSentenceId !== s.id;

              return (
                <SentenceChip
                  key={s.id}
                  sentence={s}
                  isActive={isActive}
                  isHighlighted={isHighlighted}
                  isDimmed={isDimmed}
                  frameCount={frames.length}
                  onClick={() => handleSentenceClick(s.id)}
                  onHover={setHoveredSentenceId}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Re-run button */}
      <div className="pt-4 border-t border-white/5">
        <button
          onClick={() => { setEvidence(null); setActiveFrameIdx(null); setActiveSentenceId(null); }}
          className="text-[10px] font-bold text-slate-500 hover:text-white uppercase tracking-widest transition-colors"
        >
          Reset analysis
        </button>
      </div>
    </div>
  );
};

export default EvidenceView;
