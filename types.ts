

export enum AnalysisState {
  IDLE = 'idle',
  PREVIEW = 'preview',
  PROCESSING = 'processing',
  SUCCESS = 'success',
  ERROR = 'error',
}

// Defines the structure for a user account
export interface User {
    username: string;
    email: string;
    fullName: string;
    password?: string; // Optional: not present for Google Sign-In users.
    createdAt: string;
    profilePicture?: string; // Should be a full data URI: "data:image/png;base64,..."
}

// New type for the structured analysis based on the new system prompt
export interface StructuredPrompt {
    objective: string;
    core_focus: string;
    constraints: string;
    enhancements?: string;
}

// Updated type for storing a single prompt history item
export interface PromptHistoryItem {
    id: string;
    prompt: string; // This will now be the core_focus
    structuredPrompt: StructuredPrompt;
    thumbnail: string; // Should be a full data URI: "data:image/jpeg;base64,..."
    timestamp: string;
}

// New interface for the prompt consistency test result
export interface ConsistencyResult {
    reasoning: {
        analysis_of_prompt: string;
        analysis_of_media: string;
        comparison: string;
    };
    consistency_score: number;
    explanation: string;
    missing_details: string[];
    revised_output: string;
}