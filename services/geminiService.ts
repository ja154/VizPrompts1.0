import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { VideoAnalysis, ConsistencyResult } from '../types.ts';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export interface PromptGenerationResult {
  prompt: string;
  videoAnalysis: VideoAnalysis;
  jsonResponse: string;
}

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

const getVideoAnalysisSchema = () => ({
    type: Type.OBJECT,
    properties: {
        holistic_impression: {
            type: Type.OBJECT,
            description: "Phase 1: The big-picture analysis of the video's genre and purpose.",
            properties: {
                genre: { type: Type.STRING, description: "The specific genre (e.g., 'Cinematic Food Video, ASMR, Mukbang')." },
                dominant_feeling: { type: Type.STRING, description: "The primary emotional or sensory reaction (e.g., 'Intense, Appetizing, Sensory')." },
                core_subject: { type: Type.STRING, description: "The absolute central subject of the video (e.g., 'A giant, spicy, grilled snake')." }
            },
            required: ["genre", "dominant_feeling", "core_subject"]
        },
        systematic_deconstruction: {
            type: Type.OBJECT,
            description: "Phase 2: A systematic breakdown of the scene's components, like a digital cinematographer.",
            properties: {
                subject: {
                    type: Type.OBJECT,
                    description: "Analysis of the main subject (The 'What').",
                    properties: {
                        core_object: { type: Type.STRING, description: "The absolute core object." },
                        attributes: {
                            type: Type.OBJECT,
                            properties: {
                                preparation: { type: Type.STRING, description: "How is it prepared?" },
                                presentation: { type: Type.STRING, description: "How is it presented?" },
                                appearance: { type: Type.STRING, description: "What does it look like? What is on it?" },
                                state: { type: Type.STRING, description: "What is its current state?" },
                                unusual_details: { type: Type.STRING, description: "Are there any unusual details or poses?" }
                            },
                            required: ["preparation", "presentation", "appearance", "state", "unusual_details"]
                        }
                    },
                    required: ["core_object", "attributes"]
                },
                setting: {
                    type: Type.OBJECT,
                    description: "Analysis of the environment (The 'Where').",
                    properties: {
                        environment: {
                            type: Type.OBJECT,
                            properties: {
                                immediate_setting: { type: Type.STRING },
                                key_details: { type: Type.ARRAY, items: { type: Type.STRING } },
                                background: { type: Type.STRING }
                            },
                            required: ["immediate_setting", "key_details", "background"]
                        },
                        props: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of supporting objects in the frame." }
                    },
                    required: ["environment", "props"]
                },
                character: {
                    type: Type.OBJECT,
                    description: "Analysis of the actor (The 'Who').",
                    properties: {
                        presence: { type: Type.STRING, description: "Describe the person/actor present." },
                        role: { type: Type.STRING, description: "What is their role in the scene?" },
                        key_actions_summary: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List their key actions in order." }
                    },
                    required: ["presence", "role", "key_actions_summary"]
                },
                cinematography: {
                    type: Type.OBJECT,
                    description: "Analysis of the filming technique (The 'How').",
                    properties: {
                        shot_types_and_framing: { type: Type.STRING },
                        depth_of_field: { type: Type.STRING },
                        camera_movement: { type: Type.STRING },
                        lighting: { type: Type.STRING }
                    },
                    required: ["shot_types_and_framing", "depth_of_field", "camera_movement", "lighting"]
                },
                sound_design: {
                    type: Type.OBJECT,
                    description: "Analysis of the audio.",
                    properties: {
                        key_sounds: { type: Type.ARRAY, items: { type: Type.STRING } },
                        sound_characteristics: { type: Type.STRING, description: "e.g., 'Amplified and crisp'" }
                    },
                    required: ["key_sounds", "sound_characteristics"]
                },
                sequence_of_events: {
                    type: Type.ARRAY,
                    description: "The narrative flow or micro-story.",
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            event_number: { type: Type.INTEGER },
                            description: { type: Type.STRING }
                        },
                        required: ["event_number", "description"]
                    }
                }
            },
            required: ["subject", "setting", "character", "cinematography", "sound_design", "sequence_of_events"]
        },
        master_prompt: {
            type: Type.STRING,
            description: "Phase 4: The final, synthesized, direct text-to-video prompt, created by combining all event descriptions."
        }
    },
    required: ["holistic_impression", "systematic_deconstruction", "master_prompt"]
});


/**
 * Converts a descriptive text prompt into a structured JSON object using the new analytical wireframe.
 * @param promptToStructure The text prompt to convert.
 * @param masterPrompt The foundational system instruction for the AI's personality.
 * @returns A promise that resolves to a stringified JSON object representing the video analysis.
 */
export const structurePrompt = async (promptToStructure: string, masterPrompt: string): Promise<string> => {
    const structuringPrompt = `
      Based on the following text-to-video prompt, deconstruct it using the Analytical Wireframe methodology and convert it into a structured JSON object.
      Your goal is to create a detailed blueprint for generating this video.

      **Phase 1: Holistic Impression**
      - Infer the genre, dominant feeling, and core subject.

      **Phase 2: Systematic Deconstruction**
      - Analyze and populate all fields for the Subject, Setting, Character, Cinematography, and Sound Design.
      - Break down the narrative flow into a sequence_of_events array. If it's one continuous action, create a single event.

      **Phase 4: Synthesis & Structuring**
      - Synthesize all event descriptions into a single, cohesive master_prompt.
      - Assemble all data into a single JSON object conforming to the schema.

      TEXT PROMPT:
      "${promptToStructure}"
    `;
    
    try {
        const structuringResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: structuringPrompt,
            config: {
                systemInstruction: `${masterPrompt}\n\nYour primary task is to convert a descriptive text prompt into a well-organized JSON object based on the provided Analytical Wireframe. The JSON must adhere to the provided schema. Output only the raw JSON.`,
                responseMimeType: "application/json",
                responseSchema: getVideoAnalysisSchema(),
            }
        });

        const jsonPrompt = structuringResponse.text;
        if (!jsonPrompt) {
            throw new Error("The AI model did not return a valid structured JSON prompt.");
        }

        let cleanedJsonPrompt = jsonPrompt.trim();
        const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
        const match = cleanedJsonPrompt.match(fenceRegex);
        if (match && match[2]) {
            cleanedJsonPrompt = match[2].trim();
        }
        
        try {
            JSON.parse(cleanedJsonPrompt);
        } catch (e) {
            console.error("Failed to parse the structured JSON prompt from AI:", cleanedJsonPrompt, e);
            cleanedJsonPrompt = JSON.stringify({ error: "AI returned invalid JSON.", details: cleanedJsonPrompt }, null, 2);
        }
        return cleanedJsonPrompt;

    } catch (error) {
        console.error("Error during Gemini API communication for structuring:", error);
        if (error instanceof Error) {
            throw new Error(`AI structuring failed: ${error.message}`);
        }
        throw new Error("An unknown error occurred while communicating with the AI for structuring.");
    }
};


/**
 * Generates a simple, descriptive text prompt from media frames quickly.
 * This version disables AI "thinking" for low latency.
 * @param frameDataUrls An array of data URLs for the video frames or images.
 * @param masterPrompt The foundational system instruction for the AI's personality.
 * @returns A promise that resolves to the generated text prompt string.
 */
export const generateSimplePromptFromFrames = async (
    frameDataUrls: string[],
    masterPrompt: string
): Promise<string> => {
    if (frameDataUrls.length === 0) {
        throw new Error("No frames provided for analysis.");
    }

    const imagePartsForAnalysis = frameDataUrls.map(dataUrl => {
        const { base64, mimeType } = parseDataUrl(dataUrl);
        return { inlineData: { mimeType, data: base64 } };
    });

    const prompt = `You are an expert media analyst. Analyze these video frames and generate a single, cohesive, comma-separated paragraph that describes the entire sequence of events. This will be used as a text-to-video prompt. Focus on the main subject, action, setting, and style. Be fast and direct.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [{ text: prompt }, ...imagePartsForAnalysis] },
        config: {
            systemInstruction: masterPrompt,
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
 * Generates a hyper-detailed text-to-video prompt from media frames using the Analytical Wireframe.
 * This is the high-quality, slower version that uses full thinking.
 * @param frameDataUrls An array of data URLs for the video frames or images.
 * @param onProgress A callback to update the UI with processing messages.
 * @param masterPrompt The foundational system instruction for the AI's personality.
 * @returns A promise that resolves to an object containing the final prompt and the detailed analysis object.
 */
export const generateDetailedAnalysisFromFrames = async (
    frameDataUrls: string[],
    onProgress: (message: string) => void,
    masterPrompt: string
): Promise<PromptGenerationResult> => {
    if (frameDataUrls.length === 0) {
        throw new Error("No frames provided for analysis.");
    }

    onProgress('Analyzing media with Gemini...');

    try {
        const imagePartsForAnalysis = frameDataUrls.map(dataUrl => {
            const { base64, mimeType } = parseDataUrl(dataUrl);
            return { inlineData: { mimeType, data: base64 } };
        });

        const analysisPrompt = `
        You are a world-class AI film director and media analyst. Your task is to analyze a sequence of video frames and generate a single, raw JSON object based on the provided schema, strictly following the Analytical Wireframe methodology.

        **Phase 1: Holistic Impression & Genre Identification**
        - **\`genre\`**: Identify the specific genre. (e.g., 'Cinematic Food Video, ASMR, Mukbang').
        - **\`dominant_feeling\`**: What is the dominant feeling or impression? (e.g., 'Shocking, appetizing, intense, sensory').
        - **\`core_subject\`**: Define the absolute center of this video. (e.g., 'A giant, spicy, grilled snake').

        **Phase 2: Systematic Deconstruction (The "Digital Cinematographer" approach)**
        Systematically break down the scene as if you were a director planning to shoot it.
        - **Subject (The "What")**:
          - **\`core_object\`**: What is the absolute core object? (e.g., "Snake")
          - **\`attributes\`**: Describe the attributes in detail.
            - **\`preparation\`**: How is it prepared? (e.g., "Grilled")
            - **\`presentation\`**: How is it presented? (e.g., "Coiled in a tower")
            - **\`appearance\`**: What does it look like? What is on it? (e.g., "Glazed, red/brown, spicy, covered in chilies, garlic, sesame seeds")
            - **\`state\`**: What is its current state? (e.g., "Cooked, with white meat visible when opened")
            - **\`unusual_details\`**: Are there any "unspoken" details? (e.g., "The head is propped up, mouth open in an aggressive pose")
        - **Setting (The "Where")**:
          - **\`environment\`**:
            - **\`immediate_setting\`**: Describe the immediate location. (e.g., "A charcoal grill")
            - **\`key_details\`**: What are the key environmental details? (e.g., ["Glowing coals", "smoke"])
            - **\`background\`**: Describe the background. (e.g., "Dark, indistinct, creating focus")
          - **\`props\`**: List all supporting objects in the frame. (e.g., ["Small clay bowls", "limes", "a dipping sauce"])
        - **Character (The "Who")**:
          - **\`presence\`**: Is there a person present? Describe them. (e.g., "A woman")
          - **\`role\`**: What is their role? (e.g., "The eater/protagonist")
          - **\`key_actions_summary\`**: List their key actions in order. (e.g., ["She appears", "she uses a cleaver", "she chops", "she eats"])
        - **Technique (The "How")**:
          - **Cinematography**:
            - **\`shot_types_and_framing\`**: How is it filmed? (e.g., "Starts with an extreme close-up")
            - **\`depth_of_field\`**: Describe the depth of field. (e.g., "Shallow depth of field")
            - **\`camera_movement\`**: Is the camera moving? (e.g., "Steady but moves to reveal more")
            - **\`lighting\`**: Describe the lighting. (e.g., "Dramatic, like a spotlight")
          - **Sound Design**:
            - **\`key_sounds\`**: What are the key, specific sounds? (e.g., ["Sizzle from the grill", "A sharp 'thunk' from the cleaver", "Tearing of the meat"])
            - **\`sound_characteristics\`**: Describe the quality of the sounds. (e.g., "Sounds are amplified and crisp")
        - **Narrative Flow (Sequence)**:
          - **\`sequence_of_events\`**: Create a chronological micro-story of what happens. This is a sequence of descriptions. (e.g., [{event_number: 1, description: "Introduction of the food"}, {event_number: 2, description: "Introduction of the eater"}, ...])

        **Phase 4: Synthesis & Structuring**
        - **\`master_prompt\`**: Synthesize all the event descriptions from the \`sequence_of_events\` into one single, cohesive, comma-separated paragraph. This master prompt should chronologically narrate the entire video for a text-to-video AI model.

        Your entire output must be a single JSON object conforming to the schema. Do not include any conversational text or markdown.
        `;
        
        const responseSchema = getVideoAnalysisSchema();

        const analysisResponse: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [{ text: analysisPrompt }, ...imagePartsForAnalysis] },
            config: {
                systemInstruction: `${masterPrompt}\n\nYour task is to perform a multi-step analysis based on the Analytical Wireframe and return a single, structured JSON object adhering to the provided schema. Do not output any conversational text or markdown.`,
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                temperature: 0.7,
            }
        });
        
        let analysisJsonStr = analysisResponse.text.trim();
        const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
        let match = analysisJsonStr.match(fenceRegex);
        if (match && match[2]) {
            analysisJsonStr = match[2].trim();
        }
    
        const result: VideoAnalysis = JSON.parse(analysisJsonStr);

        if (!result.master_prompt || !result.systematic_deconstruction || !result.holistic_impression) {
            throw new Error("The AI model returned an incomplete analysis. The result was missing key fields. Please try a different video.");
        }

        return {
            prompt: result.master_prompt,
            videoAnalysis: result,
            jsonResponse: analysisJsonStr,
        };

    } catch (error) {
        console.error("Error during Gemini API communication:", error);
        if (error instanceof Error) {
            if (error.name === 'SyntaxError') {
                throw new Error(`AI processing failed: The model returned an invalid JSON structure. Please try again.`);
            }
            throw new Error(`AI processing failed: ${error.message}`);
        }
        throw new Error("An unknown error occurred while communicating with the AI.");
    }
};

export const remixPrompt = async (promptToRemix: string, masterPrompt: string): Promise<string[]> => {
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
                systemInstruction: `${masterPrompt}\n\nYour task is to generate three creative variations of a prompt. You MUST return a single, raw JSON object that is an array of strings, where each string is a new prompt. Example: ["new prompt 1", "new prompt 2", "new prompt 3"]. Do not include any other text or markdown.`,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                }
            }
        });

        const jsonResponse = response.text.trim();
        // The response text is already a parsed JSON object when using responseSchema, but the service returns it as a string. We must parse it.
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

export const refinePrompt = async (currentPrompt: string, userInstruction: string, negativePrompt: string, masterPrompt: string): Promise<string> => {
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
                systemInstruction: `${masterPrompt}\n\nYour primary task is to rewrite a given text-to-video prompt based on a user's instruction. If a list of elements to exclude is provided, you must ensure the new prompt does not contain them. Your output MUST be only the new, refined prompt. Do not include any conversational text, explanations, or markdown formatting. Just the prompt itself.`,
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

export const remixVideoStyle = async (
    frameDataUrls: string[],
    targetStyle: string,
    masterPrompt: string
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
                systemInstruction: masterPrompt,
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
    frameDataUrls: string[],
    masterPrompt: string
): Promise<ConsistencyResult> => {
    if (frameDataUrls.length === 0) {
        throw new Error("No frames provided for consistency check.");
    }

    const imageParts = frameDataUrls.map(dataUrl => {
        const { base64, mimeType } = parseDataUrl(dataUrl);
        return { inlineData: { mimeType, data: base64 } };
    });

    const consistencyCheckPrompt = `
    You are an expert Generative Media Forensics AI. Your task is to analyze the consistency between a text prompt and media frames to help a user refine their prompt for perfect recreation.

    You will be given:
    1. A "Text-to-Video Prompt".
    2. A series of "Original Video Frames".

    First, perform a detailed forensic analysis by following these steps:
    1.  **\`analysis_of_prompt\`**: Meticulously break down the provided prompt. List every specific subject, action, style, and detail it describes.
    2.  **\`analysis_of_media\`**: Thoroughly examine the video frames. Identify all key visual elements, including subjects, actions, camera work, lighting, and overall aesthetic. Be objective.
    3.  **\`comparison\`**: Compare the two analyses. Note where they align and, more importantly, where they diverge.

    Based on your forensic analysis, generate a single, raw JSON object containing your final report with the following fields:
    - **\`reasoning\`**: An object containing your detailed forensic analysis from the steps above (\`analysis_of_prompt\`, \`analysis_of_media\`, \`comparison\`).
    - **\`consistency_score\`**: An integer from 0 to 100 based on your comparison. Be strict. 90+ is a near-perfect match. A low score indicates significant visual information is missing from the prompt.
    - **\`explanation\`**: A concise, one-sentence summary explaining the score.
    - **\`missing_details\`**: A JSON array of strings, listing specific, crucial visual details from the media that are missing or vague in the prompt.
    - **\`suggested_improvements\`**: A single string containing a revised, master-level prompt that incorporates all the missing details to achieve a 90+ score.

    Here is the Text-to-Video Prompt:
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
            suggested_improvements: {
                type: Type.STRING,
                description: "A revised version of the prompt that incorporates the missing details to achieve a 90+ score."
            }
        },
        required: ["reasoning", "consistency_score", "explanation", "missing_details", "suggested_improvements"]
    };

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [{ text: consistencyCheckPrompt }, ...imageParts] },
            config: {
                systemInstruction: `${masterPrompt}\n\nYour task is to act as a consistency checker and return a single, structured JSON object adhering to the provided schema. Do not output any conversational text or markdown.`,
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
            typeof result.suggested_improvements !== 'string'
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