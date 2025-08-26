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
                prompt: "A wide, cinematic shot of a sprawling futuristic city, possibly underwater or partially submerged in dark, reflective water. The foreground features a sleek, dark, low-flying hovercraft or flying car with prominent, bright rectangular headlights, moving from left to right across the frame, leaving a faint vapor trail. The midground and background showcase two dominant, translucent spherical force fields or domes. The left dome encapsulates a towering cityscape glowing intensely with cyan and electric blue neon lights, while the right dome encloses another cityscape illuminated with vibrant purple and magenta hues. Between and around these futuristic structures, ancient, eroded dark stone columns and partially submerged ruins are visible. The water surface is covered with clusters of glowing, bioluminescent aquatic plants in shades of blue and green. In later frames, the scene expands to reveal a more expansive view of the city: numerous slender, incredibly tall skyscrapers with vertical strips of glowing blue and purple lights pierce the dark sky. A massive, smooth, moon-like spherical structure dominates the central background, with a glowing blue humanoid figure visible within a portal at its base. Multiple smaller, similar futuristic flying vehicles are seen in the distance, leaving faint trails. The overall aesthetic is a blend of advanced technology and ancient ruins, bathed in the glow of neon and bioluminescence, creating a mystical, high-tech environment.",
                structuredPrompt: {
                    objective: "To create a highly detailed, cinematic visual representation of a futuristic, aquatic cyberpunk city at night, featuring advanced aerial vehicles and bioluminescent architecture, with an emphasis on vibrant neon lighting and a mysterious, ethereal atmosphere.",
                    core_focus: "A wide, cinematic shot of a sprawling futuristic city, possibly underwater or partially submerged in dark, reflective water. The foreground features a sleek, dark, low-flying hovercraft or flying car with prominent, bright rectangular headlights, moving from left to right across the frame, leaving a faint vapor trail. The midground and background showcase two dominant, translucent spherical force fields or domes. The left dome encapsulates a towering cityscape glowing intensely with cyan and electric blue neon lights, while the right dome encloses another cityscape illuminated with vibrant purple and magenta hues. Between and around these futuristic structures, ancient, eroded dark stone columns and partially submerged ruins are visible. The water surface is covered with clusters of glowing, bioluminescent aquatic plants in shades of blue and green. In later frames, the scene expands to reveal a more expansive view of the city: numerous slender, incredibly tall skyscrapers with vertical strips of glowing blue and purple lights pierce the dark sky. A massive, smooth, moon-like spherical structure dominates the central background, with a glowing blue humanoid figure visible within a portal at its base. Multiple smaller, similar futuristic flying vehicles are seen in the distance, leaving faint trails. The overall aesthetic is a blend of advanced technology and ancient ruins, bathed in the glow of neon and bioluminescence, creating a mystical, high-tech environment.",
                    constraints: "The image must maintain a dark, nocturnal setting with high contrast between glowing elements and deep shadows. The color palette should be dominated by deep blues, purples, cyans, and magenta, with minimal natural light. All vehicles should be sleek, dark, and futuristic, devoid of visible traditional propulsion. No visible human figures other than the stylized glowing humanoid in the central structure. The perspective should be wide-angle and cinematic, avoiding close-ups that break the scale of the city. Maintain an ethereal and slightly mysterious tone. The water should have subtle ripples and reflections.",
                    enhancements: "Consider adding subtle atmospheric effects like mist or glowing particles in the air to enhance the ethereal quality. Experiment with different light refraction effects through the water and the spherical domes. Introduce more varied designs for the bioluminescent flora to add complexity to the aquatic landscape. Explore dynamic camera movements that sweep across the vastness of the city, highlighting its scale and intricate details."
                }
            },
            { 
                id: "cs02", 
                title: "Enchanted Forest Clearing", 
                prompt: "Subject: A mystical, deer-like creature with glowing antlers drinking from a sparkling pond. Setting: A secret clearing in an ancient, enchanted forest at midnight. Details: Beams of ethereal moonlight pierce the dense canopy, illuminating glowing mushrooms and magical flora. Camera: Low-angle shot looking up towards the creature. Lighting: Magical, volumetric lighting from the moon and bioluminescent plants. Style: Fantasy, magical realism, hyper-detailed. Mood: Serene, wondrous, magical.",
                structuredPrompt: {
                    objective: "Generate a magical fantasy scene of a mystical creature in an enchanted forest.",
                    core_focus: "Subject: A mystical, deer-like creature with glowing antlers drinking from a sparkling pond. Setting: A secret clearing in an ancient, enchanted forest at midnight. Details: Beams of ethereal moonlight pierce the dense canopy, illuminating glowing mushrooms and magical flora.",
                    constraints: "Camera: Low-angle shot. Lighting: Magical, volumetric moonlight and bioluminescence. Style: Fantasy, magical realism, hyper-detailed. Mood: Serene, wondrous.",
                }
            },
            { 
                id: "cs03", 
                title: "Grand Library of Alexandria", 
                prompt: "Subject: Scholars in white togas studying and debating. Setting: The grand, ancient Library of Alexandria at its peak. Details: Towering shelves filled with countless scrolls reach towards a domed ceiling, intricate mosaics on the floor. Camera: Epic scale, wide-angle shot showing the vastness of the library. Lighting: Warm, cinematic lighting from oil lamps, with soft sunbeams filtering through high arched windows. Style: Historical realism, detailed, cinematic. Mood: Intellectual, grand, peaceful.",
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
                prompt: "Subject: A thrilling chase between two figures. Action: High-speed parkour, leaping between buildings, sliding under obstacles. Setting: Across the rooftops of a dense, modern urban environment. Camera: Dynamic first-person view (FPV) from the perspective of the one being chased. Details: Dynamic motion blur, lens flares, sense of vertigo and speed. Style: Action-packed, realistic video game aesthetic. Mood: Dangerous, exhilarating, urgent.",
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
                prompt: "Subject: A brilliant female steampunk inventor with oil-smudged cheeks and wild hair. Attire: Intricate brass goggles pushed up on her forehead, a tool-filled leather apron over a practical Victorian dress. Setting: Her cluttered workshop, filled with gears, blueprints, and half-finished clockwork gadgets. Camera: Detailed character portrait, medium shot. Lighting: Warm, inviting light from a single Edison bulb hanging overhead. Style: Steampunk concept art, detailed illustration. Mood: Inventive, intelligent, focused.",
                structuredPrompt: {
                    objective: "Generate a detailed character portrait of a steampunk inventor.",
                    core_focus: "Subject: A brilliant female steampunk inventor with oil-smudged cheeks and wild hair. Attire: Intricate brass goggles, tool-filled leather apron over a Victorian dress. Setting: Her cluttered workshop with gears, blueprints, and clockwork gadgets.",
                    constraints: "Camera: Detailed character portrait, medium shot. Lighting: Warm, inviting light from a single Edison bulb hanging overhead. Style: Steampunk concept art, detailed illustration. Mood: Inventive, intelligent, focused."
                }
            },
        ]
    }
];
