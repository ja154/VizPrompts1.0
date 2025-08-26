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
                title: "Neon-Noir Alleyway", 
                prompt: "Subject: A lone figure in a classic trench coat standing motionless in the shadows. Setting: A rain-slicked alley in a futuristic cyberpunk city at night. Details: Vivid neon signs cast long reflections in puddles on the cracked pavement, steam billows from grimy vents. Camera: Eye-level, wide shot capturing the full alley. Lighting: High-contrast, moody, atmospheric lighting dominated by pink and blue neon glow. Style: Cinematic, photorealistic, Blade Runner aesthetic. Mood: Mysterious, lonely, contemplative. 4K detail.",
                structuredPrompt: {
                    objective: "Create a cinematic, atmospheric image of a mysterious character in a cyberpunk setting.",
                    core_focus: "Subject: A lone figure in a classic trench coat standing motionless in the shadows. Setting: A rain-slicked alley in a futuristic cyberpunk city at night. Details: Vivid neon signs cast long reflections in puddles on the cracked pavement, steam billows from grimy vents. Style: Cinematic, photorealistic, Blade Runner aesthetic.",
                    constraints: "Camera: Eye-level, wide shot. Lighting: High-contrast, moody, pink and blue neon glow. Mood: Mysterious, lonely, contemplative. 4K detail.",
                    enhancements: "Consider adding flying vehicles in the distant sky to enhance the futuristic feel."
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
                    constraints: "Camera: Medium shot portrait. Lighting: Warm light from a single Edison bulb. Style: Steampunk concept art. Mood: Inventive, intelligent, focused.",
                }
            },
        ]
    },
    {
        name: "Anime & Manga",
        icon: AnimeIcon,
        prompts: [
            {
                id: "am01",
                title: "Shonen Hero Power-Up",
                prompt: "Subject: A classic anime hero. Action: Screaming as they power up, a fiery golden aura erupting around them, cracking the ground and causing rocks to levitate. Camera: Dynamic low-angle shot. Style: 90s Shonen anime style, cel shading, with intense speed lines and energy effects, inspired by Dragon Ball Z. Mood: Intense, explosive, powerful.",
                structuredPrompt: {
                    objective: "Create a classic Shonen anime power-up scene.",
                    core_focus: "Subject: An anime hero screaming as they power up, with a fiery golden aura erupting around them, cracking the ground and causing rocks to levitate.",
                    constraints: "Camera: Dynamic low-angle shot. Style: 90s Shonen anime, cel shading, intense speed lines, inspired by Dragon Ball Z. Mood: Intense, explosive, powerful.",
                }
            },
        ]
    },
    {
        name: "Artistic Styles",
        icon: PaintBrushIcon,
        prompts: [
            {
                id: "as01",
                title: "HDR Country Field",
                prompt: "Create an HDR photograph of a woman with pale freckled skin standing in a country field, wearing a sundress and a straw hat, smiling warmly. The lighting should be golden hour daylight to enhance the lifelike quality, with the warm glow of the setting sun highlighting the scene and creating a vibrant, detailed image.",
                structuredPrompt: {
                    objective: "Create a vibrant, lifelike HDR photograph of a woman in a field.",
                    core_focus: "Subject: A woman with pale freckled skin, wearing a sundress and a straw hat, smiling warmly. Setting: A country field.",
                    constraints: "Style: HDR Photography. Lighting: Golden hour daylight. Mood: Warm, joyful, serene.",
                }
            },
        ]
    },
    {
        name: "Environments",
        icon: GlobeAltIcon,
        prompts: [
            {
                id: "en01",
                title: "Floating Sky Islands",
                prompt: "Setting: Expansive landscape of majestic floating islands in the sky, at sunrise. Details: The islands are connected by ancient, moss-covered vine bridges, and beautiful waterfalls cascade from the edges into the clouds below. Camera: Epic, panoramic wide shot. Color palette: Vibrant colors, warm pinks and oranges from the sunrise against the green islands and white clouds. Style: Fantasy landscape painting, inspired by Studio Ghibli. Mood: Awe-inspiring, peaceful, adventurous.",
                structuredPrompt: {
                    objective: "Generate a beautiful fantasy landscape inspired by Studio Ghibli.",
                    core_focus: "Setting: Expansive landscape of majestic floating islands in the sky, at sunrise. Details: The islands are connected by ancient, moss-covered vine bridges, and beautiful waterfalls cascade from the edges into the clouds below.",
                    constraints: "Camera: Epic, panoramic wide shot. Colors: Warm pinks and oranges from sunrise, green islands, white clouds. Style: Fantasy landscape painting. Mood: Awe-inspiring, peaceful, adventurous.",
                }
            },
        ]
    },
    {
        name: "Logo & Brand Identity",
        icon: LogoIcon,
        prompts: [
            {
                id: "lb01",
                title: "Minimalist Geometric Logo",
                prompt: "Image Type: Vector art logo design. Subject: An abstract 'V' shape formed by clean, intersecting circles and thin lines. Style: Minimalist, geometric, modern. Color Palette: Blue and grey on a clean white background. Mood: Professional, clean, for a tech startup.",
                structuredPrompt: {
                    objective: "Design a minimalist, professional logo for a tech startup.",
                    core_focus: "Subject: An abstract 'V' shape formed by clean, intersecting circles and thin lines.",
                    constraints: "Image Type: Vector art. Style: Minimalist, geometric, modern. Colors: Blue and grey on a white background. Mood: Professional, clean.",
                }
            },
        ]
    },
    {
        name: "Abstract Art",
        icon: PaintBrushIcon,
        prompts: [
            {
                id: "aa01",
                title: "Liquid Marble",
                prompt: "Image Type: Abstract macro photography. Subject: Swirling, iridescent liquids blending together. Style: Resembles liquid marble or oil on water, with shimmering metallic textures. Color Palette: Rich black, gold, and teal. Detail: High detail capturing the intricate fluid dynamics. Mood: Elegant, luxurious, mesmerizing.",
                structuredPrompt: {
                    objective: "Create a luxurious and mesmerizing abstract image of swirling liquids.",
                    core_focus: "Subject: Swirling, iridescent liquids blending together, resembling liquid marble or oil on water.",
                    constraints: "Image Type: Abstract macro photography. Style: Shimmering metallic textures. Colors: Rich black, gold, and teal. Detail: High detail on fluid dynamics. Mood: Elegant, luxurious.",
                }
            },
        ]
    }
];
