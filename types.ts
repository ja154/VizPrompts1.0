

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

// New interface for the detailed scene-by-scene analysis
export interface SceneAnalysis {
    scene_number: number;
    description: string;
    camera_details: string;
    lighting: string;
    color_palette: string;
    textures_details: string;
    atmosphere: string;
    sound_design: string;
}

// Updated type for storing a single prompt history item
export interface PromptHistoryItem {
    id: string;
    prompt: string;
    sceneAnalyses: SceneAnalysis[];
    jsonPrompt: string; // This will hold the video_analysis JSON
    thumbnail: string; // Should be a full data URI: "data:image/jpeg;base64,..."
    timestamp: string;
}