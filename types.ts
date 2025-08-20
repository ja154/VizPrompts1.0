

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

// New interfaces based on the detailed analytical wireframe
export interface HolisticImpression {
    genre: string;
    dominant_feeling: string;
    core_subject: string;
}

// Phase 2: Systematic Deconstruction - DEEPLY NESTED
export interface SubjectAttributes {
    preparation: string; // e.g., "Grilled"
    presentation: string; // e.g., "Coiled in a tower"
    appearance: string; // e.g., "Glazed, red/brown, spicy, covered in chilies, garlic, sesame seeds"
    state: string; // e.g., "Cooked, with white meat visible when opened"
    unusual_details: string; // e.g., "The head is propped up, mouth open in an aggressive pose"
}

export interface SubjectAnalysis {
    core_object: string; // e.g., "Snake"
    attributes: SubjectAttributes;
}

export interface EnvironmentDetails {
    immediate_setting: string; // e.g., "A charcoal grill"
    key_details: string[]; // e.g., ["Glowing coals", "smoke"]
    background: string; // e.g., "Dark, indistinct (intentionally creating focus)"
}

export interface SettingAnalysis {
    environment: EnvironmentDetails;
    props: string[]; // e.g., ["Small clay bowls", "limes", "a dipping sauce"]
}

export interface CharacterAnalysis {
    presence: string; // e.g., "A woman"
    role: string; // e.g., "The eater/protagonist"
    key_actions_summary: string[]; // e.g., ["Appears", "uses a cleaver", "chops", "breaks the meat", "eats"]
}

export interface CinematographyAnalysis {
    shot_types_and_framing: string; // e.g., "Starts with an extreme close-up"
    depth_of_field: string; // e.g., "Shallow depth of field"
    camera_movement: string; // e.g., "Steady but moves to reveal more"
    lighting: string; // e.g., "Dramatic, like a spotlight"
}

export interface SoundDesignAnalysis {
    key_sounds: string[]; // e.g., ["Sizzle (from the grill)", "A sharp 'thunk' (from the cleaver)"]
    sound_characteristics: string; // e.g., "Sounds are amplified and crisp"
}

export interface EventAnalysis {
    event_number: number;
    description: string; // e.g., "Introduction of the food -> introduction of the eater -> the 'attack' -> reveal of interior -> consumption."
}

export interface SystematicDeconstruction {
    subject: SubjectAnalysis;
    setting: SettingAnalysis;
    character: CharacterAnalysis;
    cinematography: CinematographyAnalysis;
    sound_design: SoundDesignAnalysis;
    sequence_of_events: EventAnalysis[];
}

export interface VideoAnalysis {
    holistic_impression: HolisticImpression;
    systematic_deconstruction: SystematicDeconstruction;
    master_prompt: string;
}


// Updated type for storing a single prompt history item
export interface PromptHistoryItem {
    id: string;
    prompt: string;
    videoAnalysis: VideoAnalysis;
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
    suggested_improvements: string;
}