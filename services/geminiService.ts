import { GoogleGenAI, Type } from "@google/genai";
import { StructuredPrompt, ConsistencyResult } from '../types.ts';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const MEDIA_ANALYZER_SYSTEM_PROMPT = `You are an expert prompt engineer for generative AI models. Your task is to analyze media (video frames, images) and convert it into a highly effective, structured text prompt.

Your output MUST follow this structure:

<objective>
[A brief, one-sentence goal for the generation.]
</objective>

<core_focus>
[A detailed, comma-separated list of keywords and short, descriptive phrases that capture the scene. Focus on nouns, adjectives, and verbs.]
</core_focus>

<constraints>
[A concise list of key technical and stylistic requirements.]
</constraints>

GUIDELINES:
- **Be Concise but Descriptive:** Use powerful keywords instead of long sentences.
- **Prioritize Visuals:** Focus on subjects, actions, setting, colors, lighting, and composition.
- **Structure is Key:** Adhere strictly to the <objective>, <core_focus>, and <constraints> tags.`;

const VIDEO_PRODUCTION_JSON_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        main_subject: { type: Type.STRING },
        synopsis: { type: Type.STRING },
        visual_style: {
            type: Type.OBJECT,
            properties: {
                art_style: { type: Type.STRING },
                lighting: { type: Type.STRING },
                color_palette: { type: Type.STRING },
                mood: { type: Type.STRING }
            },
            required: ["art_style", "lighting", "color_palette", "mood"]
        },
        camera_work: {
            type: Type.OBJECT,
            properties: {
                angle: { type: Type.STRING },
                movement: { type: Type.STRING }
            },
            required: ["angle", "movement"]
        },
        key_elements: { type: Type.ARRAY, items: { type: Type.STRING } },
        sequence_of_events: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    action: { type: Type.STRING },
                    visual_details: { type: Type.STRING }
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
    onProgress('Engineering Prompt with Gemini 3 Pro...');
    const imageParts = frameDataUrls.map(url => {
        const { base64, mimeType } = parseDataUrl(url);
        return { inlineData: { mimeType, data: base64 } };
    });

    const promptText = userInstructions 
        ? `Analyze this media and generate a structured production prompt. User guidance: ${userInstructions}` 
        : "Analyze this media and generate a structured production prompt.";

    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: { parts: [{ text: promptText }, ...imageParts] },
        config: { 
            systemInstruction: MEDIA_ANALYZER_SYSTEM_PROMPT,
            thinkingConfig: { thinkingBudget: 4000 }
        },
    });
    return parseStructuredPrompt(response.text || "");
};

export const analyzeVideoContent = async (frameDataUrls: string[], onProgress: (msg: string) => void): Promise<string> => {
    onProgress('Performing Deep Scene Analysis...');
    const imageParts = frameDataUrls.map(url => {
        const { base64, mimeType } = parseDataUrl(url);
        return { inlineData: { mimeType, data: base64 } };
    });
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: { parts: [{ text: "Provide a comprehensive scene analysis covering subject, motion, style, and lighting." }, ...imageParts] },
        config: { 
            systemInstruction: "You are an expert visual director and cinematographer.",
            thinkingConfig: { thinkingBudget: 6000 }
        }
    });
    return response.text || "";
};

export const refinePrompt = async (currentPrompt: string, userInstruction: string, negativePrompt: string): Promise<string> => {
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Original: ${currentPrompt}\nInstructions: ${userInstruction}\nNegative: ${negativePrompt}`,
        config: { systemInstruction: "Refine the provided prompt based on instructions. Output ONLY the refined prompt text." }
    });
    return response.text?.trim() || currentPrompt;
};

export const refineJsonPrompt = async (currentJson: string, instruction: string, negative: string): Promise<string> => {
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `JSON: ${currentJson}\nInstructions: ${instruction}\nNegative: ${negative}`,
        config: {
            systemInstruction: "Refine the visual parameters in this JSON production spec.",
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
        model: 'gemini-3-pro-preview',
        contents: { parts: [{ text: `Re-imagine this scene in the style of: ${style}` }, ...parts] },
        config: { thinkingConfig: { thinkingBudget: 3000 } }
    });
    return response.text || "";
};

export const testPromptConsistency = async (prompt: string, frames: string[]): Promise<ConsistencyResult> => {
    const parts = frames.map(url => {
        const { base64, mimeType } = parseDataUrl(url);
        return { inlineData: { mimeType, data: base64 } };
    });
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: { parts: [{ text: `Compare this prompt with the provided media: ${prompt}` }, ...parts] },
        config: {
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
        model: 'gemini-3-pro-preview',
        contents: { parts: [{ text: `Test JSON consistency for: ${json}` }, ...parts] },
        config: {
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
        model: 'gemini-3-pro-preview',
        contents: `Synthesize this analysis into a generation prompt: ${text}`,
        config: { systemInstruction: MEDIA_ANALYZER_SYSTEM_PROMPT }
    });
    return parseStructuredPrompt(response.text || "");
};