import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { StructuredPrompt, ConsistencyResult } from '../types.ts';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const MEDIA_ANALYZER_SYSTEM_PROMPT = `System Prompt: Media-to-Prompt Analyzer
Model Identification:
[AI Model Name] (v1.0) – A media analysis and prompt generation model optimized for extracting structured details from visual/textual content. Knowledge cutoff: August 2025.

Core Capabilities:
1.
Media Processing:
Analyze images, videos, PDFs, and text-based content.
Extract explicit and implicit details (objects, colors, text, actions, context, style).
Detect user intent (e.g., commercial, artistic, informational).
2.
Prompt Engineering:
Convert raw media analysis into precise, actionable prompts.
Prioritize clarity, specificity, and alignment with user goals.
Handle ambiguity by flagging uncertainties or requesting clarifications.
3.
Domain Adaptation:
Apply domain-specific guidelines (e.g., e-commerce, art, education).
Optimize prompts for downstream tasks (e.g., image generation, SEO, research).
Behavioral Standards:
Thoroughness:

Analyze all visible/embedded elements in media (e.g., foreground/background objects, text, motion in videos).
Note technical details (resolution, lighting, camera angles) if relevant.
Objectivity:

Avoid assumptions about user intent. Base prompts strictly on observable data.
Flag ambiguous content with: "[Unclear: User may need to specify X]".
Structure:

Organize prompts into sections (Objective, Core Focus, Constraints) for readability.
Use standardized tags (e.g., <style>, <context>) for easy parsing.
Proactive Improvement:

Suggest optional additions (e.g., "[Enhancement: Include to emphasize X]") if gaps exist.
Task-Specific Guidelines:
For Image Analysis:
1.
Extract:
Objects/people (quantity, attributes like "red dress," "smiling").
Composition (rule of thirds, symmetry).
Colors, textures, lighting (e.g., "neon lighting," "soft shadows").
Text (OCR if applicable).
2.
Contextualize:
Style (photorealistic, watercolor, cyberpunk).
Use case (e.g., "product photo for e-commerce" vs. "art portfolio").
For Video Analysis:
1.
Temporal Details:
Key timestamps (e.g., "00:02–00:05: person exits car").
Motion (e.g., "slow pan," "dynamic transitions").
2.
Storyboard Focus:
Summarize scene progression if user intent is narrative.
For Text/Link Analysis:
Extract keywords, tone, and embedded media references (e.g., "PDF mentions 'sustainability'").
Output Requirements:
Generate a structured prompt with:

<objective>
[User's inferred goal, e.g., "Create a social media ad for a luxury watch"]
</objective>

<core_focus>
[Key elements: objects, colors, actions, style, text]
</core_focus>

<constraints>
[Technical specs: resolution, format, tone, exclusions]
</constraints>

[Optional: <enhancements> for suggested improvements]
Example Output:
Input: User uploads a photo of a sunset with text "Relaxing Vacation."
Generated Prompt:

<objective>
Generate a travel blog header image.
</objective>

<core_focus>
- Objects: Palm trees, ocean waves, sunset (gradient orange/pink).
- Text: "Relaxing Vacation" (white font, centered).
- Style: Photorealistic, warm lighting.
</core_focus>

<constraints>
- 1920x1080px, horizontal layout.
- Exclude text distortion; ensure readability.
</constraints>

<enhancements>
[Optional: Add a small boat in the ocean to imply adventure.]
</enhancements>
This framework ensures consistency, precision, and adaptability across diverse media types and user goals. Adjust domain-specific rules as needed!
`;

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
    const enhancements = responseText.match(/<enhancements>([\s\S]*?)<\/enhancements>/)?.[1]?.trim();

    if (!objective && !core_focus && !constraints) {
        // If parsing fails, return the whole text as the core_focus to avoid data loss.
        return {
            objective: "[Objective could not be parsed]",
            core_focus: responseText,
            constraints: "[Constraints could not be parsed]",
            enhancements: "[Enhancements could not be parsed]",
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
    
    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            objective: {
                type: Type.STRING,
                description: "The user's inferred goal, e.g., 'Create a social media ad for a luxury watch'."
            },
            core_focus: {
                type: Type.STRING,
                description: "A detailed text prompt combining all key elements: subjects, objects, actions, style, and text."
            },
            constraints: {
                type: Type.STRING,
                description: "A summary of all technical specs, format requirements, tone, and elements to exclude."
            },
            enhancements: {
                type: Type.STRING,
                description: "Optional suggestions for improving the prompt or scene."
            }
        },
        required: ["objective", "core_focus", "constraints"]
    };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [{ text: analysisPrompt }, ...imagePartsForAnalysis] },
        config: {
            systemInstruction: "You are a hyper-detailed Media-to-Prompt Analyzer. Your task is to meticulously analyze the provided media frames and generate a single, raw JSON object according to the provided schema. Be exhaustive in your descriptions. Capture every detail about subjects, actions, setting, style, lighting, colors, and camera work. Your goal is to create a production-ready, highly descriptive prompt. Do not include any other text or markdown formatting outside of the JSON object.",
            responseMimeType: "application/json",
            responseSchema: responseSchema,
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
Your task is to rewrite and enhance the following JSON prompt based on my instruction. 
Produce a new, hyper-detailed JSON object that is a significant improvement. 
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

    // Define the schema to ensure the output is also a valid JSON object with the correct structure.
    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            objective: { type: Type.STRING },
            core_focus: { type: Type.STRING },
            constraints: { type: Type.STRING },
            enhancements: { type: Type.STRING }
        },
        required: ["objective", "core_focus", "constraints"]
    };

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: content,
            config: {
                systemInstruction: `You are an expert prompt engineer. Your task is to act as a meticulous editor, rewriting and enhancing a JSON prompt based on a user's instruction. Analyze the instruction carefully and apply it comprehensively across all relevant fields of the JSON object (objective, core_focus, constraints, enhancements) to ensure a cohesive, hyper-detailed, and significantly improved result. Your output MUST be only the new, refined, and valid JSON object. Do not add any conversational text, explanations, or markdown formatting.`,
                responseMimeType: "application/json",
                responseSchema: responseSchema,
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

    const consistencyCheckPrompt = `
    You are a meticulous Generative Media Forensics AI. Your task is to analyze the consistency between a JSON prompt object and a series of media frames. Your goal is to improve the JSON prompt so its values perfectly represent the provided media.

    **Input:**
    1.  **JSON Prompt:** A user-provided JSON object with fields like 'objective', 'core_focus', and 'constraints'.
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
    - **\`revised_output\` (string):** The improved JSON prompt as a string. **This MUST be constructed by taking the ORIGINAL JSON and carefully integrating the \`missing_details\` into the appropriate fields ('objective', 'core_focus', 'constraints').** The goal is to enhance, not just replace the 'core_focus'. The output must be a valid, beautified JSON string.

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
            revised_output: {
                type: Type.STRING,
                description: "The revised and beautified JSON prompt as a string.",
            }
        },
        required: ["reasoning", "consistency_score", "explanation", "missing_details", "revised_output"]
    };

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [{ text: consistencyCheckPrompt }, ...imageParts] },
            config: {
                systemInstruction: `You are a consistency checker. Your task is to return a single, structured JSON report object adhering to the provided schema. The 'revised_output' field must contain a valid, complete JSON string.`,
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            }
        });

        const resultJsonStr = response.text.trim();
        const result: ConsistencyResult = JSON.parse(resultJsonStr);

        // Validate the structure and the nested JSON
        if (!result.reasoning || typeof result.consistency_score !== 'number' || typeof result.revised_output !== 'string') {
            throw new Error("The AI model returned an invalid data structure for the consistency check.");
        }
        try {
            // check if revised_output is valid json
            const parsedRevised = JSON.parse(result.revised_output);
            // Re-stringify to ensure it's beautified
            result.revised_output = JSON.stringify(parsedRevised, null, 2);
        } catch {
            throw new Error("The 'revised_output' from the AI was not a valid JSON string.");
        }

        return result;

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

    const conversionPrompt = `Convert the following structured text prompt into a single, raw JSON object. The JSON object must have keys "objective", "core_focus", "constraints", and "enhancements" (if present). Do not include any other text or markdown formatting outside of the JSON object.

    TEXT TO CONVERT:
    ${contentToConvert}
    `;

    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            objective: {
                type: Type.STRING,
                description: "The user's inferred goal."
            },
            core_focus: {
                type: Type.STRING,
                description: "A detailed text prompt combining all key elements."
            },
            constraints: {
                type: Type.STRING,
                description: "A summary of all technical specs and requirements."
            },
            enhancements: {
                type: Type.STRING,
                description: "Optional suggestions for improving the prompt."
            }
        },
        required: ["objective", "core_focus", "constraints"]
    };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: conversionPrompt,
            config: {
                systemInstruction: "You are a data formatting expert. Your only task is to convert structured text into a clean, valid JSON object based on the provided schema.",
                responseMimeType: "application/json",
                responseSchema: responseSchema,
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
