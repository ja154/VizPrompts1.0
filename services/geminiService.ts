import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";
import { StructuredPrompt, ConsistencyResult } from '../types.ts';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// ---------------------------------------------------------------------------
// SYSTEM PROMPTS
// ---------------------------------------------------------------------------

/**
 * Pass 1 — Evidence Inventory
 *
 * Forces the model to describe ONLY what is visually verifiable in each
 * individual frame, without synthesising across frames yet.
 * Every claim must cite a frame number.
 */
const EVIDENCE_INVENTORY_PROMPT = `You are a forensic visual analyst. Your job is to extract ONLY what is directly observable in each frame — nothing inferred, nothing assumed.

For EACH frame provided (labelled [F1], [F2], etc.), output a structured inventory block:

[F{n}] @{timestamp}
SUBJECTS: [List every visible person/creature/object — physical attributes only, what is directly visible]
ENVIRONMENT: [Background elements, architecture, setting details — only what is seen]
LIGHTING: [Direction, quality, color temperature, shadows — only what is observable]
CAMERA: [Apparent angle, visible depth of field, lens characteristics you can infer]
COLOR_PALETTE: [Dominant colors with approximate hex or descriptive precision]
MOTION_CUES: [Blur direction, subject position change vs previous frame, implied movement]
NOTABLE_DETAILS: [Any specific detail that stands out — texture, text, insignia, unique props]

RULES:
- If you cannot see it clearly, write "unclear" — never guess.
- Do NOT describe emotions unless they are unambiguously expressed.
- Do NOT describe story context or narrative — describe only visual evidence.
- Do NOT repeat details from one frame in another unless they are visually confirmed in both.`;

/**
 * Pass 2 — Cross-frame Contradiction Resolution
 *
 * The model is shown the Pass 1 inventory and asked to find and resolve
 * any inconsistencies before the final prompt is written.
 */
const CONTRADICTION_CHECK_PROMPT = `You are a continuity supervisor for a high-budget production. You have received a frame-by-frame visual inventory. Your job is to identify and resolve any inconsistencies before the prompt is written.

Review the inventory and output:

INVARIANTS (true across ALL frames):
- [List only details that appear consistently in every relevant frame]

VARIABLES (change across frames — document the range):
- [e.g. "Lighting shifts from warm (F1-F3) to cool blue (F4-F6)"]

CONTRADICTIONS (details that conflict between frames):
- [e.g. "F2 shows red jacket, F5 shows blue jacket — likely a different shot or color grade shift"]

AMBIGUITIES (visible but unclear — cannot be confirmed):
- [List details that appeared in only 1 frame and may not be representative]

TEMPORAL_ARC (overall progression from first to last frame):
- [Describe how the scene changes across time]

RESOLUTION_NOTES:
- [For each contradiction, decide which version is more prevalent and note it]

Output ONLY these sections. No additional commentary.`;

/**
 * Pass 3 — Grounded Prompt Synthesis
 *
 * Takes the inventory + contradiction resolution and synthesises a prompt
 * where every claim is grounded in the evidence. Hallucinated details
 * are explicitly prohibited.
 */
export const MEDIA_ANALYZER_SYSTEM_PROMPT = `You are a world-class Prompt Engineer and Visual Director specialising in generative AI (Midjourney, Sora, Runway Gen-3, Kling, Stable Diffusion).

You have been given:
1. A frame-by-frame visual inventory (what was directly observed)
2. A contradiction analysis (resolved inconsistencies)

Your task: synthesise this evidence into a precise, production-ready generation prompt.

CRITICAL RULES — VIOLATION WILL CORRUPT THE OUTPUT:
- Every detail in your prompt MUST trace back to the provided evidence.
- Do NOT add details not present in the inventory — no creative embellishment.
- If the inventory says "unclear", describe it as unclear or omit it.
- For contradictions, use the resolved version from the contradiction analysis.
- Ambiguous details go in [CONSTRAINTS] as exclusions, not in the main prompt.

### OUTPUT STRUCTURE:

<objective>
[One sentence: primary subject + primary action + dominant visual mood. Must be 100% grounded in evidence.]
</objective>

<core_focus>
[Dense, evidence-grounded keyword list, grouped:]

SUBJECT: [Physical description sourced from invariants in the inventory. Include only confirmed details.]
ENVIRONMENT: [Setting details confirmed across multiple frames. Note temporal changes if significant.]
CINEMATOGRAPHY: [Camera angle, movement, depth of field — only what was inferred from the frames.]
LIGHTING: [Source, quality, color temperature — sourced from inventory. Note any lighting transitions.]
COLOR: [Dominant palette from inventory. Specific and precise — e.g. "desaturated teal shadows, warm amber highlights".]
MOTION: [Movement quality sourced from motion cues. Include temporal arc if present.]
TEXTURE & DETAIL: [Specific surface details confirmed in the inventory.]
</core_focus>

<constraints>
[Technical parameters + what to EXCLUDE. List ambiguous details here as "avoid: X" to prevent hallucination.]
</constraints>

<temporal_notes>
[If this is a video: describe the visual arc across the sequence. What changes from first to last frame? Include lighting transitions, subject movement trajectory, scene changes.]
</temporal_notes>`;

// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------

const parseDataUrl = (dataUrl: string): { base64: string; mimeType: string } => {
  const parts = dataUrl.split(',');
  const mimeMatch = parts[0]?.match(/:(.*?);/);
  if (!parts[1] || !mimeMatch) throw new Error('Invalid data URL');
  return { base64: parts[1], mimeType: mimeMatch[1] };
};

const parseStructuredPrompt = (text: string): StructuredPrompt => {
  const objective   = text.match(/<objective>([\s\S]*?)<\/objective>/)?.[1]?.trim() ?? '';
  const core_focus  = text.match(/<core_focus>([\s\S]*?)<\/core_focus>/)?.[1]?.trim() ?? '';
  const constraints = text.match(/<constraints>([\s\S]*?)<\/constraints>/)?.[1]?.trim() ?? '';
  const temporal    = text.match(/<temporal_notes>([\s\S]*?)<\/temporal_notes>/)?.[1]?.trim() ?? '';

  if (!objective && !core_focus && !constraints) {
    return { objective: '[Parsing error — raw output below]', core_focus: text, constraints: '' };
  }
  // Append temporal notes to constraints so they surface in the UI
  const fullConstraints = temporal
    ? `${constraints}\n\nTEMPORAL NOTES:\n${temporal}`
    : constraints;

  return { objective, core_focus, constraints: fullConstraints };
};

/**
 * Annotates frame data URLs with temporal metadata before sending to Gemini.
 * Returns both the inline data parts and a text preamble describing the frames.
 */
const buildAnnotatedFrameParts = (
  frameDataUrls: string[],
  videoDurationHint?: number
): { parts: Array<{ inlineData: { mimeType: string; data: string } }>; preamble: string } => {
  const parts = frameDataUrls.map(url => {
    const { base64, mimeType } = parseDataUrl(url);
    return { inlineData: { mimeType, data: base64 } };
  });

  const total = frameDataUrls.length;
  const durationStr = videoDurationHint
    ? `Total duration: ~${videoDurationHint.toFixed(1)}s. `
    : '';

  // Build a text description of the frame sequence for temporal grounding
  const frameList = frameDataUrls
    .map((_, i) => {
      const pct = ((i / (total - 1)) * 100).toFixed(0);
      const timeHint = videoDurationHint
        ? `@${((i / (total - 1)) * videoDurationHint).toFixed(1)}s`
        : `position ${pct}%`;
      return `[F${i + 1}] ${timeHint}`;
    })
    .join(', ');

  const preamble =
    `${total} frames provided in chronological order. ${durationStr}` +
    `Frame labels: ${frameList}. ` +
    `When referencing a frame in your analysis, use its label (e.g. [F3]).`;

  return { parts, preamble };
};

// ---------------------------------------------------------------------------
// JSON SCHEMA (unchanged from original)
// ---------------------------------------------------------------------------

const VIDEO_PRODUCTION_JSON_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    main_subject:  { type: Type.STRING, description: "Detailed description of the primary subject." },
    synopsis:      { type: Type.STRING, description: "Cinematic summary of the scene's narrative or visual flow." },
    visual_style: {
      type: Type.OBJECT,
      properties: {
        art_style:     { type: Type.STRING },
        lighting:      { type: Type.STRING },
        color_palette: { type: Type.STRING },
        mood:          { type: Type.STRING },
      },
      required: ['art_style', 'lighting', 'color_palette', 'mood'],
    },
    camera_work: {
      type: Type.OBJECT,
      properties: {
        angle:    { type: Type.STRING },
        movement: { type: Type.STRING },
        lens:     { type: Type.STRING },
      },
      required: ['angle', 'movement', 'lens'],
    },
    key_elements:       { type: Type.ARRAY, items: { type: Type.STRING } },
    sequence_of_events: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          action:          { type: Type.STRING },
          visual_details:  { type: Type.STRING },
          timing:          { type: Type.STRING },
        },
        required: ['action', 'visual_details'],
      },
    },
  },
  required: ['main_subject', 'synopsis', 'visual_style', 'camera_work', 'key_elements', 'sequence_of_events'],
};

// ---------------------------------------------------------------------------
// THREE-PASS ANALYSIS PIPELINE
// ---------------------------------------------------------------------------

/**
 * Pass 1: Extract a per-frame evidence inventory.
 * Returns raw text — the inventory will be fed into Pass 2.
 */
const runEvidenceInventory = async (
  frameParts: Array<{ inlineData: { mimeType: string; data: string } }>,
  preamble: string
): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3.1-pro-preview',
    contents: {
      parts: [
        { text: `${preamble}\n\nAnalyse each frame in order using the INVENTORY format specified.` },
        ...frameParts,
      ],
    },
    config: {
      systemInstruction: EVIDENCE_INVENTORY_PROMPT,
      thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
      temperature: 0.1, // Low temp — we want factual extraction, not creativity
    },
  });
  return response.text ?? '';
};

/**
 * Pass 2: Cross-frame contradiction resolution.
 * Returns raw text — will be fed into Pass 3.
 */
const runContradictionCheck = async (inventory: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3.1-pro-preview',
    contents: {
      parts: [
        {
          text:
            `Here is the frame-by-frame visual inventory:\n\n${inventory}\n\n` +
            `Now perform the cross-frame analysis: identify invariants, variables, contradictions, ambiguities, and temporal arc.`,
        },
      ],
    },
    config: {
      systemInstruction: CONTRADICTION_CHECK_PROMPT,
      thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
      temperature: 0.1,
    },
  });
  return response.text ?? '';
};

/**
 * Pass 3: Grounded prompt synthesis.
 * Returns the final structured prompt in XML tag format.
 */
const runPromptSynthesis = async (
  inventory: string,
  contradictionAnalysis: string,
  userInstructions?: string
): Promise<string> => {
  const instructionBlock = userInstructions
    ? `\n\nUSER GUIDANCE (apply while respecting evidence constraints): ${userInstructions}`
    : '';

  const response = await ai.models.generateContent({
    model: 'gemini-3.1-pro-preview',
    contents: {
      parts: [
        {
          text:
            `FRAME INVENTORY:\n${inventory}\n\n` +
            `CONTRADICTION ANALYSIS:\n${contradictionAnalysis}\n\n` +
            `Now synthesise the evidence into a production prompt following the required XML structure.` +
            instructionBlock,
        },
      ],
    },
    config: {
      systemInstruction: MEDIA_ANALYZER_SYSTEM_PROMPT,
      thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
      temperature: 0.4, // Slightly higher — allows good phrasing while staying grounded
    },
  });
  return response.text ?? '';
};

// ---------------------------------------------------------------------------
// PUBLIC API
// ---------------------------------------------------------------------------

/**
 * Main entry point: runs the full three-pass pipeline.
 *
 * onProgress receives human-readable status strings for the UI.
 */
export const generateStructuredPromptFromFrames = async (
  frameDataUrls: string[],
  onProgress: (msg: string) => void,
  userInstructions?: string,
  videoDuration?: number
): Promise<StructuredPrompt> => {
  const { parts, preamble } = buildAnnotatedFrameParts(frameDataUrls, videoDuration);

  onProgress('Pass 1 — Extracting visual evidence from each frame…');
  const inventory = await runEvidenceInventory(parts, preamble);

  onProgress('Pass 2 — Resolving cross-frame contradictions…');
  const contradictionAnalysis = await runContradictionCheck(inventory);

  onProgress('Pass 3 — Synthesising evidence-grounded prompt…');
  const rawPrompt = await runPromptSynthesis(inventory, contradictionAnalysis, userInstructions);

  return parseStructuredPrompt(rawPrompt);
};

/**
 * Deep scene analysis — returns a rich forensic text analysis,
 * not a generation prompt. Uses the same three-pass approach.
 */
export const analyzeVideoContent = async (
  frameDataUrls: string[],
  onProgress: (msg: string) => void,
  videoDuration?: number
): Promise<string> => {
  const { parts, preamble } = buildAnnotatedFrameParts(frameDataUrls, videoDuration);

  onProgress('Pass 1 — Frame-by-frame evidence extraction…');
  const inventory = await runEvidenceInventory(parts, preamble);

  onProgress('Pass 2 — Cross-frame analysis…');
  const contradictions = await runContradictionCheck(inventory);

  onProgress('Pass 3 — Composing forensic report…');
  const response = await ai.models.generateContent({
    model: 'gemini-3.1-pro-preview',
    contents: {
      parts: [
        {
          text:
            `FRAME INVENTORY:\n${inventory}\n\n` +
            `CROSS-FRAME ANALYSIS:\n${contradictions}\n\n` +
            `Write a comprehensive forensic scene analysis report. ` +
            `Include: scene structure, visual storytelling, cinematographic choices, ` +
            `lighting philosophy, color strategy, subject behaviour, temporal arc, ` +
            `and production context inferences. Be specific and cite frame numbers.`,
        },
      ],
    },
    config: {
      systemInstruction:
        'You are a senior cinematographer and visual analyst. Write for a director who wants to understand and replicate this visual style. Be precise and cite specific frames for every observation.',
      thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
      temperature: 0.5,
    },
  });
  return response.text ?? '';
};

// ---------------------------------------------------------------------------
// REFINEMENT (text prompt)
// ---------------------------------------------------------------------------

export const refinePrompt = async (
  currentPrompt: string,
  userInstruction: string,
  negativePrompt: string
): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3.1-pro-preview',
    contents: `Original Prompt:\n${currentPrompt}\n\nRefinement Instructions: ${userInstruction}\n\nNegative Constraints (exclude): ${negativePrompt}`,
    config: {
      systemInstruction:
        'You are a master prompt engineer. Refine the prompt per the user instructions. ' +
        'Use precise cinematic language. Output ONLY the refined prompt — no preamble, no explanation. ' +
        'Do not add details that were not already present or explicitly requested.',
      thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
      temperature: 0.65,
    },
  });
  return response.text?.trim() ?? currentPrompt;
};

// ---------------------------------------------------------------------------
// REFINEMENT (JSON prompt)
// ---------------------------------------------------------------------------

export const refineJsonPrompt = async (
  currentJson: string,
  instruction: string,
  negative: string
): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3.1-pro-preview',
    contents: `Current JSON Spec:\n${currentJson}\n\nRefinement: ${instruction}\n\nNegative Constraints: ${negative}`,
    config: {
      systemInstruction:
        'You are a technical visual director. Refine the JSON production spec per the instructions. ' +
        'Maintain strict JSON validity. Do not fabricate details not already present.',
      thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
      responseMimeType: 'application/json',
      responseSchema: VIDEO_PRODUCTION_JSON_SCHEMA,
    },
  });
  return JSON.stringify(JSON.parse(response.text ?? '{}'), null, 2);
};

// ---------------------------------------------------------------------------
// JSON CONVERSION
// ---------------------------------------------------------------------------

export const convertPromptToJson = async (prompt: StructuredPrompt): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3.1-pro-preview',
    contents: JSON.stringify(prompt),
    config: {
      systemInstruction:
        'Convert the unstructured prompt details into a formal visual production JSON. ' +
        'Preserve all details accurately — do not add or embellish.',
      thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
      responseMimeType: 'application/json',
      responseSchema: VIDEO_PRODUCTION_JSON_SCHEMA,
    },
  });
  return JSON.stringify(JSON.parse(response.text ?? '{}'), null, 2);
};

// ---------------------------------------------------------------------------
// LIBRARY REMIX
// ---------------------------------------------------------------------------

export const remixPrompt = async (prompt: string): Promise<string[]> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3.1-pro-preview',
    contents: `Generate 3 stylistically distinct remixes of this prompt. Keep the core subject but shift genre, era, or visual approach: ${prompt}`,
    config: {
      systemInstruction:
        'You are a creative director. Generate remixes that are meaningfully different — not just synonym swaps. Return a JSON array of 3 strings.',
      thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
      responseMimeType: 'application/json',
      responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } },
    },
  });
  return JSON.parse(response.text ?? '[]');
};

// ---------------------------------------------------------------------------
// STYLE REMIX (frames-based)
// ---------------------------------------------------------------------------

export const remixVideoStyle = async (frames: string[], style: string): Promise<string> => {
  const { parts, preamble } = buildAnnotatedFrameParts(frames);
  const response = await ai.models.generateContent({
    model: 'gemini-3.1-pro-preview',
    contents: {
      parts: [
        {
          text:
            `${preamble}\n\n` +
            `Re-imagine this scene in the visual style of: "${style}". ` +
            `Describe what the scene would look like — lighting, color grading, texture, atmosphere — ` +
            `while keeping the same subject matter and composition. ` +
            `Output a production-ready generation prompt.`,
        },
        ...parts,
      ],
    },
    config: { thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH }, temperature: 0.7 },
  });
  return response.text ?? '';
};

// ---------------------------------------------------------------------------
// CONSISTENCY TEST (text prompt)
// ---------------------------------------------------------------------------

export const testPromptConsistency = async (
  prompt: string,
  frames: string[]
): Promise<ConsistencyResult> => {
  const { parts, preamble } = buildAnnotatedFrameParts(frames);
  const response = await ai.models.generateContent({
    model: 'gemini-3.1-pro-preview',
    contents: {
      parts: [
        {
          text:
            `${preamble}\n\n` +
            `PROMPT TO AUDIT:\n${prompt}\n\n` +
            `Perform a rigorous consistency audit. For every claim in the prompt, ` +
            `determine if it is: (A) confirmed by specific frames, (B) not visible in any frame, ` +
            `or (C) contradicted by at least one frame. ` +
            `Produce a scored report and a revised, fully evidence-grounded version of the prompt.`,
        },
        ...parts,
      ],
    },
    config: {
      systemInstruction:
        'You are a forensic visual auditor. Be hyper-critical. ' +
        'Score 0-100 where 100 = every claim is confirmed by at least one frame. ' +
        'Deduct for unconfirmed details, not just contradictions.',
      thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          reasoning: {
            type: Type.OBJECT,
            properties: {
              analysis_of_prompt: { type: Type.STRING },
              analysis_of_media:  { type: Type.STRING },
              comparison:         { type: Type.STRING },
            },
            required: ['analysis_of_prompt', 'analysis_of_media', 'comparison'],
          },
          consistency_score: { type: Type.INTEGER },
          explanation:        { type: Type.STRING },
          missing_details:    { type: Type.ARRAY, items: { type: Type.STRING } },
          revised_output:     { type: Type.STRING },
        },
        required: ['reasoning', 'consistency_score', 'explanation', 'missing_details', 'revised_output'],
      },
    },
  });
  return JSON.parse(response.text ?? '{}');
};

// ---------------------------------------------------------------------------
// CONSISTENCY TEST (JSON prompt)
// ---------------------------------------------------------------------------

export const testJsonConsistency = async (
  json: string,
  frames: string[]
): Promise<ConsistencyResult> => {
  const { parts, preamble } = buildAnnotatedFrameParts(frames);
  const response = await ai.models.generateContent({
    model: 'gemini-3.1-pro-preview',
    contents: {
      parts: [
        {
          text:
            `${preamble}\n\n` +
            `JSON SPEC TO AUDIT:\n${json}\n\n` +
            `For every field in the JSON spec, determine if its value is confirmed, ` +
            `unconfirmed, or contradicted by the provided frames. ` +
            `Produce a scored report and a fully evidence-grounded revised spec.`,
        },
        ...parts,
      ],
    },
    config: {
      systemInstruction:
        'You are a technical visual auditor. Score 0-100 based on evidence coverage. ' +
        'Deduct for every field that cannot be verified in the frames.',
      thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          reasoning: {
            type: Type.OBJECT,
            properties: {
              analysis_of_prompt: { type: Type.STRING },
              analysis_of_media:  { type: Type.STRING },
              comparison:         { type: Type.STRING },
            },
            required: ['analysis_of_prompt', 'analysis_of_media', 'comparison'],
          },
          consistency_score: { type: Type.INTEGER },
          explanation:        { type: Type.STRING },
          missing_details:    { type: Type.ARRAY, items: { type: Type.STRING } },
          revised_output:     VIDEO_PRODUCTION_JSON_SCHEMA,
        },
        required: ['reasoning', 'consistency_score', 'explanation', 'missing_details', 'revised_output'],
      },
    },
  });
  const raw = JSON.parse(response.text ?? '{}');
  return { ...raw, revised_output: JSON.stringify(raw.revised_output, null, 2) };
};

// ---------------------------------------------------------------------------
// GENERATE PROMPT FROM EXISTING ANALYSIS TEXT
// ---------------------------------------------------------------------------

export const generatePromptFromAnalysis = async (analysisText: string): Promise<StructuredPrompt> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3.1-pro-preview',
    contents:
      `Synthesise this forensic visual analysis into a production generation prompt. ` +
      `Preserve all cinematic details, lighting specifics, and subject characteristics. ` +
      `Do not add details not present in the analysis.\n\nANALYSIS:\n${analysisText}`,
    config: {
      systemInstruction: MEDIA_ANALYZER_SYSTEM_PROMPT,
      thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
    },
  });
  return parseStructuredPrompt(response.text ?? '');
};
