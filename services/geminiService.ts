import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { StructuredPrompt, ConsistencyResult } from '../types.ts';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

// MODIFIED: Replaced the long, verbose system prompt with a concise, keyword-focused one.
const MEDIA_ANALYZER_SYSTEM_PROMPT = `You are an expert prompt engineer for generative AI models. Your task is to analyze media (video frames, images) and convert it into a highly effective, structured text prompt.

Your output MUST follow this structure:

<objective>
[A brief, one-sentence goal for the generation. Example: "A cinematic shot of a futuristic city at night."]
</objective>

<core_focus>
[A detailed, comma-separated list of keywords and short, descriptive phrases that capture the scene. Focus on nouns, adjectives, and verbs. This is the main part of the prompt. Example: "cinematic, wide shot, futuristic city, partially submerged, dark reflective water, neon lights, glowing cyan and purple, sleek dark hovercraft flying left, vapor trail, ancient stone ruins, translucent domes, tall skyscrapers, mystical, ethereal, high-tech"]
</core_focus>

<constraints>
[A concise list of key technical and stylistic requirements. Example: "Style: Cyberpunk, photorealistic. Lighting: High-contrast neon. Mood: Mysterious."]
</constraints>

GUIDELINES:
- **Be Concise but Descriptive:** Use powerful keywords instead of long sentences.
- **Prioritize Visuals:** Focus on what is visible: subjects, actions, setting, colors, lighting, and composition.
- **Structure is Key:** Adhere strictly to the <objective>, <core_focus>, and <constraints> tags. Do not add conversational text.
`;

// NEW: A streamlined schema for Generative Video Prompts.
// Removed redundant metadata (timecodes, aspect ratios) to focus on visual descriptions affecting the model.
const VIDEO_PRODUCTION_JSON_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        main_subject: {
            type: Type.STRING,
            description: "The primary subject or character of the video."
        },
        synopsis: {
            type: Type.STRING,
            description: "A concise summary of the video's action and visual narrative."
        },
        visual_style: {
            type: Type.OBJECT,
            description: "Detailed breakdown of the visual aesthetic.",
            properties: {
                art_style: { 
                    type: Type.STRING, 
                    description: "e.g., Photorealistic, Anime, Cinematic, Claymation, 3D Render." 
                },
                lighting: { 
                    type: Type.STRING, 
                    description: "Description of lighting type, quality, and direction." 
                },
                color_palette: { 
                    type: Type.STRING, 
                    description: "Primary colors and color grading details." 
                },
                mood: { 
                    type: Type.STRING, 
                    description: "The emotional atmosphere of the video." 
                }
            },
            required: ["art_style", "lighting", "color_palette", "mood"]
        },
        camera_work: {
            type: Type.OBJECT,
            description: "Technical camera details.",
            properties: {
                angle: { type: Type.STRING, description: "e.g., Low angle, Bird's eye view, Eye level." },
                movement: { type: Type.STRING, description: "e.g., Slow pan, Dolly zoom, Handheld shake, Static." },
                lens_type: { type: Type.STRING, description: "e.g., Wide angle, Telephoto, Macro, Fish-eye." }
            },
            required: ["angle", "movement"]
        },
        key_elements: {
            type: Type.ARRAY,
            description: "A list of critical objects, background elements, or details visible in the scene.",
            items: { type: Type.STRING }
        },
        sequence_of_events: {
            type: Type.ARRAY,
            description: "A chronological sequence of visual actions. Focus on 'what happens' visually.",
            items: {
                type: Type.OBJECT,
                properties: {
                    action: { type: Type.STRING, description: "Description of the movement or event." },
                    visual_details: { type: Type.STRING, description: "Specific visual changes or details relevant to this moment." }
                },
                required: ["action", "visual_details"]
            }
        },
        audio_suggestions: {
            type: Type.STRING,
            description: "Brief description of suitable sound effects or music style."
        }
    },
    required: ["main_subject", "synopsis", "visual_style", "camera_work", "key_elements", "sequence_of_events"]
};


// Helper to parse a Data URL into its components for the API
const parseDataUrl = (dataUrl: string) => {
    const parts = dataUrl.split(',');
    const header = parts[0];
    const data = parts[1];
    const mimeTypeMatch = header?.match(/:(.*?);/);

    if (data && mimeTypeMatch && mimeTypeMatch[1]) {
        return { base64: data, mimeType: mimeTypeMatch[1] };
    }
    throw new Error('Invalid data URL provided for analysis.');
};

/**
 * Parses the raw text response from the AI into a StructuredPrompt object.
 * @param responseText The raw text from the Gemini API.
 * @returns A StructuredPrompt object.
 */
const parseStructuredPrompt = (responseText: string): StructuredPrompt => {
    const objective = responseText.match(/<objective>([\s\S]*?)<\/objective>/)?.[1]?.trim() || '';
    const core_focus = responseText.match(/<core_focus>([\s\S]*?)<\/core_focus>/)?.[1]?.trim() || '';
    const constraints = responseText.match(/<constraints>([\s\S]*?)<\/constraints>/)?.[1]?.trim() || '';
    // NOTE: Enhancements tag removed from system prompt, so this will likely be empty. Keeping for safety.
    const enhancements = responseText.match(/<enhancements>([\s\S]*?)<\/enhancements>/)?.[1]?.trim();

    if (!objective && !core_focus && !constraints) {
        // If parsing fails, return the whole text as the core_focus to avoid data loss.
        return {
            objective: "[Objective could not be parsed]",
            core_focus: responseText,
            constraints: "[Constraints could not be parsed]",
        };
    }

    return { objective, core_focus, constraints, enhancements: enhancements || undefined };
};


/**
 * Generates a simple, descriptive text prompt from media frames quickly for preview purposes.
 * This version disables AI "thinking" for low latency.
 * @param frameDataUrls An array of data URLs for the video frames or images.
 * @returns A promise that resolves to the generated text prompt string.
 */
export const generateSimplePromptFromFrames = async (
    frameDataUrls: string[],
): Promise<string> => {
    if (frameDataUrls.length === 0) {
        throw new Error("No frames provided for analysis.");
    }

    const imagePartsForAnalysis = frameDataUrls.map(dataUrl => {
        const { base64, mimeType } = parseDataUrl(dataUrl);
        return { inlineData: { mimeType, data: base64 } };
    });

    const prompt = `Analyze these video frames and generate a single, cohesive, comma-separated paragraph that describes the entire sequence of events. Focus on the main subject, action, setting, and style. Be fast and direct.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [{ text: prompt }, ...imagePartsForAnalysis] },
        config: {
            systemInstruction: "You are a fast and efficient media analyst for generating quick preview prompts.",
            temperature: 0.7,
            thinkingConfig: { thinkingBudget: 0 } // Disable thinking for speed
        }
    });

    const text = response.text;
    if (!text) {
        throw new Error("The AI model did not return a valid prompt.");
    }
    return text.trim();
};


/**
 * Generates a structured prompt from media frames using the Media-to-Prompt Analyzer framework.
 * @param frameDataUrls An array of data URLs for the video frames or images.
 * @param onProgress A callback to update the UI with processing messages.
 * @returns A promise that resolves to a StructuredPrompt object.
 */
export const generateStructuredPromptFromFrames = async (
    frameDataUrls: string[],
    onProgress: (message: string) => void
): Promise<StructuredPrompt> => {
    if (frameDataUrls.length === 0) {
        throw new Error("No frames provided for analysis.");
    }

    onProgress('Analyzing media with Gemini...');

    try {
        const imagePartsForAnalysis = frameDataUrls.map(dataUrl => {
            const { base64, mimeType } = parseDataUrl(dataUrl);
            return { inlineData: { mimeType, data: base64 } };
        });

        const analysisPrompt = `Analyze the following media frames and generate a structured prompt based on your core instructions.`;
        
        const analysisResponse: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [{ text: analysisPrompt }, ...imagePartsForAnalysis] },
            config: {
                systemInstruction: MEDIA_ANALYZER_SYSTEM_PROMPT,
                temperature: 0.7,
            }
        });
        
        const responseText = analysisResponse.text.trim();
        const result = parseStructuredPrompt(responseText);

        if (!result.objective || !result.core_focus || !result.constraints) {
            throw new Error("The AI model returned an incomplete analysis. The result was missing key fields. Please try a different video.");
        }

        return result;

    } catch (error) {
        console.error("Error during Gemini API communication:", error);
        if (error instanceof Error) {
            throw new Error(`AI processing failed: ${error.message}`);
        }
        throw new Error("An unknown error occurred while communicating with the AI.");
    }
};

/**
 * Generates a structured prompt from an existing textual video analysis.
 * This allows users to pivot from the "Understand Video" feature to the prompt generation flow.
 * @param analysisText The descriptive text from the video analysis.
 * @returns A promise that resolves to a StructuredPrompt object.
 */
export const generatePromptFromAnalysis = async (
    analysisText: string
): Promise<StructuredPrompt> => {
    // We reuse the core structural instructions to ensure compatibility.
    const structureInstructions = `
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
- **Be Concise but Descriptive:** Use powerful keywords.
- **Structure is Key:** Adhere strictly to the tags.
`;

    const prompt = `
    You are an expert prompt engineer. I have a detailed video analysis below. 
    Your task is to convert this analysis into a highly effective, structured text-to-video prompt based on the content described.

    VIDEO ANALYSIS:
    "${analysisText}"

    ${structureInstructions}
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.7,
            }
        });

        const responseText = response.text.trim();
        const result = parseStructuredPrompt(responseText);

        // If strict parsing fails, fallback to wrapping the text
        if (!result.objective || !result.core_focus || !result.constraints) {
            return {
                objective: "Generate a video based on the provided analysis.",
                core_focus: responseText,
                constraints: "Adhere to the visual style described in the analysis."
            };
        }
        return result;

    } catch (error) {
        console.error("Error generating prompt from analysis:", error);
        if (error instanceof Error) {
            throw new Error(`Prompt generation failed: ${error.message}`);
        }
        throw new Error("An unknown error occurred while communicating with the AI.");
    }
};


/**
 * Generates a structured prompt as a raw JSON string from media frames.
 * @param frameDataUrls An array of data URLs for the video frames or images.
 * @param onProgress A callback to update the UI with processing messages.
 * @returns A promise that resolves to a JSON string.
 */
export const generateJsonPromptFromFrames = async (
    frameDataUrls: string[],
    onProgress: (message: string) => void
): Promise<string> => {
    if (frameDataUrls.length === 0) {
        throw new Error("No frames provided for analysis.");
    }

    onProgress('Analyzing media with Gemini for JSON output...');

    const imagePartsForAnalysis = frameDataUrls.map(dataUrl => {
        const { base64, mimeType } = parseDataUrl(dataUrl);
        return { inlineData: { mimeType, data: base64 } };
    });

    const analysisPrompt = `Analyze the following media frames and generate a structured JSON output based on your core instructions.`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [{ text: analysisPrompt }, ...imagePartsForAnalysis] },
        config: {
            // MODIFIED: Updated system instruction to be concise and focused on visual details.
            systemInstruction: "You are an expert video production assistant. Your task is to analyze media frames and generate a highly detailed, structured JSON description suitable for AI video generation. Populate all fields of the provided schema with meticulous visual detail. Focus on 'visual_style', 'camera_work', and the 'sequence_of_events'. Do NOT include extrinsic metadata like aspect ratio or timecodes unless specifically relevant to the visual action.",
            responseMimeType: "application/json",
            // MODIFIED: Using the new streamlined schema.
            responseSchema: VIDEO_PRODUCTION_JSON_SCHEMA,
        }
    });

    const jsonText = response.text.trim();
    
    // Basic validation to ensure we got something that looks like JSON
    try {
        JSON.parse(jsonText);
    } catch {
        throw new Error("The AI model did not return a valid JSON object.");
    }
    
    // Beautify the JSON string for display
    return JSON.stringify(JSON.parse(jsonText), null, 2);
};


export const remixPrompt = async (promptToRemix: string): Promise<string[]> => {
    const remixingPrompt = `
      You are a creative assistant. Your task is to "remix" a given text-to-video prompt.
      This means generating three new, distinct variations of the original prompt.
      Each variation should be creative and explore different styles, subjects, or moods, while retaining the core concept of the original.
      
      ORIGINAL PROMPT:
      "${promptToRemix}"

      Generate three new prompts based on this.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: remixingPrompt,
            config: {
                systemInstruction: `Your task is to generate three creative variations of a prompt. You MUST return a single, raw JSON object that is an array of strings, where each string is a new prompt. Example: ["new prompt 1", "new prompt 2", "new prompt 3"]. Do not include any other text or markdown.`,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                }
            }
        });

        const jsonResponse = response.text.trim();
        const remixedPrompts = JSON.parse(jsonResponse);

        if (!Array.isArray(remixedPrompts) || remixedPrompts.length === 0 || !remixedPrompts.every(p => typeof p === 'string')) {
            throw new Error("AI returned an invalid format for remixed prompts.");
        }

        return remixedPrompts;

    } catch (error) {
        console.error("Error during Gemini API communication for remixing:", error);
        if (error instanceof Error) {
            throw new Error(`AI remixing failed: ${error.message}`);
        }
        throw new Error("An unknown error occurred while communicating with the AI for remixing.");
    }
};

export const refinePrompt = async (currentPrompt: string, userInstruction: string, negativePrompt: string): Promise<string> => {
    let content = `
Refine the following text-to-video prompt based on my instruction.

PROMPT:
"${currentPrompt}"

INSTRUCTION:
"${userInstruction}"
`;

    if (negativePrompt) {
        content += `
IMPORTANT: The refined prompt MUST NOT include any of the following elements, concepts, or styles:
${negativePrompt}
`;
    }

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: content,
            config: {
                systemInstruction: `Your primary task is to rewrite a given text-to-video prompt based on a user's instruction. If a list of elements to exclude is provided, you must ensure the new prompt does not contain them. Your output MUST be only the new, refined prompt. Do not include any conversational text, explanations, or markdown formatting. Just the prompt itself.`,
                temperature: 0.7,
            }
        });

        const newPrompt = response.text;
        if (!newPrompt) {
            throw new Error("The AI model did not return a valid refined prompt.");
        }
        return newPrompt.trim();
    } catch (error) {
        console.error("Error calling Gemini API for refinement:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to refine prompt from AI: ${error.message}`);
        }
        throw new Error("An unknown error occurred while communicating with the AI for refinement.");
    }
};

export const refineJsonPrompt = async (
    currentJsonString: string, 
    userInstruction: string, 
    negativePrompt: string
): Promise<string> => {
    // Validate if the input is valid JSON
    try {
        JSON.parse(currentJsonString);
    } catch {
        throw new Error("The provided text is not a valid JSON object and cannot be refined.");
    }

    let content = `
Your task is to rewrite and enhance the following JSON shot list based on my instruction. 
Produce a new, detailed, and valid JSON object based on the provided schema. 
Apply the changes across all relevant fields to ensure a cohesive result.

CURRENT JSON:
${currentJsonString}

INSTRUCTION:
"${userInstruction}"
`;

    if (negativePrompt) {
        content += `
IMPORTANT: The values in the refined JSON MUST NOT include any of the following elements, concepts, or styles:
${negativePrompt}
`;
    }

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: content,
            config: {
                systemInstruction: `You are an expert video editor and prompt engineer. Your task is to act as a meticulous editor, rewriting and enhancing a detailed JSON prompt based on a user's instruction. Apply the instruction comprehensively across all relevant fields of the JSON object, including sequence_of_events, visual_style, and main_subject, to ensure a cohesive and improved result. Your output MUST be only the new, refined, and valid JSON object. Do not add any conversational text, explanations, or markdown formatting.`,
                responseMimeType: "application/json",
                // MODIFIED: Using the new streamlined schema for refinement.
                responseSchema: VIDEO_PRODUCTION_JSON_SCHEMA,
                temperature: 0.7,
            }
        });

        const newJsonString = response.text;
        if (!newJsonString) {
            throw new Error("The AI model did not return a valid refined JSON object.");
        }
        
        // Validate and beautify the output
        const parsedJson = JSON.parse(newJsonString);
        return JSON.stringify(parsedJson, null, 2);

    } catch (error) {
        console.error("Error calling Gemini API for JSON refinement:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to refine JSON from AI: ${error.message}`);
        }
        throw new Error("An unknown error occurred while communicating with the AI for JSON refinement.");
    }
};

export const remixVideoStyle = async (
    frameDataUrls: string[],
    targetStyle: string
): Promise<string> => {
    const imageParts = frameDataUrls.map(dataUrl => {
        const { base64, mimeType } = parseDataUrl(dataUrl);
        return { inlineData: { mimeType, data: base64 } };
    });

    const remixingPrompt = `You are a world-class expert in video-to-video style transfer prompting. Your task is to analyze the sequence of motion, gestures, and actions from the provided video frames. Then, you will write a new, hyper-detailed text-to-video prompt that describes this exact sequence of movement, but reimagined in a '${targetStyle}' aesthetic.

Crucially, the new prompt must meticulously describe the motion so that a future text-to-video AI could replicate the original video's gestures, body movement, and even lip-sync faithfully.

Your output should focus on:
1.  **Character Transformation**: Describe how the subject(s) would look in the '${targetStyle}' style (e.g., cel-shaded anime character, textured clay figure).
2.  **Environment Transformation**: Describe how the background and setting are changed to fit the '${targetStyle}' aesthetic.
3.  **Motion Description**: Detail the original motion, frame-by-frame, using descriptive language appropriate for the new style. For example, instead of 'the person walks', use 'the cel-shaded hero strides confidently' or 'the claymation figure plods with a slight bounce'.

The final output MUST be only the new, refined prompt as a single block of text. Do not include any conversational text, explanations, or markdown formatting. Just the prompt itself.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [{ text: remixingPrompt }, ...imageParts] },
            config: {
                systemInstruction: "You are an expert AI at video style transfer.",
                temperature: 0.8,
            }
        });
        const newPrompt = response.text;
        if (!newPrompt) {
            throw new Error("The AI model did not return a valid remixed prompt.");
        }
        return newPrompt.trim();
    } catch (error) {
        console.error("Error calling Gemini API for video style remix:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to remix video style: ${error.message}`);
        }
        throw new Error("An unknown error occurred while communicating with the AI for video style remix.");
    }
};

export const testPromptConsistency = async (
    prompt: string,
    frameDataUrls: string[]
): Promise<ConsistencyResult> => {
    if (frameDataUrls.length === 0) {
        throw new Error("No frames provided for consistency check.");
    }

    const imageParts = frameDataUrls.map(dataUrl => {
        const { base64, mimeType } = parseDataUrl(dataUrl);
        return { inlineData: { mimeType, data: base64 } };
    });

    const consistencyCheckPrompt = `
    You are a meticulous and objective Generative Media Forensics AI. Your primary function is to analyze the consistency between a text prompt and a series of media frames. You must be strict, logical, and avoid creative interpretation. Your goal is to help users create a prompt that is a **perfect textual representation of the provided media**.

    **Input:**
    1.  **Text Prompt:** A user-provided description.
    2.  **Media Frames:** A sequence of images from a single image.

    **Instructions:**

    **Step 1: Forensic Analysis (Internal Monologue)**
    *   **Analyze the Prompt:** Deconstruct the provided prompt into its core components: subjects, actions, setting, style, lighting, colors, camera work, etc.
    *   **Analyze the Media:** Exhaustively list every single observable detail in the media frames. Be extremely specific (e.g., "a woman with red hair tied in a messy bun," "a coffee cup with a chip on the rim," "slow panning camera motion from left to right," "afternoon sun casting long shadows").
    *   **Compare:** Create a point-by-point comparison. Identify every detail present in the media that is **missing, vague, or mis-represented** in the prompt.

    **Step 2: Generate JSON Report**
    Based on your analysis, generate a single, raw JSON object with the following structure. Do NOT add any conversational text or markdown.

    **JSON Schema:**
    - **\`reasoning\` (object):** Your detailed analysis.
        - \`analysis_of_prompt\` (string): Your breakdown of the prompt.
        - \`analysis_of_media\` (string): Your exhaustive list of visual details.
        - \`comparison\` (string): Your point-by-point comparison highlighting discrepancies.
    - **\`consistency_score\` (integer):** A strict score from 0 to 100.
        - **100:** The prompt is a perfect, exhaustive description of the media.
        - **90-99:** The prompt is excellent but misses a few minor details.
        - **70-89:** The prompt captures the main idea but is missing significant details.
        - **<70:** The prompt is a poor representation of the media.
    - **\`explanation\` (string):** A concise, one-sentence summary explaining the score.
    - **\`missing_details\` (array of strings):** A list of the most critical visual details from the media that are missing from the prompt. This list must be precise and actionable.
    - **\`revised_output\` (string):** The improved prompt. **This MUST be constructed by taking the ORIGINAL prompt and carefully integrating the \`missing_details\`. Do not rewrite the original prompt from scratch.** The goal is to enhance, not replace. The revised prompt should be a more complete and accurate description of the media.

    **Example Task:**

    *   **Prompt:** "A person walking on the beach."
    *   **Media:** An image showing a woman with blonde hair in a red sundress walking barefoot on a wet sandy beach during sunset, with seagulls in the background.

    **Example \`revised_output\`:**
    "A woman with blonde hair, wearing a red sundress, walking barefoot on a wet sandy beach during a vibrant sunset. Seagulls are visible in the background."

    **Now, analyze the following prompt and media frames:**

    Text-to-Video Prompt:
    "${prompt}"
    `;

    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            reasoning: {
                type: Type.OBJECT,
                description: "The detailed forensic analysis.",
                properties: {
                    analysis_of_prompt: { type: Type.STRING },
                    analysis_of_media: { type: Type.STRING },
                    comparison: { type: Type.STRING }
                },
                required: ["analysis_of_prompt", "analysis_of_media", "comparison"]
            },
            consistency_score: { 
                type: Type.INTEGER, 
                description: "A strict consistency score from 0 to 100." 
            },
            explanation: { 
                type: Type.STRING, 
                description: "A concise, one-sentence summary of the main reason for the score." 
            },
            missing_details: {
                type: Type.ARRAY,
                description: "A list of specific, crucial visual details missing from the prompt.",
                items: { type: Type.STRING }
            },
            revised_output: {
                type: Type.STRING,
                description: "The original prompt enhanced with the missing details. It should not be a complete rewrite."
            }
        },
        required: ["reasoning", "consistency_score", "explanation", "missing_details", "revised_output"]
    };

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [{ text: consistencyCheckPrompt }, ...imageParts] },
            config: {
                systemInstruction: `Your task is to act as a consistency checker and return a single, structured JSON object adhering to the provided schema. Do not output any conversational text or markdown.`,
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            }
        });

        const resultJsonStr = response.text.trim();
        const result: ConsistencyResult = JSON.parse(resultJsonStr);

        if (
            !result.reasoning ||
            typeof result.reasoning.analysis_of_prompt !== 'string' ||
            typeof result.consistency_score !== 'number' ||
            typeof result.explanation !== 'string' ||
            !Array.isArray(result.missing_details) ||
            typeof result.revised_output !== 'string'
        ) {
            throw new Error("The AI model returned an invalid data structure for the consistency check.");
        }

        return result;

    } catch (error) {
        console.error("Error during Gemini API consistency check:", error);
        if (error instanceof Error) {
            throw new Error(`AI consistency check failed: ${error.message}`);
        }
        throw new Error("An unknown error occurred while communicating with the AI for consistency check.");
    }
};

export const testJsonConsistency = async (
    jsonString: string,
    frameDataUrls: string[]
): Promise<ConsistencyResult> => {
    if (frameDataUrls.length === 0) {
        throw new Error("No frames provided for consistency check.");
    }

    const imageParts = frameDataUrls.map(dataUrl => {
        const { base64, mimeType } = parseDataUrl(dataUrl);
        return { inlineData: { mimeType, data: base64 } };
    });

    // MODIFIED: Updated prompt to reflect the new streamlined JSON schema.
    const consistencyCheckPrompt = `
    You are a meticulous Generative Media Forensics AI. Your task is to analyze the consistency between a structured JSON prompt and a series of media frames. Your goal is to improve the JSON so it perfectly represents the provided media.

    **Input:**
    1.  **JSON Prompt:** A user-provided JSON object representing the visual prompt.
    2.  **Media Frames:** A sequence of images.

    **Instructions:**

    **Step 1: Forensic Analysis (Internal Monologue)**
    *   **Analyze the JSON:** Deconstruct the values in the provided JSON object.
    *   **Analyze the Media:** Exhaustively list every observable detail in the media frames.
    *   **Compare:** Identify details present in the media that are missing, vague, or mis-represented in the JSON values.

    **Step 2: Generate JSON Report**
    Based on your analysis, generate a single, raw JSON object with the following structure. Do NOT add any conversational text or markdown.

    **JSON Schema:**
    - **\`reasoning\` (object):** Your detailed analysis.
        - \`analysis_of_prompt\` (string): Your breakdown of the JSON values.
        - \`analysis_of_media\` (string): Your exhaustive list of visual details.
        - \`comparison\` (string): Your point-by-point comparison.
    - **\`consistency_score\` (integer):** A strict score from 0 to 100.
    - **\`explanation\` (string):** A concise summary explaining the score.
    - **\`missing_details\` (array of strings):** A list of the most critical visual details from the media that are missing from the JSON.
    - **\`revised_output\` (object):** The improved JSON prompt as a structured object. **This MUST be constructed by taking the ORIGINAL JSON object's values and carefully integrating the \`missing_details\` into the appropriate fields (e.g., sequence_of_events, visual_style).** The goal is to enhance all fields for accuracy. The object must be a valid object conforming to the provided JSON schema.

    **Now, analyze the following JSON prompt and media frames:**

    JSON Prompt:
    \`\`\`json
    ${jsonString}
    \`\`\`
    `;

    const responseSchema = {
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
            // MODIFIED: Using the new streamlined schema for the revised output.
            revised_output: VIDEO_PRODUCTION_JSON_SCHEMA
        },
        required: ["reasoning", "consistency_score", "explanation", "missing_details", "revised_output"]
    };

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [{ text: consistencyCheckPrompt }, ...imageParts] },
            config: {
                systemInstruction: `You are a consistency checker. Your task is to return a single, structured JSON report object adhering to the provided schema. The 'revised_output' field must be a valid, structured JSON object.`,
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            }
        });

        const resultJsonStr = response.text.trim();
        // Use a temporary type because revised_output is an object from the API
        const result: Omit<ConsistencyResult, 'revised_output'> & { revised_output: object } = JSON.parse(resultJsonStr);

        // Validate the structure
        if (!result.reasoning || typeof result.consistency_score !== 'number' || typeof result.revised_output !== 'object') {
            throw new Error("The AI model returned an invalid data structure for the consistency check.");
        }
        
        // Convert the revised_output object back to a beautified string to match the ConsistencyResult type
        const finalResult: ConsistencyResult = {
            ...result,
            revised_output: JSON.stringify(result.revised_output, null, 2),
        };

        return finalResult;

    } catch (error) {
        console.error("Error during Gemini API JSON consistency check:", error);
        if (error instanceof Error) {
            throw new Error(`AI JSON consistency check failed: ${error.message}`);
        }
        throw new Error("An unknown error occurred during AI communication for JSON consistency check.");
    }
};

/**
 * Converts a structured text prompt object to a JSON string.
 * @param prompt The StructuredPrompt object to convert.
 * @returns A promise that resolves to a formatted JSON string.
 */
export const convertPromptToJson = async (
    prompt: StructuredPrompt
): Promise<string> => {
    const contentToConvert = `
    Objective: ${prompt.objective}
    Core Focus: ${prompt.core_focus}
    Constraints: ${prompt.constraints}
    ${prompt.enhancements ? `Enhancements: ${prompt.enhancements}` : ''}
    `;

    const conversionPrompt = `Convert the following structured text prompt into a single, raw, and detailed JSON prompt based on the provided schema. Analyze the text and populate all fields as accurately as possible, focusing on visual descriptions. Do not add extrinsic metadata.

    TEXT TO CONVERT:
    ${contentToConvert}
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: conversionPrompt,
            config: {
                // MODIFIED: Updated system instruction to ensure concise conversion.
                systemInstruction: "You are a data formatting expert. Your only task is to analyze the provided text and convert it into a structured JSON description based on the provided schema. Infer and populate all fields logically from the source text.",
                responseMimeType: "application/json",
                // MODIFIED: Using the new streamlined schema.
                responseSchema: VIDEO_PRODUCTION_JSON_SCHEMA,
                temperature: 0.2, // Low temperature for deterministic conversion
            }
        });

        const jsonText = response.text.trim();
        
        // Validate and beautify
        const parsedJson = JSON.parse(jsonText);
        return JSON.stringify(parsedJson, null, 2);

    } catch (error) {
        console.error("Error during Gemini API JSON conversion:", error);
        if (error instanceof Error) {
            throw new Error(`AI JSON conversion failed: ${error.message}`);
        }
        throw new Error("An unknown error occurred while converting the prompt to JSON.");
    }
};

/**
 * Analyzes video frames using the Gemini Pro model to generate a summary of the content.
 * @param frameDataUrls An array of data URLs for the video frames.
 * @param onProgress A callback to update the UI with processing messages.
 * @returns A promise that resolves to a descriptive string summary of the video.
 */
export const analyzeVideoContent = async (
    frameDataUrls: string[],
    onProgress: (message: string) => void
): Promise<string> => {
    if (frameDataUrls.length === 0) {
        throw new Error("No frames provided for video analysis.");
    }

    onProgress('Analyzing video content with Gemini Pro...');

    try {
        const imagePartsForAnalysis = frameDataUrls.map(dataUrl => {
            const { base64, mimeType } = parseDataUrl(dataUrl);
            return { inlineData: { mimeType, data: base64 } };
        });

        const analysisPrompt = `Analyze this sequence of video frames and provide a comprehensive summary. Describe the main subjects, their actions, the environment, and any narrative or key events that unfold. Structure your response in clear sections using Markdown for readability.`;
        
        const analysisResponse: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-pro', 
            contents: { parts: [{ text: analysisPrompt }, ...imagePartsForAnalysis] },
            config: {
                systemInstruction: "You are an expert video analyst AI. Your task is to watch a sequence of frames and provide a detailed, structured summary of the video's content.",
                temperature: 0.5,
            }
        });
        
        const responseText = analysisResponse.text.trim();

        if (!responseText) {
            throw new Error("The AI model returned an empty analysis. Please try a different video.");
        }

        return responseText;

    } catch (error) {
        console.error("Error during Gemini Pro video analysis:", error);
        if (error instanceof Error) {
            throw new Error(`AI analysis failed: ${error.message}`);
        }
        throw new Error("An unknown error occurred while communicating with the AI.");
    }
};
