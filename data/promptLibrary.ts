import React from 'react';
import { FilmIcon, UserCircleIcon, GlobeAltIcon, PaintBrushIcon, ActionIcon, AnimeIcon, LogoIcon } from '../components/icons.tsx';
import { StructuredPrompt } from '../types.ts';

export interface PromptTemplate {
    id: string;
    title: string;
    prompt: string; // This is the core_focus
    structuredPrompt: StructuredPrompt;
}

export interface PromptCategory {
    name: string;
    icon: React.FC<{ className?: string }>;
    prompts: PromptTemplate[];
}

export const promptLibraryData: PromptCategory[] = [
    {
        name: "Cinematic Scenes",
        icon: FilmIcon,
        prompts: [
            { 
                id: "cs01", 
                title: "Aquatic Cyberpunk Metropolis", 
                prompt: `SCENE: A wide, cinematic shot of a sprawling futuristic city, partially submerged in dark, reflective water at night.

SUBJECTS:
- A sleek, dark, low-flying hovercraft with bright rectangular headlights, moving from left to right, leaving a faint vapor trail.
- A glowing blue humanoid figure visible within a portal at the base of a massive, moon-like spherical structure.
- Multiple smaller futuristic flying vehicles in the distance.

SETTING:
- Location: A futuristic metropolis partially submerged in water, with ancient, eroded dark stone ruins scattered throughout.
- Details: Two large, translucent spherical domes dominate the scene. The left dome contains a cityscape glowing with intense cyan and electric blue neon. The right dome contains a city illuminated in vibrant purple and magenta. The water surface is covered with clusters of glowing, bioluminescent aquatic plants. In the background, incredibly tall, slender skyscrapers with vertical light strips are visible.

COMPOSITION:
- Camera Shot: Wide, cinematic shot.
- Camera Movement: Implied slow pan to follow the hovercraft.

AESTHETICS:
- Style: Cyberpunk, futuristic, with a blend of advanced technology and ancient ruins.
- Lighting: High-contrast neon and bioluminescence. The primary colors are deep blues, purples, cyans, and magenta.
- Mood: Mystical, ethereal, high-tech.`,
                structuredPrompt: {
                    objective: "To create a highly detailed, cinematic visual representation of a futuristic, aquatic cyberpunk city at night, featuring advanced aerial vehicles and bioluminescent architecture, with an emphasis on vibrant neon lighting and a mysterious, ethereal atmosphere.",
                    core_focus: `SCENE: A wide, cinematic shot of a sprawling futuristic city, partially submerged in dark, reflective water at night.

SUBJECTS:
- A sleek, dark, low-flying hovercraft with bright rectangular headlights, moving from left to right, leaving a faint vapor trail.
- A glowing blue humanoid figure visible within a portal at the base of a massive, moon-like spherical structure.
- Multiple smaller futuristic flying vehicles in the distance.

SETTING:
- Location: A futuristic metropolis partially submerged in water, with ancient, eroded dark stone ruins scattered throughout.
- Details: Two large, translucent spherical domes dominate the scene. The left dome contains a cityscape glowing with intense cyan and electric blue neon. The right dome contains a city illuminated in vibrant purple and magenta. The water surface is covered with clusters of glowing, bioluminescent aquatic plants. In the background, incredibly tall, slender skyscrapers with vertical light strips are visible.

COMPOSITION:
- Camera Shot: Wide, cinematic shot.
- Camera Movement: Implied slow pan to follow the hovercraft.

AESTHETICS:
- Style: Cyberpunk, futuristic, with a blend of advanced technology and ancient ruins.
- Lighting: High-contrast neon and bioluminescence. The primary colors are deep blues, purples, cyans, and magenta.
- Mood: Mystical, ethereal, high-tech.`,
                    constraints: `The setting must be a dark, high-contrast night scene. The color palette is strictly deep blues, purples, cyans, and magenta. All vehicles are sleek, dark, and futuristic. The only figure is the stylized blue humanoid. The camera perspective must be a wide-angle, cinematic shot. Maintain an ethereal and mysterious tone.`,
                    enhancements: `Consider adding atmospheric effects like mist or glowing particles. Experiment with light refraction through the water and domes. Introduce more varied designs for the bioluminescent flora. Explore dynamic camera movements to highlight the city's scale.`
                }
            },
            { 
                id: "cs02", 
                title: "Enchanted Forest Clearing", 
                prompt: "Subject: A mystical, deer-like creature with glowing antlers drinking from a sparkling pond. Setting: A secret clearing in an ancient, enchanted forest at midnight. Details: Beams of ethereal moonlight pierce the dense canopy, illuminating glowing mushrooms and magical flora.",
                structuredPrompt: {
                    objective: "Generate a magical fantasy scene of a mystical creature in an enchanted forest.",
                    core_focus: "Subject: A mystical, deer-like creature with glowing antlers drinking from a sparkling pond. Setting: A secret clearing in an ancient, enchanted forest at midnight. Details: Beams of ethereal moonlight pierce the dense canopy, illuminating glowing mushrooms and magical flora.",
                    constraints: "Camera: Low-angle shot. Lighting: Magical, volumetric moonlight and bioluminescence. Style: Fantasy, magical realism, hyper-detailed. Mood: Serene, wondrous.",
                }
            },
            { 
                id: "cs03", 
                title: "Grand Library of Alexandria", 
                prompt: "Subject: Scholars in white togas studying and debating. Setting: The grand, ancient Library of Alexandria at its peak. Details: Towering shelves filled with countless scrolls reach towards a domed ceiling, intricate mosaics on the floor.",
                structuredPrompt: {
                    objective: "Recreate the intellectual atmosphere of the ancient Library of Alexandria.",
                    core_focus: "Subject: Scholars in white togas studying and debating. Setting: The grand, ancient Library of Alexandria at its peak. Details: Towering shelves filled with countless scrolls reach towards a domed ceiling, intricate mosaics on the floor.",
                    constraints: "Camera: Epic scale, wide-angle shot. Lighting: Warm, cinematic lighting from oil lamps and sunbeams. Style: Historical realism, detailed, cinematic. Mood: Intellectual, grand, peaceful.",
                }
            },
        ]
    },
    {
        name: "Action Sequences",
        icon: ActionIcon,
        prompts: [
            {
                id: "ac01",
                title: "Rooftop Parkour Chase",
                prompt: "Action: High-speed parkour chase between two figures, leaping between buildings and sliding under obstacles. Setting: Across the rooftops of a dense, modern city.",
                structuredPrompt: {
                    objective: "Create a dynamic, first-person video sequence of a parkour chase.",
                    core_focus: "Action: High-speed parkour chase between two figures, leaping between buildings and sliding under obstacles. Setting: Across the rooftops of a dense, modern city.",
                    constraints: "Camera: Dynamic first-person view (FPV). Style: Action-packed, realistic video game aesthetic. Effects: Motion blur, lens flares. Mood: Dangerous, exhilarating, urgent.",
                }
            },
        ]
    },
    {
        name: "Characters & Figures",
        icon: UserCircleIcon,
        prompts: [
            {
                id: "cd01",
                title: "Steampunk Inventor",
                prompt: "Subject: A brilliant female steampunk inventor with oil-smudged cheeks and wild hair. Attire: Intricate brass goggles pushed up on her forehead, a tool-filled leather apron over a practical Victorian dress. Setting: Her cluttered workshop, filled with gears, blueprints, and half-finished clockwork gadgets.",
                structuredPrompt: {
                    objective: "Generate a detailed character portrait of a steampunk inventor.",
                    core_focus: "Subject: A brilliant female steampunk inventor with oil-smudged cheeks and wild hair. Attire: Intricate brass goggles, tool-filled leather apron over a Victorian dress. Setting: Her cluttered workshop with gears, blueprints, and clockwork gadgets.",
                    constraints: "Camera: Detailed character portrait, medium shot. Lighting: Warm, inviting light from a single Edison bulb hanging overhead. Style: Steampunk concept art, detailed illustration. Mood: Inventive, intelligent, focused."
                }
            },
        ]
    }
];