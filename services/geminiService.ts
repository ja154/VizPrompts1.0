import { GoogleGenAI, Type } from "@google/genai";
import { StructuredPrompt, ConsistencyResult } from '../types.ts';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const MEDIA_ANALYZER_SYSTEM_PROMPT = `You are a world-class Prompt Engineer and Visual Director specializing in high-end generative AI (like Midjourney, Sora, Runway Gen-3, and Stable Diffusion). Your mission is to perform a forensic visual analysis of the provided media and synthesize it into a precise, high-fidelity production prompt.

Your analysis must be exhaustive, capturing nuances that a casual observer would miss. You MUST ensure 100% consistency between the generated prompt and the reference media.

### OUTPUT STRUCTURE:

<objective>
[A single, high-impact sentence defining the primary subject and action.]
</objective>

<core_focus>
[A dense, comma-separated list of keywords. Group them by:
- SUBJECT: Detailed physical description, textures, expressions, attire. Focus on invariant features across frames.
- ENVIRONMENT: Architecture, nature, specific objects, atmospheric conditions. Precise spatial layout.
- CINEMATOGRAPHY: Lens (e.g., 35mm anamorphic), camera angle (e.g., low-angle hero shot), camera movement (e.g., slow dolly zoom), depth of field.
- LIGHTING: Source (e.g., volumetric sunlight), quality (e.g., soft-box diffusion), shadows (e.g., long dramatic shadows).
- COLOR: Specific palette (e.g., teal and orange grade), saturation, contrast.
- MOTION: Fluidity, speed, specific kinetic energy of subjects and camera. Describe the arc of motion.]
</core_focus>

<constraints>
[Technical requirements: Aspect ratio, frame rate, style (e.g., hyper-realistic, 16mm film grain, digital 8k), and what to EXCLUDE.]
</constraints>

### ANALYSIS GUIDELINES:
1. **Subject Forensic:** Don't just say "a person". Describe the fabric of their shirt, the micro-expressions on their face, the way light hits their skin. Ensure the description matches ALL provided frames.
2. **Environmental Depth:** Describe the "air" in the scene. Is it dusty? Misty? Crystal clear? Describe the background elements with as much care as the foreground.
3. **Cinematic Language:** Use professional terminology. Mention specific lenses, camera rigs (gimbal, handheld, crane), and lighting setups (Rembrandt, rim lighting, high-key).
4. **Temporal Awareness:** For video, capture the *change* over time. How does the light shift? How does the subject's momentum evolve? Ensure the prompt describes a coherent sequence.
5. **Fidelity over Generality:** Avoid generic words like "beautiful" or "cool". Use specific descriptors like "iridescent", "brutalist", "chiaroscuro", "kinetic".
6. **Consistency Check:** Before outputting, cross-reference your prompt against every single frame provided. If a detail in your prompt contradicts any frame, correct it.`;

const VIDEO_PRODUCTION_JSON_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        main_subject: { type: Type.STRING, description: "Detailed description of the primary subject including textures and attire." },
        synopsis: { type: Type.STRING, description: "A cinematic summary of the scene's narrative or visual flow." },
        visual_style: {
            type: Type.OBJECT,
            properties: {
                art_style: { type: Type.STRING, description: "Specific aesthetic (e.g., Cyberpunk, Neo-Noir, Photorealistic)." },
                lighting: { type: Type.STRING, description: "Detailed lighting setup (e.g., Golden hour volumetric rays)." },
                color_palette: { type: Type.STRING, description: "Specific hex codes or descriptive color schemes." },
                mood: { type: Type.STRING, description: "The emotional resonance of the scene." }
            },
            required: ["art_style", "lighting", "color_palette", "mood"]
        },
        camera_work: {
            type: Type.OBJECT,
            properties: {
                angle: { type: Type.STRING, description: "Specific camera angle (e.g., Dutch angle, bird's eye view)." },
                movement: { type: Type.STRING, description: "Dynamic camera movement (e.g., Parallax tracking shot)." },
                lens: { type: Type.STRING, description: "Lens characteristics (e.g., 85mm f/1.8 prime)." }
            },
            required: ["angle", "movement", "lens"]
        },
        key_elements: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of critical props or background details." },
        sequence_of_events: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    action: { type: Type.STRING },
                    visual_details: { type: Type.STRING },
                    timing: { type: Type.STRING, description: "Relative timing within the sequence." }
                },
                required: ["action", "visual_details"]
            }
        }
    },
    required: ["main_subject", "synopsis", "visual_style", "camera_work", "key_elements", "sequence_of_events"]
};

const parseDataUrl = (dataUrl: string) => {
    const parts = dataUrl.split(',');
    const header = parts[0];
    const data = parts[1];
    const mimeTypeMatch = header?.match(/:(.*?);/);
    if (data && mimeTypeMatch) return { base64: data, mimeType: mimeTypeMatch[1] };
    throw new Error('Invalid data URL');
};

const parseStructuredPrompt = (responseText: string): StructuredPrompt => {
    const objective = responseText.match(/<objective>([\s\S]*?)<\/objective>/)?.[1]?.trim() || '';
    const core_focus = responseText.match(/<core_focus>([\s\S]*?)<\/core_focus>/)?.[1]?.trim() || '';
    const constraints = responseText.match(/<constraints>([\s\S]*?)<\/constraints>/)?.[1]?.trim() || '';
    if (!objective && !core_focus && !constraints) {
        return { objective: "[Parsing Error]", core_focus: responseText, constraints: "" };
    }
    return { objective, core_focus, constraints };
};

export const generateStructuredPromptFromFrames = async (frameDataUrls: string[], onProgress: (msg: string) => void, userInstructions?: string): Promise<StructuredPrompt> => {
    onProgress('Engineering High-Fidelity Prompt...');
    const imageParts = frameDataUrls.map(url => {
        const { base64, mimeType } = parseDataUrl(url);
        return { inlineData: { mimeType, data: base64 } };
    });

    const promptText = userInstructions 
        ? `Perform an exhaustive visual audit of this media. Extract every subtle detail regarding subject, environment, lighting, and cinematic technique. Synthesize this into a professional production prompt. User guidance: ${userInstructions}` 
        : "Perform an exhaustive visual audit of this media. Extract every subtle detail regarding subject, environment, lighting, and cinematic technique. Synthesize this into a professional production prompt.";

    const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: { parts: [{ text: promptText }, ...imageParts] },
        config: { 
            systemInstruction: MEDIA_ANALYZER_SYSTEM_PROMPT,
            thinkingConfig: { thinkingBudget: 10000 }
        },
    });
    return parseStructuredPrompt(response.text || "");
};

export const analyzeVideoContent = async (frameDataUrls: string[], onProgress: (msg: string) => void): Promise<string> => {
    onProgress('Performing Forensic Scene Analysis...');
    const imageParts = frameDataUrls.map(url => {
        const { base64, mimeType } = parseDataUrl(url);
        return { inlineData: { mimeType, data: base64 } };
    });
    const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: { parts: [{ text: "Provide a forensic, frame-by-frame analysis of this media. Focus on micro-details: textures, lighting shifts, subject momentum, and cinematic nuances. Be extremely descriptive." }, ...imageParts] },
        config: { 
            systemInstruction: "You are a world-class Visual Director and Cinematographer. Your analysis is used for high-budget film production. Ensure absolute fidelity to the visual evidence.",
            thinkingConfig: { thinkingBudget: 12000 }
        }
    });
    return response.text || "";
};

export const refinePrompt = async (currentPrompt: string, userInstruction: string, negativePrompt: string): Promise<string> => {
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Original Prompt: ${currentPrompt}\n\nRefinement Instructions: ${userInstruction}\n\nNegative Constraints (Exclude): ${negativePrompt}`,
        config: { 
            systemInstruction: "You are a master prompt engineer. Your goal is to refine and enhance the provided prompt while strictly adhering to the user's instructions. Use high-fidelity, cinematic language. Output ONLY the final refined prompt text. Do not include any preamble or explanation.",
            temperature: 0.7
        }
    });
    return response.text?.trim() || currentPrompt;
};

export const refineJsonPrompt = async (currentJson: string, instruction: string, negative: string): Promise<string> => {
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Current JSON Spec: ${currentJson}\n\nRefinement Instructions: ${instruction}\n\nNegative Constraints: ${negative}`,
        config: {
            systemInstruction: "You are a technical visual director. Refine the visual parameters in this JSON production spec based on the provided instructions. Maintain strict JSON validity and follow the provided schema.",
            responseMimeType: "application/json",
            responseSchema: VIDEO_PRODUCTION_JSON_SCHEMA
        }
    });
    return JSON.stringify(JSON.parse(response.text || "{}"), null, 2);
};

export const convertPromptToJson = async (prompt: StructuredPrompt): Promise<string> => {
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: JSON.stringify(prompt),
        config: {
            systemInstruction: "Convert the unstructured prompt details into a formal visual production JSON.",
            responseMimeType: "application/json",
            responseSchema: VIDEO_PRODUCTION_JSON_SCHEMA
        }
    });
    return JSON.stringify(JSON.parse(response.text || "{}"), null, 2);
};

export const remixPrompt = async (prompt: string): Promise<string[]> => {
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Remix: ${prompt}`,
        config: {
            systemInstruction: "Generate 3 stylistically distinct remixes of this prompt. Return as a JSON array of strings.",
            responseMimeType: "application/json",
            responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
    });
    return JSON.parse(response.text || "[]");
};

export const remixVideoStyle = async (frames: string[], style: string): Promise<string> => {
    const parts = frames.map(url => {
        const { base64, mimeType } = parseDataUrl(url);
        return { inlineData: { mimeType, data: base64 } };
    });
    const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: { parts: [{ text: `Re-imagine this scene in the style of: ${style}` }, ...parts] },
        config: { thinkingConfig: { thinkingBudget: 5000 } }
    });
    return response.text || "";
};

export const testPromptConsistency = async (prompt: string, frames: string[]): Promise<ConsistencyResult> => {
    const parts = frames.map(url => {
        const { base64, mimeType } = parseDataUrl(url);
        return { inlineData: { mimeType, data: base64 } };
    });
    const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: { parts: [{ text: `Perform a rigorous consistency audit. Compare every detail of this prompt with the provided media: ${prompt}. Identify any discrepancies, missing elements, or inaccuracies.` }, ...parts] },
        config: {
            systemInstruction: "You are a forensic visual auditor. Your goal is to ensure 100% alignment between text prompts and visual media. Be hyper-critical.",
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    reasoning: { 
                        type: Type.OBJECT, 
                        properties: { 
                            analysis_of_prompt: { type: Type.STRING }, 
                            analysis_of_media: { type: Type.STRING }, 
                            comparison: { type: Type.STRING } 
                        }, 
                        required: ["analysis_of_prompt", "analysis_of_media", "comparison"] 
                    },
                    consistency_score: { type: Type.INTEGER },
                    explanation: { type: Type.STRING },
                    missing_details: { type: Type.ARRAY, items: { type: Type.STRING } },
                    revised_output: { type: Type.STRING }
                },
                required: ["reasoning", "consistency_score", "explanation", "missing_details", "revised_output"]
            }
        }
    });
    return JSON.parse(response.text || "{}");
};

export const testJsonConsistency = async (json: string, frames: string[]): Promise<ConsistencyResult> => {
    const parts = frames.map(url => {
        const { base64, mimeType } = parseDataUrl(url);
        return { inlineData: { mimeType, data: base64 } };
    });
    const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: { parts: [{ text: `Test JSON consistency for: ${json}. Ensure every parameter in the JSON accurately reflects the visual evidence in the frames.` }, ...parts] },
        config: {
            systemInstruction: "You are a technical visual auditor. Compare the production JSON spec against the provided media frames. Identify any technical inaccuracies.",
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    reasoning: { 
                        type: Type.OBJECT, 
                        properties: { 
                            analysis_of_prompt: { type: Type.STRING }, 
                            analysis_of_media: { type: Type.STRING }, 
                            comparison: { type: Type.STRING } 
                        }, 
                        required: ["analysis_of_prompt", "analysis_of_media", "comparison"] 
                    },
                    consistency_score: { type: Type.INTEGER },
                    explanation: { type: Type.STRING },
                    missing_details: { type: Type.ARRAY, items: { type: Type.STRING } },
                    revised_output: VIDEO_PRODUCTION_JSON_SCHEMA
                },
                required: ["reasoning", "consistency_score", "explanation", "missing_details", "revised_output"]
            }
        }
    });
    const raw = JSON.parse(response.text || "{}");
    return { ...raw, revised_output: JSON.stringify(raw.revised_output, null, 2) };
};

export const generatePromptFromAnalysis = async (text: string): Promise<StructuredPrompt> => {
    const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: `Synthesize this forensic analysis into a high-fidelity generation prompt. Ensure all cinematic nuances, lighting details, and subject characteristics are preserved and structured effectively: ${text}`,
        config: { 
            systemInstruction: MEDIA_ANALYZER_SYSTEM_PROMPT,
            thinkingConfig: { thinkingBudget: 8000 }
        }
    });
    return parseStructuredPrompt(response.text || "");
};