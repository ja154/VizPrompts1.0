
import React from 'react';
import { FilmIcon, UserCircleIcon, GlobeAltIcon, PaintBrushIcon, ActionIcon, AnimeIcon, LogoIcon } from '../components/icons.tsx';

export interface PromptTemplate {
    id: string;
    title: string;
    prompt: string;
    jsonPrompt?: string;
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
                jsonPrompt: JSON.stringify({
                    "subject_and_action": "A lone figure in a classic trench coat standing motionless in the shadows.",
                    "image_type_and_style": "Cinematic, photorealistic, Blade Runner aesthetic.",
                    "setting_location_and_background": "A rain-slicked alley in a futuristic cyberpunk city at night, with steam billows from grimy vents and vivid neon signs.",
                    "lighting_and_atmosphere": "High-contrast, moody, atmospheric lighting dominated by the pink and blue glow of neon signs reflecting in puddles.",
                    "composition_and_camera_angle": "Eye-level, wide shot capturing the full alley.",
                    "color_palette_and_tonality": "A dark palette dominated by pink and blue neons, with deep shadows.",
                    "level_of_detail_and_texture": "4K detail, focusing on cracked pavement and the texture of wet surfaces.",
                    "desired_emotion_and_mood": "Mysterious, lonely, and contemplative."
                })
            },
            { 
                id: "cs02", 
                title: "Enchanted Forest Clearing", 
                prompt: "Subject: A mystical, deer-like creature with glowing antlers drinking from a sparkling pond. Setting: A secret clearing in an ancient, enchanted forest at midnight. Details: Beams of ethereal moonlight pierce the dense canopy, illuminating glowing mushrooms and magical flora. Camera: Low-angle shot looking up towards the creature. Lighting: Magical, volumetric lighting from the moon and bioluminescent plants. Style: Fantasy, magical realism, hyper-detailed. Mood: Serene, wondrous, magical.",
                jsonPrompt: JSON.stringify({
                    "subject_and_action": "A mystical, deer-like creature with glowing antlers is drinking from a sparkling pond.",
                    "image_type_and_style": "Fantasy, magical realism, hyper-detailed digital painting.",
                    "setting_location_and_background": "A secret clearing in an ancient, enchanted forest at midnight, with glowing mushrooms and magical flora.",
                    "lighting_and_atmosphere": "Ethereal, magical, volumetric moonlight piercing the dense canopy, supplemented by bioluminescent plants.",
                    "composition_and_camera_angle": "Low-angle shot looking up towards the creature to give it a majestic presence.",
                    "color_palette_and_tonality": "Deep blues and greens of the night forest, contrasted with the bright, ethereal glow of the moon, antlers, and plants.",
                    "level_of_detail_and_texture": "Hyper-detailed, focusing on the texture of the bark, the fur of the creature, and the sparkle of the water.",
                    "desired_emotion_and_mood": "Serene, wondrous, and magical."
                })
            },
            { 
                id: "cs03", 
                title: "Grand Library of Alexandria", 
                prompt: "Subject: Scholars in white togas studying and debating. Setting: The grand, ancient Library of Alexandria at its peak. Details: Towering shelves filled with countless scrolls reach towards a domed ceiling, intricate mosaics on the floor. Camera: Epic scale, wide-angle shot showing the vastness of the library. Lighting: Warm, cinematic lighting from oil lamps, with soft sunbeams filtering through high arched windows. Style: Historical realism, detailed, cinematic. Mood: Intellectual, grand, peaceful.",
                jsonPrompt: JSON.stringify({
                    "subject_and_action": "Scholars in white togas are actively studying and debating amongst themselves.",
                    "image_type_and_style": "Historical realism, detailed, cinematic style.",
                    "setting_location_and_background": "The grand, ancient Library of Alexandria at its peak, with towering shelves of scrolls and intricate mosaics on the floor.",
                    "lighting_and_atmosphere": "Warm, cinematic lighting from oil lamps, with soft sunbeams filtering through high arched windows, creating an intellectual atmosphere.",
                    "composition_and_camera_angle": "Epic scale, wide-angle shot to show the vastness of the library.",
                    "color_palette_and_tonality": "Warm tones from lamps and sunlight, with the neutral colors of stone and parchment.",
                    "level_of_detail_and_texture": "High detail on the texture of scrolls, togas, and architectural elements like the domed ceiling.",
                    "desired_emotion_and_mood": "Intellectual, grand, and peaceful."
                })
            },
            { 
                id: "cs04", 
                title: "Wasteland Sunset", 
                prompt: "Subject: A lone wanderer in rugged attire sitting on a rusty, modified motorcycle. Setting: Overlooking a vast post-apocalyptic wasteland from a cliff edge. Details: Ruined skyscrapers pierce the horizon, the sky is a brilliant mix of orange, purple, and deep red. Camera: Cinematic wide shot from behind the subject, emphasizing the scale of the wasteland. Lighting: Dramatic sunset lighting, casting long shadows. Style: Gritty, high-detail, Mad Max aesthetic. Mood: Solitary, resilient, awe-inspiring.",
                jsonPrompt: JSON.stringify({
                    "subject_and_action": "A lone wanderer in rugged attire is sitting on a rusty, modified motorcycle, looking out.",
                    "image_type_and_style": "Gritty, high-detail, photorealistic, Mad Max aesthetic.",
                    "setting_location_and_background": "A cliff edge overlooking a vast post-apocalyptic wasteland with ruined skyscrapers on the horizon.",
                    "lighting_and_atmosphere": "Dramatic sunset lighting creating long shadows and a brilliant sky.",
                    "composition_and_camera_angle": "Cinematic wide shot from behind the subject to emphasize the scale of the wasteland.",
                    "color_palette_and_tonality": "A brilliant mix of orange, purple, and deep red in the sky against the muted, dusty tones of the wasteland.",
                    "level_of_detail_and_texture": "High detail on the rusty motorcycle, the wanderer's rugged clothes, and the ruined city.",
                    "desired_emotion_and_mood": "Solitary, resilient, and awe-inspiring."
                })
            },
            {
                id: "cs05",
                title: "WWII Dogfight",
                prompt: "Subject: A British Spitfire in intense aerial combat with a German Messerschmitt Bf 109. Action: The Spitfire is firing its machine guns, with tracer rounds visible. Setting: Over the English Channel, amidst fluffy white clouds. Details: Dramatic contrails streak across the sky, reflections of the sun glint off the canopies. Camera: Dynamic tracking shot, following the Spitfire as it banks hard. Lighting: Bright, clear daylight. Style: Historically accurate, high-action, cinematic, with a subtle 1940s film grain. Mood: Tense, exhilarating, dramatic.",
                jsonPrompt: JSON.stringify({
                    "subject_and_action": "A British Spitfire is in an intense dogfight with a German Messerschmitt Bf 109, firing its machine guns with visible tracer rounds.",
                    "image_type_and_style": "Historically accurate, high-action, cinematic style with a subtle 1940s film grain.",
                    "setting_location_and_background": "Over the English Channel, high above fluffy white clouds.",
                    "lighting_and_atmosphere": "Bright, clear daylight, with sun glinting off canopies.",
                    "composition_and_camera_angle": "Dynamic tracking shot that follows the Spitfire as it banks hard.",
                    "color_palette_and_tonality": "Vibrant blues of the sky, white clouds, and military colors of the aircraft.",
                    "level_of_detail_and_texture": "Detailed aircraft models, dramatic contrails, and tracer fire effects.",
                    "desired_emotion_and_mood": "Tense, exhilarating, and dramatic."
                })
            },
            {
                id: "cs06",
                title: "Tense Western Standoff",
                prompt: "Subject: Two rival cowboys, one grizzled and experienced, the other a young gunslinger. Action: A classic standoff, hands hovering over their holstered revolvers. Setting: The dusty main street of a desolate Western town at high noon. Details: Tumbleweeds roll by, sweat beads on their foreheads. Camera: Extreme close-up on their squinting eyes, then cuts to a wide shot. Lighting: Harsh, direct high-noon sunlight. Style: Sergio Leone style, ultra-detailed, with cinematic anamorphic lens flare. Mood: High tension, suspenseful.",
                jsonPrompt: JSON.stringify({
                    "subject_and_action": "Two rival cowboys in a classic standoff, hands hovering over their holstered revolvers.",
                    "image_type_and_style": "Sergio Leone style Western, ultra-detailed, with cinematic anamorphic lens flare.",
                    "setting_location_and_background": "The dusty main street of a desolate Western town.",
                    "lighting_and_atmosphere": "Harsh, direct high-noon sunlight creating a tense atmosphere.",
                    "composition_and_camera_angle": "Extreme close-up on their squinting eyes, intercut with a wide shot of the street.",
                    "color_palette_and_tonality": "Washed-out, dusty desert colors.",
                    "level_of_detail_and_texture": "Ultra-detailed textures of leather, dust, and sweat beads on their foreheads.",
                    "desired_emotion_and_mood": "High tension and suspenseful."
                })
            },
            {
                id: "cs07",
                title: "Deep Sea Discovery",
                prompt: "Subject: A high-tech, spherical submersible exploring the ocean floor. Setting: The crushing darkness of the Mariana Trench, revealing a massive, bioluminescent ancient ruin of a lost city. Details: Strange, translucent sea creatures with glowing lures swim past the viewport. Camera: View from just outside the submersible, looking upon the vast city. Lighting: The only light sources are the submersible's powerful headlights creating volumetric beams and the city's own faint glow. Style: Photorealistic, National Geographic documentary style. Mood: Mysterious, awe-inspiring, eerie.",
                jsonPrompt: JSON.stringify({
                    "subject_and_action": "A high-tech, spherical submersible explores the ocean floor, discovering a lost city.",
                    "image_type_and_style": "Photorealistic, National Geographic documentary style.",
                    "setting_location_and_background": "The Mariana Trench, revealing a massive, bioluminescent ancient ruin surrounded by strange, translucent sea creatures.",
                    "lighting_and_atmosphere": "Eerie deep-sea darkness, lit only by the submersible's powerful volumetric headlights and the city's own faint glow.",
                    "composition_and_camera_angle": "A wide shot from just outside the submersible, showing its scale relative to the vast, ancient city.",
                    "color_palette_and_tonality": "Deep blacks and blues, punctuated by the bright white of the headlights and the multicolored bioluminescence.",
                    "level_of_detail_and_texture": "High detail on the submersible's metallic texture and the ancient, crumbling architecture of the ruins.",
                    "desired_emotion_and_mood": "Mysterious, awe-inspiring, and eerie."
                })
            },
            {
                id: "cs08",
                title: "Viking Longship in a Storm",
                prompt: "Subject: A Viking longship with a carved dragon-headed prow. Action: Battling massive, churning waves in a fierce storm. Setting: The North Sea during a tempest. Details: Hardened Vikings with braided beards work the oars, rain lashes down in sheets. Camera: Low-angle shot, making the waves look immense. Lighting: Dramatic, cinematic lighting from flashes of lightning that illuminate the scene. Style: Epic, powerful, painterly realism. Mood: Dramatic, chaotic, determined.",
                jsonPrompt: JSON.stringify({
                    "subject_and_action": "A Viking longship and its crew are battling massive, churning waves in a fierce storm.",
                    "image_type_and_style": "Epic, powerful, painterly realism.",
                    "setting_location_and_background": "The North Sea during a tempest, with lashing rain.",
                    "lighting_and_atmosphere": "Dramatic, chaotic, cinematic lighting from flashes of lightning.",
                    "composition_and_camera_angle": "Low-angle shot from the water's surface to make the waves look immense and threatening.",
                    "color_palette_and_tonality": "Dark, moody blues, greys, and blacks of the storm, with bright flashes of white lightning.",
                    "level_of_detail_and_texture": "Detailed textures of the wet wood, the splashing water, and the strained expressions of the Vikings.",
                    "desired_emotion_and_mood": "Dramatic, chaotic, and determined."
                })
            }
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
                jsonPrompt: JSON.stringify({
                    "subject_and_action": "Two figures in a high-speed parkour chase, leaping between buildings and sliding under obstacles.",
                    "image_type_and_style": "Action-packed, realistic video game aesthetic.",
                    "setting_location_and_background": "Across the rooftops of a dense, modern urban environment.",
                    "lighting_and_atmosphere": "Bright daylight causing lens flares, creating a sense of vertigo and speed.",
                    "composition_and_camera_angle": "Dynamic first-person view (FPV) from the perspective of the person being chased.",
                    "color_palette_and_tonality": "Realistic urban colors, with high contrast between sunlit areas and shadows.",
                    "level_of_detail_and_texture": "High detail with dynamic motion blur to emphasize speed.",
                    "desired_emotion_and_mood": "Dangerous, exhilarating, and urgent."
                })
            },
            {
                id: "ac02",
                title: "Epic Sword Duel",
                prompt: "Subject: Two knights in ornate, battle-scarred full plate armor. Action: A fierce, highly choreographed sword duel. Setting: A wet, muddy castle courtyard at dusk. Details: Sparks fly as their longswords clash, their breath fogs in the cold air. Camera: Dynamic, circling camera with moments of dramatic slow-motion on impacts. Lighting: Low, dramatic lighting from torches on the castle walls. Style: Cinematic, powerful, hyper-realistic. Mood: Intense, brutal, honorable.",
                jsonPrompt: JSON.stringify({
                    "subject_and_action": "Two knights in ornate, battle-scarred full plate armor engage in a fierce, highly choreographed sword duel.",
                    "image_type_and_style": "Cinematic, powerful, hyper-realistic fantasy.",
                    "setting_location_and_background": "A wet, muddy castle courtyard at dusk.",
                    "lighting_and_atmosphere": "Low, dramatic lighting from torches on the castle walls, with visible breath fogging in the cold air.",
                    "composition_and_camera_angle": "Dynamic, circling camera with moments of dramatic slow-motion on impacts.",
                    "color_palette_and_tonality": "Dark, earthy tones with the bright, warm glow of torches and sparks from clashing swords.",
                    "level_of_detail_and_texture": "Hyper-realistic detail on the battle-scarred armor, mud, and sparks.",
                    "desired_emotion_and_mood": "Intense, brutal, and honorable."
                })
            },
            {
                id: "ac03",
                title: "High-Octane Car Chase",
                prompt: "Subject: A classic 1969 black muscle car. Action: Weaving through dense city traffic at high speed, pursued by modern police cars. Setting: A rain-slicked city at night, similar to Tokyo or New York. Details: Reflections of neon signs and flashing police lights on wet asphalt, steam from manholes. Camera: Low-angle tracking shots, close-ups on the driver's determined face and gear shifts. Lighting: Colorful, chaotic lighting from city lights and sirens. Style: High-energy, thrilling, John Wick-style cinematography. Mood: Adrenaline-fueled, slick, dangerous.",
                jsonPrompt: JSON.stringify({
                    "subject_and_action": "A classic 1969 black muscle car weaves through dense city traffic at high speed, pursued by modern police cars.",
                    "image_type_and_style": "High-energy, thrilling, John Wick-style cinematography.",
                    "setting_location_and_background": "A rain-slicked city at night, with neon signs and steam from manholes.",
                    "lighting_and_atmosphere": "Colorful, chaotic lighting from city lights and flashing police sirens, reflecting on wet asphalt.",
                    "composition_and_camera_angle": "Low-angle tracking shots combined with close-ups on the driver's determined face and gear shifts.",
                    "color_palette_and_tonality": "Dark city tones punctuated by vibrant neon colors and red and blue police lights.",
                    "level_of_detail_and_texture": "Detailed reflections on the wet car and road surfaces.",
                    "desired_emotion_and_mood": "Adrenaline-fueled, slick, and dangerous."
                })
            },
            {
                id: "ac04",
                title: "Zombie Horde Attack",
                prompt: "Subject: A lone survivor, resourceful and determined. Action: Desperately fighting off a massive, slow-moving horde of zombies. Setting: A derelict, decaying shopping mall, with broken storefronts and flickering lights. Details: The survivor uses improvised weapons like a fire axe and a baseball bat. Camera: Gritty, handheld camera work to create a sense of panic. Lighting: Flickering, unreliable fluorescent lights casting long, eerie shadows. Style: Survival horror aesthetic, realistic gore, and decay. Mood: Frantic, chaotic, desperate.",
                jsonPrompt: JSON.stringify({
                    "subject_and_action": "A lone, resourceful survivor desperately fights off a massive, slow-moving horde of zombies with improvised weapons.",
                    "image_type_and_style": "Survival horror aesthetic with realistic gore and decay.",
                    "setting_location_and_background": "A derelict, decaying shopping mall with broken storefronts.",
                    "lighting_and_atmosphere": "Flickering, unreliable fluorescent lights casting long, eerie shadows, creating a panicked atmosphere.",
                    "composition_and_camera_angle": "Gritty, handheld camera work to create a sense of panic and immediacy.",
                    "color_palette_and_tonality": "Muted, decaying colors with harsh, inconsistent fluorescent light.",
                    "level_of_detail_and_texture": "High detail on the decaying environment and the gruesome appearance of the zombies.",
                    "desired_emotion_and_mood": "Frantic, chaotic, and desperate."
                })
            },
            {
                id: "ac05",
                title: "Explosive Building Breach",
                prompt: "Subject: An elite SWAT team in full tactical gear. Action: Breaching a concrete wall with an explosive charge. Setting: An industrial warehouse. Details: Debris, dust, and smoke fill the air as the wall explodes inwards. Camera: Extreme slow-motion capturing the explosion's impact. Lighting: Dramatic backlighting from the hole in the wall, silhouetting the team. Style: High-impact action, Michael Bay style, with lens flares and epic scale. Mood: Intense, powerful, shocking.",
                jsonPrompt: JSON.stringify({
                    "subject_and_action": "An elite SWAT team in full tactical gear breaches a concrete wall with an explosive charge.",
                    "image_type_and_style": "High-impact action, Michael Bay style, with lens flares and epic scale.",
                    "setting_location_and_background": "An industrial warehouse interior.",
                    "lighting_and_atmosphere": "Dramatic backlighting from the explosion, silhouetting the team in a cloud of debris, dust, and smoke.",
                    "composition_and_camera_angle": "Extreme slow-motion shot capturing the moment of the explosion's impact.",
                    "color_palette_and_tonality": "Dark industrial tones with a bright, fiery orange from the explosion.",
                    "level_of_detail_and_texture": "High detail on the exploding concrete, dust, and smoke particles.",
                    "desired_emotion_and_mood": "Intense, powerful, and shocking."
                })
            },
            {
                id: "ac06",
                title: "Martial Arts Showdown",
                prompt: "Subject: Two master martial artists, one in white robes, one in black. Action: A highly choreographed fight with fluid grace and deadly precision, using fists and feet. Setting: A dense, green bamboo forest. Details: Leaves gently fall around them as they move. Camera: Wide, sweeping shots mixed with fast-paced close-ups, utilizing wire-fu techniques. Lighting: Soft, diffused sunlight filtering through the bamboo stalks. Style: Stylized, Crouching Tiger, Hidden Dragon aesthetic. Mood: Graceful, disciplined, tense.",
                jsonPrompt: JSON.stringify({
                    "subject_and_action": "Two master martial artists, one in white robes and one in black, engage in a highly choreographed fight with fluid grace.",
                    "image_type_and_style": "Stylized martial arts film aesthetic, inspired by Crouching Tiger, Hidden Dragon.",
                    "setting_location_and_background": "A dense, green bamboo forest with gently falling leaves.",
                    "lighting_and_atmosphere": "Soft, diffused sunlight filtering through the bamboo stalks, creating a serene yet tense atmosphere.",
                    "composition_and_camera_angle": "A mix of wide, sweeping shots and fast-paced close-ups, utilizing wire-fu techniques.",
                    "color_palette_and_tonality": "Vibrant greens of the bamboo forest contrasted with the black and white robes of the fighters.",
                    "level_of_detail_and_texture": "Detail on the texture of the bamboo and the flowing robes.",
                    "desired_emotion_and_mood": "Graceful, disciplined, and tense."
                })
            }
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
                jsonPrompt: JSON.stringify({
                    "subject_and_action": "A brilliant female steampunk inventor with oil-smudged cheeks and wild hair, wearing intricate brass goggles and a tool-filled leather apron.",
                    "image_type_and_style": "Steampunk concept art, detailed illustration.",
                    "setting_location_and_background": "Her cluttered workshop, filled with gears, blueprints, and half-finished clockwork gadgets.",
                    "lighting_and_atmosphere": "Warm, inviting light from a single Edison bulb hanging overhead.",
                    "composition_and_camera_angle": "Detailed character portrait, medium shot.",
                    "color_palette_and_tonality": "Warm brass, brown leather, and muted Victorian colors.",
                    "level_of_detail_and_texture": "Detailed textures of metal, leather, and paper blueprints.",
                    "desired_emotion_and_mood": "Inventive, intelligent, and focused."
                })
            },
            {
                id: "cd02",
                title: "Cybernetic Ronin",
                prompt: "Subject: A lone cybernetic ronin. Attire: A blend of traditional samurai armor and futuristic, neon-lit cybernetic implants. Weapon: Holding a glowing plasma katana. Setting: Poised on the edge of a skyscraper rooftop in a rainy, futuristic Tokyo. Camera: Full-body dynamic pose, low-angle shot to emphasize power. Lighting: Moody, reflective lighting from the neon city below. Style: Detailed anime concept art. Mood: Brooding, powerful, solitary.",
                jsonPrompt: JSON.stringify({
                    "subject_and_action": "A lone cybernetic ronin, blending traditional samurai armor with futuristic implants, holds a glowing plasma katana.",
                    "image_type_and_style": "Detailed anime concept art.",
                    "setting_location_and_background": "Poised on the edge of a skyscraper rooftop in a rainy, futuristic Tokyo.",
                    "lighting_and_atmosphere": "Moody, reflective lighting from the neon city below, with rain creating a glistening effect.",
                    "composition_and_camera_angle": "Full-body dynamic pose, shot from a low angle to emphasize power.",
                    "color_palette_and_tonality": "Dark tones with vibrant neon highlights from the city and the plasma katana.",
                    "level_of_detail_and_texture": "Detailed blend of traditional armor materials and sleek cybernetics.",
                    "desired_emotion_and_mood": "Brooding, powerful, and solitary."
                })
            },
            {
                id: "cd03",
                title: "Forest Spirit Druid",
                prompt: "Subject: A wise, ancient, androgynous druid. Appearance: Antlers woven with glowing vines grow from their head, face is painted with green tribal markings. Attire: Robes made of living leaves and moss, holding a gnarled wooden staff with a crystal on top. Setting: Deep within a mystical, fog-filled forest. Camera: Fantasy portrait, close-up on the face. Color Palette: Earthy tones of green, brown, and amber. Style: High fantasy digital painting. Mood: Serene, powerful, connected to nature.",
                jsonPrompt: JSON.stringify({
                    "subject_and_action": "A wise, ancient, androgynous druid with antlers woven with glowing vines and a staff with a crystal on top.",
                    "image_type_and_style": "High fantasy digital painting.",
                    "setting_location_and_background": "Deep within a mystical, fog-filled forest.",
                    "lighting_and_atmosphere": "Magical light from the glowing vines and crystal, diffused by the fog.",
                    "composition_and_camera_angle": "Fantasy portrait, close-up on the face to show their expression and markings.",
                    "color_palette_and_tonality": "Earthy tones of green, brown, and amber.",
                    "level_of_detail_and_texture": "Detailed textures of leaves, moss, wood, and glowing vines.",
                    "desired_emotion_and_mood": "Serene, powerful, and deeply connected to nature."
                })
            },
            {
                id: "cd04",
                title: "Void-Touched Sorcerer",
                prompt: "Subject: A powerful sorcerer, their body partially corrupted by the void. Appearance: One arm is made of swirling cosmic energy, their eyes glow with an intense purple light. Attire: Dark, ornate robes that seem to be adorned with moving stars and nebulae. Setting: Standing on a floating, obsidian platform in a cosmic rift. Camera: Medium shot, focusing on the character's upper body. Lighting: High-contrast, magical lighting emanating from their hands and eyes. Style: Dark fantasy concept art. Mood: Magical, dangerous, immensely powerful.",
                jsonPrompt: JSON.stringify({
                    "subject_and_action": "A powerful sorcerer, with one arm made of swirling cosmic energy and glowing purple eyes, stands on a floating platform.",
                    "image_type_and_style": "Dark fantasy concept art.",
                    "setting_location_and_background": "A floating, obsidian platform in a cosmic rift, surrounded by swirling nebulae.",
                    "lighting_and_atmosphere": "High-contrast, magical lighting emanating from the sorcerer's corrupted body and eyes.",
                    "composition_and_camera_angle": "Medium shot, focusing on the character's upper body to highlight their corruption and power.",
                    "color_palette_and_tonality": "Deep blacks and purples of the void, with bright points of light like stars.",
                    "level_of_detail_and_texture": "Detailed texture of the ornate robes and the swirling energy of their arm.",
                    "desired_emotion_and_mood": "Magical, dangerous, and immensely powerful."
                })
            },
            {
                id: "cd05",
                title: "Galactic Bounty Hunter",
                prompt: "Subject: A rugged, weathered bounty hunter. Appearance: A cybernetic arm and a heavy blaster rifle, wearing worn Mandalorian-style armor. Setting: Standing in the harsh twin-sun desert of a remote, alien planet like Tatooine. Camera: Full-body shot. Lighting: Bright, harsh daylight from two suns creating distinct shadows. Style: Detailed character design, photorealistic. Mood: Gritty, determined, capable.",
                jsonPrompt: JSON.stringify({
                    "subject_and_action": "A rugged, weathered bounty hunter with a cybernetic arm and a heavy blaster rifle stands ready.",
                    "image_type_and_style": "Detailed character design, photorealistic sci-fi.",
                    "setting_location_and_background": "The harsh twin-sun desert of a remote, alien planet like Tatooine.",
                    "lighting_and_atmosphere": "Bright, harsh daylight from two suns creating two distinct, sharp shadows.",
                    "composition_and_camera_angle": "Full-body shot to showcase the armor and weapon.",
                    "color_palette_and_tonality": "Bleached desert tans and browns, with metallic sheens from the armor.",
                    "level_of_detail_and_texture": "Detailed wear and tear on the Mandalorian-style armor, texture of sand.",
                    "desired_emotion_and_mood": "Gritty, determined, and capable."
                })
            },
            {
                id: "cd06",
                title: "Elven Archer Queen",
                prompt: "Subject: An elegant and powerful Elven queen. Appearance: Long, flowing silver hair and glowing blue runes on her skin. Attire: Regal, flowing white and silver robes, holding a bow made of starlight. Setting: An ethereal, misty forest with ancient trees. Camera: Majestic, full-body portrait. Lighting: Soft, ethereal light that seems to emanate from the queen herself. Style: High fantasy digital art, inspired by Tolkien. Mood: Majestic, serene, powerful.",
                jsonPrompt: JSON.stringify({
                    "subject_and_action": "An elegant and powerful Elven queen with long silver hair and glowing runes holds a bow made of starlight.",
                    "image_type_and_style": "High fantasy digital art, inspired by Tolkien.",
                    "setting_location_and_background": "An ethereal, misty forest with ancient trees.",
                    "lighting_and_atmosphere": "Soft, ethereal light that seems to emanate from the queen herself, creating a magical atmosphere.",
                    "composition_and_camera_angle": "A majestic, full-body portrait.",
                    "color_palette_and_tonality": "White, silver, and soft blues, with the green of the forest.",
                    "level_of_detail_and_texture": "Detailed textures on the flowing robes and the intricate design of the starlight bow.",
                    "desired_emotion_and_mood": "Majestic, serene, and powerful."
                })
            },
            {
                id: "cd07",
                title: "Hardboiled 1940s Detective",
                prompt: "Subject: A classic 1940s private detective. Appearance: Wearing a fedora and a rain-soaked trench coat. Action: Lighting a cigarette, its smoke curling in the air. Setting: His dimly lit, messy office at night. Details: Light from the window blinds creates dramatic horizontal shadows across the room. Camera: Medium shot. Style: Cinematic film noir, high-contrast black and white photography. Mood: Brooding, weary, mysterious.",
                jsonPrompt: JSON.stringify({
                    "subject_and_action": "A classic 1940s private detective in a fedora and rain-soaked trench coat is lighting a cigarette.",
                    "image_type_and_style": "Cinematic film noir, high-contrast black and white photography.",
                    "setting_location_and_background": "A dimly lit, messy office at night.",
                    "lighting_and_atmosphere": "Dramatic high-contrast lighting from window blinds, creating horizontal shadows (Venetian blind lighting).",
                    "composition_and_camera_angle": "Medium shot focusing on the detective.",
                    "color_palette_and_tonality": "High-contrast black and white.",
                    "level_of_detail_and_texture": "Detailed texture of the rain-soaked coat and the curling smoke.",
                    "desired_emotion_and_mood": "Brooding, weary, and mysterious."
                })
            },
            {
                id: "cd08",
                title: "Cosmic Deity",
                prompt: "Subject: A celestial being with a humanoid form made of swirling galaxies and nebulae. Appearance: Stars for eyes, holding a miniature, brightly glowing sun in their palm. Setting: Floating in the vast emptiness of deep space. Camera: Epic wide shot showing the scale of the being against distant star clusters. Lighting: The only light comes from the being itself and the stars. Style: Abstract, cosmic, digital painting. Mood: Divine, awe-inspiring, immensely powerful.",
                jsonPrompt: JSON.stringify({
                    "subject_and_action": "A celestial being with a humanoid form made of galaxies holds a miniature, glowing sun in its palm.",
                    "image_type_and_style": "Abstract, cosmic, digital painting.",
                    "setting_location_and_background": "Floating in the vast emptiness of deep space, with distant star clusters.",
                    "lighting_and_atmosphere": "The only light comes from the deity itself—the stars in its form and the sun in its palm.",
                    "composition_and_camera_angle": "Epic wide shot to show the immense scale of the being.",
                    "color_palette_and_tonality": "Deep blues, purples, and blacks of space, contrasted with the bright, multi-colored light of the galaxies and sun.",
                    "level_of_detail_and_texture": "Intricate, swirling textures of nebulae and galaxies forming the deity's body.",
                    "desired_emotion_and_mood": "Divine, awe-inspiring, and immensely powerful."
                })
            }
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
                jsonPrompt: JSON.stringify({
                    "subject_and_action": "A classic anime hero is screaming as they power up, a fiery golden aura erupting around them, cracking the ground and causing rocks to levitate.",
                    "image_type_and_style": "90s Shonen anime style, cel shading, inspired by Dragon Ball Z.",
                    "setting_location_and_background": "A rocky, desolate landscape suitable for a dramatic battle.",
                    "lighting_and_atmosphere": "Intense, glowing light from the golden aura, with dramatic shadows.",
                    "composition_and_camera_angle": "Dynamic low-angle shot to emphasize the hero's power.",
                    "color_palette_and_tonality": "Vibrant colors, especially the golden aura, with high contrast.",
                    "level_of_detail_and_texture": "Cel-shaded with intense speed lines and energy effects.",
                    "desired_emotion_and_mood": "Intense, explosive, and powerful."
                })
            },
            {
                id: "am02",
                title: "Magical Girl Transformation",
                prompt: "Subject: A cheerful teenage girl. Action: A magical girl transformation sequence. Details: Ribbons of pink and blue light wrap around her as her outfit materializes, background filled with sparkling glitter, stars, and hearts. Camera: Dynamic, spinning camera move. Style: Classic 90s Magical Girl anime aesthetic, inspired by Sailor Moon, vibrant colors, soft focus. Mood: Joyful, cute, magical.",
                jsonPrompt: JSON.stringify({
                    "subject_and_action": "A cheerful teenage girl undergoes a magical girl transformation sequence.",
                    "image_type_and_style": "Classic 90s Magical Girl anime aesthetic, inspired by Sailor Moon, with vibrant colors and soft focus.",
                    "setting_location_and_background": "An abstract background filled with sparkling glitter, stars, and hearts.",
                    "lighting_and_atmosphere": "Bright, magical light from ribbons of pink and blue energy wrapping around her.",
                    "composition_and_camera_angle": "Dynamic, spinning camera move that follows the transformation.",
                    "color_palette_and_tonality": "Pastel pinks, blues, and yellows.",
                    "level_of_detail_and_texture": "Clean lines, cel shading, and sparkling particle effects.",
                    "desired_emotion_and_mood": "Joyful, cute, and magical."
                })
            },
            {
                id: "am03",
                title: "Slice-of-Life Cafe Scene",
                prompt: "Subject: Two high school students in Japanese school uniforms. Action: Chatting and laughing while drinking coffee. Setting: A cozy, sunlit Tokyo cafe after school, with detailed background elements like pastry displays and other patrons. Camera: Eye-level medium shot. Lighting: Soft, warm afternoon sunlight streaming through the cafe window. Style: Modern slice-of-life anime, Makoto Shinkai style, with photorealistic backgrounds and soft character art. Mood: Peaceful, warm, nostalgic.",
                jsonPrompt: JSON.stringify({
                    "subject_and_action": "Two high school students in Japanese school uniforms are chatting and laughing while drinking coffee.",
                    "image_type_and_style": "Modern slice-of-life anime, Makoto Shinkai style, with photorealistic backgrounds and soft character art.",
                    "setting_location_and_background": "A cozy, sunlit Tokyo cafe after school, with detailed pastry displays.",
                    "lighting_and_atmosphere": "Soft, warm afternoon sunlight streaming through the cafe window, creating a peaceful and warm atmosphere.",
                    "composition_and_camera_angle": "Eye-level medium shot, focusing on the two students.",
                    "color_palette_and_tonality": "Warm, bright, and slightly desaturated colors.",
                    "level_of_detail_and_texture": "Highly detailed and photorealistic background, with softer, clean lines for the characters.",
                    "desired_emotion_and_mood": "Peaceful, warm, and nostalgic."
                })
            },
            {
                id: "am04",
                title: "Mecha Hangar Bay",
                prompt: "Subject: A giant, highly detailed combat mecha. Setting: A massive, futuristic hangar bay. Action: Being prepped for launch by a swarm of mechanics in exosuits, with sparks from welding and flashing warning lights. Camera: Epic low-angle wide shot emphasizing the mecha's immense scale. Lighting: Industrial, dramatic lighting with lens flares. Style: Sci-fi mecha anime, inspired by Gundam or Evangelion. Mood: Tense, epic, anticipatory.",
                jsonPrompt: JSON.stringify({
                    "subject_and_action": "A giant combat mecha is being prepped for launch by a swarm of mechanics in exosuits.",
                    "image_type_and_style": "Sci-fi mecha anime, inspired by Gundam or Evangelion.",
                    "setting_location_and_background": "A massive, futuristic hangar bay.",
                    "lighting_and_atmosphere": "Industrial, dramatic lighting with lens flares, flashing warning lights, and sparks from welding.",
                    "composition_and_camera_angle": "Epic low-angle wide shot emphasizing the mecha's immense scale.",
                    "color_palette_and_tonality": "Cool metallic colors, with pops of red and yellow from warning lights.",
                    "level_of_detail_and_texture": "Highly detailed mecha design and complex hangar environment.",
                    "desired_emotion_and_mood": "Tense, epic, and full of anticipation."
                })
            },
            {
                id: "am05",
                title: "Isekai Fantasy World",
                prompt: "Subject: An ordinary person transported to another world. Action: Looking out in awe over a sprawling fantasy city from a high vantage point. Setting: The city features towering white castles, floating crystals, and majestic airships sailing through the sky. Camera: Breathtaking wide landscape shot. Style: Vibrant, high-fantasy isekai anime, detailed world design. Mood: Sense of wonder, adventure, discovery.",
                jsonPrompt: JSON.stringify({
                    "subject_and_action": "An ordinary person, transported to another world, looks out in awe.",
                    "image_type_and_style": "Vibrant, high-fantasy isekai anime with detailed world design.",
                    "setting_location_and_background": "A sprawling fantasy city seen from a high vantage point, featuring towering white castles, floating crystals, and majestic airships.",
                    "lighting_and_atmosphere": "Bright, clear, magical daylight.",
                    "composition_and_camera_angle": "Breathtaking wide landscape shot to capture the scale of the city and the character's awe.",
                    "color_palette_and_tonality": "Vibrant, saturated colors.",
                    "level_of_detail_and_texture": "Highly detailed architecture and landscape.",
                    "desired_emotion_and_mood": "A sense of wonder, adventure, and discovery."
                })
            },
            {
                id: "am06",
                title: "Dark Seinen Anti-Hero",
                prompt: "Subject: A gritty, brooding anti-hero with a scarred face and a large sword on his back. Setting: Standing in a rain-soaked, dimly-lit medieval alleyway at night. Camera: A dramatic close-up, focusing on his intense, shadowed eyes. Style: Dark seinen manga panel style, heavy use of black ink and cross-hatching, inspired by Berserk or Vinland Saga. Mood: Serious, grim, world-weary.",
                jsonPrompt: JSON.stringify({
                    "subject_and_action": "A gritty, brooding anti-hero with a scarred face and a large sword on his back is standing still.",
                    "image_type_and_style": "Dark seinen manga panel style, with heavy use of black ink and cross-hatching, inspired by Berserk.",
                    "setting_location_and_background": "A rain-soaked, dimly-lit medieval alleyway at night.",
                    "lighting_and_atmosphere": "Dim, high-contrast lighting creating deep shadows.",
                    "composition_and_camera_angle": "A dramatic close-up, focusing on his intense, shadowed eyes.",
                    "color_palette_and_tonality": "Mostly black and white, with heavy inks.",
                    "level_of_detail_and_texture": "Rough, gritty textures created by cross-hatching.",
                    "desired_emotion_and_mood": "Serious, grim, and world-weary."
                })
            }
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
                jsonPrompt: JSON.stringify({
                    "subject_and_action": "A woman with pale freckled skin, wearing a sundress and straw hat, is smiling warmly.",
                    "image_type_and_style": "HDR Photography, lifelike, vibrant.",
                    "setting_location_and_background": "A country field.",
                    "lighting_and_atmosphere": "Golden hour daylight, with the warm glow of the setting sun creating a warm atmosphere.",
                    "composition_and_camera_angle": "Portrait focusing on the woman.",
                    "color_palette_and_tonality": "Vibrant colors with warm tones from the sun.",
                    "level_of_detail_and_texture": "High detail to capture freckles on the skin and the texture of the sundress.",
                    "desired_emotion_and_mood": "Warm, joyful, and serene."
                })
            },
            {
                id: "as02",
                title: "Surreal Floating Cat",
                prompt: "Generate a surreal image of a luxuriously fat cat floating in a galaxy, surrounded by giant floating melting clocks and fantastical stars. The atmosphere should be ethereal to evoke a dream-like quality.",
                jsonPrompt: JSON.stringify({
                    "subject_and_action": "A luxuriously fat cat is floating in space.",
                    "image_type_and_style": "Surrealism, digital art.",
                    "setting_location_and_background": "A galaxy, surrounded by giant floating melting clocks and fantastical stars.",
                    "lighting_and_atmosphere": "Ethereal, magical lighting from the stars and galaxy.",
                    "composition_and_camera_angle": "Wide shot to capture the cat and the fantastical elements.",
                    "color_palette_and_tonality": "Deep cosmic blues and purples, with splashes of vibrant color from stars and clocks.",
                    "level_of_detail_and_texture": "Smooth texture for the cat, melting texture for the clocks, and sparkling stars.",
                    "desired_emotion_and_mood": "Dream-like, bizarre, and whimsical."
                })
            },
            {
                id: "as03",
                title: "Pop Art Cityscape",
                prompt: "Generate a pop art image of a woman in a vibrant cityscape, using bold colors and clear lines. Incorporate elements like a Campbell’s chicken noodle soup advertisement to enhance the pop art feel.",
                jsonPrompt: JSON.stringify({
                    "subject_and_action": "A woman posing in a cityscape.",
                    "image_type_and_style": "Pop Art, comic book style with Ben-Day dots.",
                    "setting_location_and_background": "A vibrant cityscape with a large advertisement for Campbell's soup.",
                    "lighting_and_atmosphere": "Bright, flat lighting typical of pop art.",
                    "composition_and_camera_angle": "Medium shot of the woman against the city.",
                    "color_palette_and_tonality": "Bold, primary colors with high contrast.",
                    "level_of_detail_and_texture": "Clear, bold lines with minimal texture, possibly using dot patterns.",
                    "desired_emotion_and_mood": "Energetic, vibrant, and commercial."
                })
            },
            {
                id: "as04",
                title: "Minimalist Tree",
                prompt: "Create a minimalist image of a single tree in a serene landscape, focusing on simplicity and clean lines. Use a monochromatic color palette and a lot of negative space to enhance the minimalist aesthetic.",
                jsonPrompt: JSON.stringify({
                    "subject_and_action": "A single tree standing alone.",
                    "image_type_and_style": "Minimalist, line art.",
                    "setting_location_and_background": "A serene, empty landscape with a lot of negative space.",
                    "lighting_and_atmosphere": "Soft, even lighting that creates subtle shadows.",
                    "composition_and_camera_angle": "Wide shot with the tree off-center to emphasize negative space.",
                    "color_palette_and_tonality": "A monochromatic color palette (e.g., shades of grey or blue).",
                    "level_of_detail_and_texture": "Clean lines and simple forms with no complex textures.",
                    "desired_emotion_and_mood": "Peaceful, serene, and contemplative."
                })
            },
            {
                id: "as05",
                title: "Cyberpunk Hacker",
                prompt: "Create a vivid cyberpunk image featuring a lone hacker in a dimly lit room, illuminated by the glow of multiple holographic screens. Showcasing intricate circuit patterns pulsating with electric blue light across a dark, grimy cityscape. Include diverse scattered elements interacting with the environment, such as flying drones and neon advertisements.",
                jsonPrompt: JSON.stringify({
                    "subject_and_action": "A lone hacker working in a room.",
                    "image_type_and_style": "Cyberpunk, futuristic, high-tech low-life.",
                    "setting_location_and_background": "A dimly lit room overlooking a dark, grimy cityscape with flying drones and neon ads.",
                    "lighting_and_atmosphere": "Dim, atmospheric lighting, illuminated only by the glow of multiple holographic screens and pulsating circuit patterns.",
                    "composition_and_camera_angle": "A shot from behind the hacker, looking out over the cityscape.",
                    "color_palette_and_tonality": "Dark, grimy colors contrasted with vibrant electric blue and other neon hues.",
                    "level_of_detail_and_texture": "Intricate detail on holographic screens, circuit patterns, and the grimy city.",
                    "desired_emotion_and_mood": "Dystopian, focused, and high-tech."
                })
            },
            {
                id: "as06",
                title: "Claymation Dinosaur",
                prompt: "Create a Claymation image of a friendly dinosaur in a prehistoric jungle, focusing on the handcrafted, textured appearance of the clay figure. Use vibrant colors and three-dimensional details to bring the scene to life, with a whimsical and playful quality.",
                jsonPrompt: JSON.stringify({
                    "subject_and_action": "A friendly dinosaur is smiling in a jungle.",
                    "image_type_and_style": "Claymation, stop-motion style.",
                    "setting_location_and_background": "A prehistoric jungle with large, simple plant shapes.",
                    "lighting_and_atmosphere": "Bright, playful lighting to create a friendly atmosphere.",
                    "composition_and_camera_angle": "Eye-level medium shot of the dinosaur.",
                    "color_palette_and_tonality": "Vibrant, cheerful primary colors.",
                    "level_of_detail_and_texture": "Handcrafted, textured appearance with visible fingerprints in the clay.",
                    "desired_emotion_and_mood": "Whimsical, playful, and friendly."
                })
            },
            {
                id: "as07",
                title: "8-Bit Knight vs Dragon",
                prompt: "Create an 8-bit image of a knight battling a dragon in a medieval castle, focusing on pixelated, blocky graphics and a vibrant, limited color palette. The scene should have a nostalgic, retro feel, reminiscent of classic video games.",
                jsonPrompt: JSON.stringify({
                    "subject_and_action": "A knight is battling a dragon.",
                    "image_type_and_style": "8-bit pixel art.",
                    "setting_location_and_background": "A medieval castle.",
                    "lighting_and_atmosphere": "N/A (flat 2D pixel art).",
                    "composition_and_camera_angle": "Side-view, platformer game perspective.",
                    "color_palette_and_tonality": "Vibrant, limited color palette (e.g., NES or C64 palette).",
                    "level_of_detail_and_texture": "Pixelated, blocky graphics with no smooth textures.",
                    "desired_emotion_and_mood": "Nostalgic, retro, and adventurous."
                })
            },
            {
                id: "as08",
                title: "Street Musician",
                prompt: "Create a street photograph of a street musician performing on a busy city sidewalk, focusing on candid moments and natural compositions. Use the warm, golden light of the late afternoon to enhance the mood and atmosphere, capturing the essence of everyday life in an unfiltered and spontaneous manner.",
                jsonPrompt: JSON.stringify({
                    "subject_and_action": "A street musician is performing with their instrument.",
                    "image_type_and_style": "Street Photography, candid, spontaneous.",
                    "setting_location_and_background": "A busy city sidewalk with pedestrians in the background.",
                    "lighting_and_atmosphere": "Warm, golden light of the late afternoon.",
                    "composition_and_camera_angle": "Natural composition, possibly from a slight distance to capture the scene.",
                    "color_palette_and_tonality": "Warm, natural colors.",
                    "level_of_detail_and_texture": "Realistic detail, capturing the texture of the pavement and the musician's clothes.",
                    "desired_emotion_and_mood": "Authentic, emotional, and capturing a moment in time."
                })
            },
            {
                id: "as09",
                title: "Cowboy Candy Product Shot",
                prompt: "Create a high-definition photograph of Cowboy Candy on a rustic wooden table, focusing on the detailed and visually appealing aspects of the product. Use sharp clarity to highlight the texture of the candied jalapeños, the vibrant green and glossy appearance, and the intricate details of the plain mason jar.",
                jsonPrompt: JSON.stringify({
                    "subject_and_action": "A jar of 'Cowboy Candy' (candied jalapeños) is presented.",
                    "image_type_and_style": "High-definition product photography.",
                    "setting_location_and_background": "A rustic wooden table.",
                    "lighting_and_atmosphere": "Clean, bright studio lighting to make the product look appealing.",
                    "composition_and_camera_angle": "A close-up product shot, possibly from a 45-degree angle.",
                    "color_palette_and_tonality": "Vibrant green of the jalapeños against the brown of the rustic wood.",
                    "level_of_detail_and_texture": "Sharp clarity to highlight the glossy texture of the candied jalapeños and details of the mason jar.",
                    "desired_emotion_and_mood": "Appetizing, high-quality, and rustic."
                })
            },
            {
                id: "as10",
                title: "Vibrant 3D Vehicle Render",
                prompt: "A vibrant 3D rendered image of a futuristic sports car, 3D animation style, realistic lighting and shadows to create depth, detailed textures and materials for lifelike surfaces, dynamic camera angles and perspectives, rich and vibrant color palette, emphasis on three-dimensional space and volume.",
                jsonPrompt: JSON.stringify({
                    "subject_and_action": "A futuristic sports car, rendered to look dynamic and sleek.",
                    "image_type_and_style": "Vibrant 3D animation style.",
                    "setting_location_and_background": "A clean studio or abstract background that highlights the vehicle.",
                    "lighting_and_atmosphere": "Realistic lighting and shadows to create depth and highlight the car's form.",
                    "composition_and_camera_angle": "Dynamic camera angles and perspectives.",
                    "color_palette_and_tonality": "A rich, vibrant color palette.",
                    "level_of_detail_and_texture": "Detailed textures and materials for lifelike surfaces.",
                    "desired_emotion_and_mood": "Sleek, futuristic, and dynamic."
                })
            },
            {
                id: "as11",
                title: "Detailed Pencil Sketch Portrait",
                prompt: "Create a pencil sketch of an old man sitting on a park bench, focusing on delicate lines and detailed shading. Emphasize the texture of his wrinkled skin and the fine details of his clothing to enhance the hand-drawn, organic quality.",
                jsonPrompt: JSON.stringify({
                    "subject_and_action": "An old man is sitting on a park bench.",
                    "image_type_and_style": "Pencil sketch with a hand-drawn, organic quality.",
                    "setting_location_and_background": "A park bench, with the background lightly sketched to keep focus on the subject.",
                    "lighting_and_atmosphere": "Natural lighting that creates opportunities for detailed and delicate shading.",
                    "composition_and_camera_angle": "A portrait shot, focusing on the man's expression and posture.",
                    "color_palette_and_tonality": "Monochromatic, using shades of graphite.",
                    "level_of_detail_and_texture": "Highly detailed, emphasizing the texture of wrinkled skin and the fine details of clothing.",
                    "desired_emotion_and_mood": "Contemplative, realistic, and character-focused."
                })
            },
            {
                id: "as12",
                title: "Quaint Watercolor Cottage",
                prompt: "A quaint cottage. Watercolor illustration style. Dreamy, ethereal atmosphere with soft, flowing brushstrokes. Gentle blending of colors creating a fluid, organic feel. Light, translucent layers for a luminous effect. Emphasis on natural textures and delicate details. Use of white space to enhance the airy, whimsical quality.",
                jsonPrompt: JSON.stringify({
                    "subject_and_action": "A quaint cottage in a peaceful setting.",
                    "image_type_and_style": "Watercolor illustration style.",
                    "setting_location_and_background": "A setting that allows for the use of white space to create an airy, whimsical quality, such as a field or garden.",
                    "lighting_and_atmosphere": "Dreamy, ethereal atmosphere with a luminous effect created by light, translucent layers of paint.",
                    "composition_and_camera_angle": "A composition that emphasizes the cottage and uses negative space effectively to feel light.",
                    "color_palette_and_tonality": "Gentle blending of soft colors, creating a fluid, organic feel.",
                    "level_of_detail_and_texture": "Soft, flowing brushstrokes with an emphasis on natural textures and delicate details.",
                    "desired_emotion_and_mood": "Airy, whimsical, and dreamy."
                })
            }
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
                jsonPrompt: JSON.stringify({
                    "subject_and_action": "An expansive landscape of majestic floating islands.",
                    "image_type_and_style": "Fantasy landscape painting, inspired by Studio Ghibli.",
                    "setting_location_and_background": "In the sky at sunrise, with clouds below.",
                    "lighting_and_atmosphere": "Warm sunrise light casting a golden glow on the islands and clouds.",
                    "composition_and_camera_angle": "Epic, panoramic wide shot to capture the vastness.",
                    "color_palette_and_tonality": "Vibrant warm pinks and oranges from the sunrise against green islands and white clouds.",
                    "level_of_detail_and_texture": "Detailed moss-covered vine bridges and cascading waterfalls.",
                    "desired_emotion_and_mood": "Awe-inspiring, peaceful, and adventurous."
                })
            },
            {
                id: "en02",
                title: "Subterranean Crystal Caverns",
                prompt: "Setting: A vast underground cavern. Details: Filled with giant, glowing crystals of all colors—purple, blue, and pink. A clear subterranean river flows through the middle, perfectly reflecting the light from the crystals. Camera: Wide shot from the river's edge, looking up at the immense crystals. Lighting: Magical, volumetric lighting emanating from the crystals themselves. Style: Photorealistic 3D render, Unreal Engine 5, 8K, hyper-detailed. Mood: Magical, awe-inspiring, mysterious.",
                jsonPrompt: JSON.stringify({
                    "subject_and_action": "A vast underground cavern filled with giant glowing crystals and a clear subterranean river.",
                    "image_type_and_style": "Photorealistic 3D render, Unreal Engine 5, 8K, hyper-detailed.",
                    "setting_location_and_background": "A subterranean environment.",
                    "lighting_and_atmosphere": "Magical, volumetric lighting emanating from the multi-colored crystals and reflecting in the river.",
                    "composition_and_camera_angle": "Wide shot from the river's edge, looking up to emphasize the immense scale of the crystals.",
                    "color_palette_and_tonality": "Vibrant purples, blues, and pinks from the glowing crystals.",
                    "level_of_detail_and_texture": "Hyper-detailed crystal formations and water reflections.",
                    "desired_emotion_and_mood": "Magical, awe-inspiring, and mysterious."
                })
            },
            {
                id: "en03",
                title: "Alien Jungle Planet",
                prompt: "Setting: A dense, bioluminescent alien jungle at night on a faraway planet. Details: Strange and exotic plants pulse with otherworldly light, two moons hang in the purple sky, and mysterious creatures can be seen in the shadows. Camera: Ground-level shot, looking deep into the jungle. Color Palette: Vibrant and saturated colors of blue, green, and purple. Style: Sci-fi concept art, immersive environment. Mood: Atmospheric, mysterious, slightly dangerous.",
                jsonPrompt: JSON.stringify({
                    "subject_and_action": "An immersive view of a dense alien jungle.",
                    "image_type_and_style": "Sci-fi concept art, immersive environment.",
                    "setting_location_and_background": "A faraway planet at night, with two moons in a purple sky.",
                    "lighting_and_atmosphere": "Atmospheric, otherworldly light from bioluminescent plants and the two moons.",
                    "composition_and_camera_angle": "Ground-level shot, looking deep into the jungle to create a sense of immersion.",
                    "color_palette_and_tonality": "Vibrant and saturated colors of blue, green, and purple.",
                    "level_of_detail_and_texture": "Detailed strange and exotic plants, with hints of mysterious creatures in the shadows.",
                    "desired_emotion_and_mood": "Atmospheric, mysterious, and slightly dangerous."
                })
            },
            {
                id: "en04",
                title: "Cozy Victorian Study",
                prompt: "Setting: A cozy, cluttered Victorian-era study room. Details: A fire crackles in a marble fireplace, towering bookshelves are packed with old leather-bound books, and a comfortable velvet armchair sits by a large window looking out at a rainy night. Camera: Eye-level shot from the center of the room. Lighting: Warm, inviting, low-key lighting from the fireplace and a single green banker's lamp. Style: Detailed, realistic interior shot. Mood: Atmospheric, comfortable, intellectual, peaceful.",
                jsonPrompt: JSON.stringify({
                    "subject_and_action": "The interior of a cozy, cluttered Victorian-era study room.",
                    "image_type_and_style": "Detailed, realistic interior architectural shot.",
                    "setting_location_and_background": "A room in a Victorian house on a rainy night.",
                    "lighting_and_atmosphere": "Warm, inviting, low-key lighting from a crackling fireplace and a single green banker's lamp.",
                    "composition_and_camera_angle": "Eye-level shot from the center of the room, providing a comfortable perspective.",
                    "color_palette_and_tonality": "Warm wood and leather tones, with the green of the lamp and orange of the fire.",
                    "level_of_detail_and_texture": "Detailed textures of old leather-bound books, velvet armchair, and marble fireplace.",
                    "desired_emotion_and_mood": "Atmospheric, comfortable, intellectual, and peaceful."
                })
            },
            {
                id: "en05",
                title: "Cyberpunk Megatower",
                prompt: "Setting: The exterior of a colossal, pyramid-shaped megatower that pierces the toxic clouds of a cyberpunk city at night. Details: Flying vehicles zip between buildings on designated light-trails, and massive, animated holographic advertisements for fictional products flicker across the building's surface. Camera: Extreme low-angle shot looking up, emphasizing the epic scale. Lighting: Dominated by neon and holographic lights. Style: Cyberpunk aesthetic, inspired by Blade Runner 2049. Mood: Dystopian, overwhelming, awe-inspiring.",
                jsonPrompt: JSON.stringify({
                    "subject_and_action": "The exterior of a colossal, pyramid-shaped megatower with flying vehicles and holographic ads.",
                    "image_type_and_style": "Cyberpunk aesthetic, inspired by Blade Runner 2049.",
                    "setting_location_and_background": "A cyberpunk city at night, with the tower piercing toxic clouds.",
                    "lighting_and_atmosphere": "Overwhelming, dystopian lighting dominated by neon and flickering holographic advertisements.",
                    "composition_and_camera_angle": "Extreme low-angle shot looking up to emphasize the epic, oppressive scale of the tower.",
                    "color_palette_and_tonality": "A dark, polluted background contrasted with vibrant, multi-colored neon and holographic lights.",
                    "level_of_detail_and_texture": "High detail on the complex architecture of the tower and the light trails of flying vehicles.",
                    "desired_emotion_and_mood": "Dystopian, overwhelming, and awe-inspiring."
                })
            },
            {
                id: "en06",
                title: "Serene Japanese Zen Garden",
                prompt: "Setting: A tranquil Japanese zen garden. Details: Perfectly raked white sand with ripple patterns, mossy stones arranged carefully, a still koi pond with orange and white fish, and a single, ancient cherry blossom tree in full bloom. Camera: Static, wide shot, perfectly composed. Lighting: Soft, overcast daylight, creating gentle shadows. Style: Photorealistic, minimalist. Mood: Serene, peaceful, contemplative.",
                jsonPrompt: JSON.stringify({
                    "subject_and_action": "A tranquil and perfectly composed Japanese zen garden.",
                    "image_type_and_style": "Photorealistic, minimalist photography.",
                    "setting_location_and_background": "An outdoor zen garden with a koi pond and cherry blossom tree.",
                    "lighting_and_atmosphere": "Soft, overcast daylight that creates gentle shadows and a peaceful atmosphere.",
                    "composition_and_camera_angle": "A static, wide shot that is perfectly composed to be balanced and harmonious.",
                    "color_palette_and_tonality": "Minimalist palette of white sand, grey stones, green moss, and pink cherry blossoms.",
                    "level_of_detail_and_texture": "High detail on the raked sand patterns, moss texture, and delicate cherry blossoms.",
                    "desired_emotion_and_mood": "Serene, peaceful, and contemplative."
                })
            },
            {
                id: "en07",
                title: "Abandoned Space Station",
                prompt: "Setting: The derelict interior of an abandoned space station's command bridge. Details: In zero-gravity, dust particles and small objects float in beams of light from a cracked viewport showing the Earth below. Control panels are broken and sparking. Camera: A slow, floating point-of-view shot. Lighting: Eerie, natural light from the distant Earth and red emergency alert lights. Style: Sci-fi horror, inspired by Alien (1979), realistic and gritty textures. Mood: Silent, eerie, tense, lonely.",
                jsonPrompt: JSON.stringify({
                    "subject_and_action": "The derelict interior of an abandoned space station's command bridge.",
                    "image_type_and_style": "Sci-fi horror, inspired by Alien (1979), with realistic and gritty textures.",
                    "setting_location_and_background": "In orbit around Earth, with the planet visible through a cracked viewport.",
                    "lighting_and_atmosphere": "Eerie, silent atmosphere with natural light from the distant Earth and flashing red emergency lights.",
                    "composition_and_camera_angle": "A slow, floating point-of-view shot to create a sense of zero-gravity and exploration.",
                    "color_palette_and_tonality": "Dark, metallic greys with the blue and white of Earth and piercing red alert lights.",
                    "level_of_detail_and_texture": "Gritty, realistic textures of broken, sparking control panels and floating dust particles.",
                    "desired_emotion_and_mood": "Silent, eerie, tense, and lonely."
                })
            },
            {
                id: "en08",
                title: "Gothic Cathedral Interior",
                prompt: "Setting: The vast, echoing interior of a massive gothic cathedral. Details: Sunlight streams through huge, intricate stained glass windows, casting shafts of colored light onto the stone pillars and floor. Camera: A very low-angle wide shot from the floor, looking up at the vaulted ceiling to emphasize its height. Lighting: Atmospheric and dramatic. Style: Photorealistic architectural photography. Mood: Awe-inspiring, spiritual, sense of scale and history.",
                jsonPrompt: JSON.stringify({
                    "subject_and_action": "The vast, echoing interior of a massive gothic cathedral.",
                    "image_type_and_style": "Photorealistic architectural photography.",
                    "setting_location_and_background": "Inside a historical gothic cathedral.",
                    "lighting_and_atmosphere": "Atmospheric and dramatic, with sunlight streaming through huge stained glass windows to cast colored light shafts.",
                    "composition_and_camera_angle": "A very low-angle wide shot from the floor, looking up at the vaulted ceiling to emphasize height and scale.",
                    "color_palette_and_tonality": "Cool stone greys, illuminated by vibrant, multi-colored light from the stained glass.",
                    "level_of_detail_and_texture": "High detail on the intricate stone carvings and the stained glass windows.",
                    "desired_emotion_and_mood": "Awe-inspiring, spiritual, with a sense of scale and history."
                })
            }
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
                jsonPrompt: JSON.stringify({
                    "subject_and_action": "An abstract 'V' shape logo.",
                    "image_type_and_style": "Minimalist, geometric, modern vector art.",
                    "setting_location_and_background": "Presented on a clean, solid white background.",
                    "lighting_and_atmosphere": "Flat, even lighting suitable for a vector logo.",
                    "composition_and_camera_angle": "Centered, straightforward presentation of the logo.",
                    "color_palette_and_tonality": "A professional palette of blue and grey.",
                    "level_of_detail_and_texture": "Clean, sharp lines with no texture.",
                    "desired_emotion_and_mood": "Professional and clean, suitable for a tech startup."
                })
            },
            {
                id: "lb02",
                title: "Vintage Brewery Logo",
                prompt: "Image Type: Emblem-style logo design. Subject: A hop cone and a mountain range enclosed within a circle. Text: 'Mountain Ale' in a vintage, serif typography. Style: Retro, hand-drawn style with a distressed, worn texture. Color Palette: Black and cream. Mood: Rustic, authentic, for a craft brewery.",
                jsonPrompt: JSON.stringify({
                    "subject_and_action": "An emblem-style logo featuring a hop cone and a mountain range, with the text 'Mountain Ale'.",
                    "image_type_and_style": "Retro, hand-drawn style with a distressed texture.",
                    "setting_location_and_background": "The elements are enclosed within a circle on a cream background.",
                    "lighting_and_atmosphere": "N/A (flat logo design).",
                    "composition_and_camera_angle": "Centered emblem.",
                    "color_palette_and_tonality": "Black and cream.",
                    "level_of_detail_and_texture": "Hand-drawn look with a distressed, worn texture.",
                    "desired_emotion_and_mood": "Rustic and authentic, for a craft brewery."
                })
            },
            {
                id: "lb03",
                title: "Modern Tech Startup Logo",
                prompt: "Image Type: Vector logo design. Subject: An abstract, flowing, ribbon-like shape. Color Palette: A smooth gradient from vibrant blue to deep purple. Text: 'Nexus' in a clean, professional sans-serif font. Style: Sleek, futuristic, modern. Mood: Innovative, professional.",
                jsonPrompt: JSON.stringify({
                    "subject_and_action": "An abstract, flowing, ribbon-like logo shape with the text 'Nexus'.",
                    "image_type_and_style": "Sleek, futuristic, modern vector design.",
                    "setting_location_and_background": "Presented on a neutral background.",
                    "lighting_and_atmosphere": "N/A (flat logo design).",
                    "composition_and_camera_angle": "Clean, centered composition.",
                    "color_palette_and_tonality": "A smooth gradient from vibrant blue to deep purple.",
                    "level_of_detail_and_texture": "Clean vectors, no texture.",
                    "desired_emotion_and_mood": "Innovative and professional."
                })
            },
            {
                id: "lb04",
                title: "Luxury Fashion Monogram",
                prompt: "Image Type: Logo design. Subject: An elegant, intertwined monogram of the letters 'L' and 'V'. Style: High-end, sophisticated, using a thin, classy serif font. Texture: Realistic gold foil texture. Setting: Presented on a black marble background. Mood: Luxurious, exclusive, for a fashion brand.",
                jsonPrompt: JSON.stringify({
                    "subject_and_action": "An elegant, intertwined monogram of the letters 'L' and 'V'.",
                    "image_type_and_style": "High-end, sophisticated logo design.",
                    "setting_location_and_background": "Presented on a black marble background.",
                    "lighting_and_atmosphere": "Subtle lighting to highlight the gold foil texture and reflections.",
                    "composition_and_camera_angle": "Centered monogram.",
                    "color_palette_and_tonality": "Gold and black.",
                    "level_of_detail_and_texture": "Realistic gold foil texture on the monogram and marble texture on the background.",
                    "desired_emotion_and_mood": "Luxurious and exclusive."
                })
            },
            {
                id: "lb05",
                title: "Organic Cafe Wordmark",
                prompt: "Image Type: Wordmark logo design. Subject: The words 'The Sprout'. Style: Friendly, organic, hand-written script where the letters have leafy flourishes. Color Palette: Earthy green and brown. Mood: Approachable, rustic, natural, for an organic cafe.",
                jsonPrompt: JSON.stringify({
                    "subject_and_action": "A wordmark logo for 'The Sprout'.",
                    "image_type_and_style": "Friendly, organic, hand-written script.",
                    "setting_location_and_background": "On a plain background.",
                    "lighting_and_atmosphere": "N/A (flat logo design).",
                    "composition_and_camera_angle": "Centered wordmark.",
                    "color_palette_and_tonality": "Earthy green and brown.",
                    "level_of_detail_and_texture": "The letters have leafy flourishes, implying a hand-drawn texture.",
                    "desired_emotion_and_mood": "Approachable, rustic, and natural."
                })
            },
            {
                id: "lb06",
                title: "Mascot Logo for Gaming Team",
                prompt: "Image Type: Mascot logo illustration. Subject: A fierce, stylized tiger head, facing forward. Style: Modern esports style with sharp, aggressive angles and bold outlines. Color Palette: Vibrant orange, black, and white. Mood: Aggressive, competitive, energetic, for a gaming team.",
                jsonPrompt: JSON.stringify({
                    "subject_and_action": "A fierce, stylized tiger head mascot.",
                    "image_type_and_style": "Modern esports mascot logo illustration.",
                    "setting_location_and_background": "Transparent or solid background.",
                    "lighting_and_atmosphere": "N/A (vector illustration).",
                    "composition_and_camera_angle": "Forward-facing, symmetrical, and aggressive pose.",
                    "color_palette_and_tonality": "Vibrant orange, black, and white.",
                    "level_of_detail_and_texture": "Sharp, aggressive angles and bold outlines.",
                    "desired_emotion_and_mood": "Aggressive, competitive, and energetic."
                })
            },
            {
                id: "lb07",
                title: "Negative Space Animal Logo",
                prompt: "Image Type: Clever logo design. Subject: A green tree shape, where the negative space within the trunk and branches clearly forms the silhouette of a squirrel. Text: 'Forest Financial' below the icon. Style: Smart, corporate, minimalist. Mood: Intelligent, trustworthy, natural.",
                jsonPrompt: JSON.stringify({
                    "subject_and_action": "A logo of a green tree, with a squirrel formed in the negative space. Includes text 'Forest Financial'.",
                    "image_type_and_style": "Clever, minimalist, corporate logo design.",
                    "setting_location_and_background": "Plain background.",
                    "lighting_and_atmosphere": "N/A (flat logo design).",
                    "composition_and_camera_angle": "Centered logo with text below.",
                    "color_palette_and_tonality": "Green and white (from negative space).",
                    "level_of_detail_and_texture": "Clean vector shapes.",
                    "desired_emotion_and_mood": "Intelligent, trustworthy, and natural."
                })
            },
            {
                id: "lb08",
                title: "3D Gradient Logo",
                prompt: "Image Type: 3D rendered logo icon. Subject: A perfect, glossy sphere. Color Palette: A vibrant, smooth gradient of multiple colors (e.g., cyan, magenta, yellow) wraps around the sphere. Lighting: Realistic lighting and shadows to give it a 3D feel. Style: Modern, digital, for a creative agency. Mood: Dynamic, creative, versatile.",
                jsonPrompt: JSON.stringify({
                    "subject_and_action": "A perfect, glossy sphere used as a logo icon.",
                    "image_type_and_style": "Modern, digital, 3D rendered icon.",
                    "setting_location_and_background": "Simple background to emphasize the 3D object.",
                    "lighting_and_atmosphere": "Realistic lighting and shadows to give it a convincing 3D feel.",
                    "composition_and_camera_angle": "Slightly off-center to showcase lighting and glossiness.",
                    "color_palette_and_tonality": "A vibrant, smooth gradient of cyan, magenta, and yellow.",
                    "level_of_detail_and_texture": "Glossy, reflective surface texture.",
                    "desired_emotion_and_mood": "Dynamic, creative, and versatile."
                })
            },
            {
                id: "lb09",
                title: "Handwritten Signature Logo",
                prompt: "Image Type: Signature logo design. Subject: A personal, handwritten signature that looks authentic and elegant. Style: Thin, flowing, calligraphic lines, resembling an ink pen. Color Palette: Black ink on a clean white background. Mood: Personal, artistic, bespoke, for a photographer or artist.",
                jsonPrompt: JSON.stringify({
                    "subject_and_action": "A personal, handwritten signature logo.",
                    "image_type_and_style": "Signature logo design with thin, flowing, calligraphic lines.",
                    "setting_location_and_background": "Clean white background.",
                    "lighting_and_atmosphere": "N/A (flat logo design).",
                    "composition_and_camera_angle": "Centered signature.",
                    "color_palette_and_tonality": "Black ink on white.",
                    "level_of_detail_and_texture": "Resembles authentic ink pen on paper.",
                    "desired_emotion_and_mood": "Personal, artistic, and bespoke."
                })
            },
            {
                id: "lb10",
                title: "Abstract Cube Logo",
                prompt: "Image Type: Geometric logo design. Subject: An impossible cube or Penrose triangle shape, using clean lines and isometric perspective. Style: Minimalist, intelligent, abstract geometry. Color Palette: Blue and white. Mood: Complex, intelligent, innovative, for a company specializing in complex solutions.",
                jsonPrompt: JSON.stringify({
                    "subject_and_action": "An impossible cube (Penrose triangle) shape logo.",
                    "image_type_and_style": "Minimalist, intelligent, abstract geometric logo design.",
                    "setting_location_and_background": "Plain background.",
                    "lighting_and_atmosphere": "N/A (flat logo design).",
                    "composition_and_camera_angle": "Isometric perspective.",
                    "color_palette_and_tonality": "Blue and white.",
                    "level_of_detail_and_texture": "Clean lines, no texture.",
                    "desired_emotion_and_mood": "Complex, intelligent, and innovative."
                })
            }
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
                jsonPrompt: JSON.stringify({
                    "subject_and_action": "Swirling, iridescent liquids blending together.",
                    "image_type_and_style": "Abstract macro photography, resembling liquid marble or oil on water.",
                    "setting_location_and_background": "N/A (abstract).",
                    "lighting_and_atmosphere": "Lighting that highlights the iridescent and shimmering metallic qualities.",
                    "composition_and_camera_angle": "Macro shot focusing on the fluid dynamics.",
                    "color_palette_and_tonality": "Rich black, gold, and teal.",
                    "level_of_detail_and_texture": "High detail on the intricate fluid dynamics and shimmering textures.",
                    "desired_emotion_and_mood": "Elegant, luxurious, and mesmerizing."
                })
            },
            {
                id: "aa02",
                title: "Geometric Explosion",
                prompt: "Image Type: Abstract 3D render. Subject: An explosion of geometric shapes—cubes, spheres, and pyramids—radiating from a central point. Setting: A dark, empty background to emphasize the shapes. Color Palette: Vibrant, rainbow colors. Style: Dynamic, high-energy, chaotic yet ordered composition. Mood: Energetic, creative, explosive.",
                jsonPrompt: JSON.stringify({
                    "subject_and_action": "An explosion of geometric shapes (cubes, spheres, pyramids) radiating from a central point.",
                    "image_type_and_style": "Abstract 3D render.",
                    "setting_location_and_background": "A dark, empty background to emphasize the shapes.",
                    "lighting_and_atmosphere": "Internal lighting that makes the shapes glow.",
                    "composition_and_camera_angle": "Dynamic, high-energy, chaotic yet ordered composition.",
                    "color_palette_and_tonality": "Vibrant, rainbow colors.",
                    "level_of_detail_and_texture": "Clean, sharp geometric shapes with smooth surfaces.",
                    "desired_emotion_and_mood": "Energetic, creative, and explosive."
                })
            },
            {
                id: "aa03",
                title: "Dream Weaver",
                prompt: "Image Type: Abstract digital art. Subject: Ethereal and wispy strands of light, like celestial silk or smoke. Action: The strands weave together in intricate, flowing, organic patterns. Lighting: Soft, glowing light. Color Palette: Gentle pastel colors. Effects: Soft focus and beautiful bokeh in the background. Mood: Dreamy, gentle, serene.",
                jsonPrompt: JSON.stringify({
                    "subject_and_action": "Ethereal and wispy strands of light weave together in intricate, flowing, organic patterns.",
                    "image_type_and_style": "Abstract digital art.",
                    "setting_location_and_background": "An abstract background with beautiful bokeh.",
                    "lighting_and_atmosphere": "Soft, glowing light that gives the strands a celestial silk or smoke-like quality.",
                    "composition_and_camera_angle": "Flowing, organic composition.",
                    "color_palette_and_tonality": "Gentle pastel colors.",
                    "level_of_detail_and_texture": "Wispy, ethereal textures with a soft focus.",
                    "desired_emotion_and_mood": "Dreamy, gentle, and serene."
                })
            },
            {
                id: "aa04",
                title: "Shattered Reality",
                prompt: "Image Type: Surreal, abstract art. Subject: A landscape (e.g., a forest or city) that appears to be made of shattered, fracturing glass. Details: Each shard reflects a different, distorted version of the reality behind it. Style: High-contrast, photorealistic rendering. Color Palette: Mostly black and white, with a single, dramatic splash of red on one shard. Mood: Thought-provoking, surreal, fragmented.",
                jsonPrompt: JSON.stringify({
                    "subject_and_action": "A landscape that appears to be made of shattered, fracturing glass.",
                    "image_type_and_style": "Surreal, abstract art with high-contrast, photorealistic rendering.",
                    "setting_location_and_background": "A forest or city, visible through the shattered glass.",
                    "lighting_and_atmosphere": "High-contrast lighting that emphasizes the sharp edges of the glass shards.",
                    "composition_and_camera_angle": "A fragmented composition where each shard reflects a different, distorted version of reality.",
                    "color_palette_and_tonality": "Mostly black and white, with a single, dramatic splash of red on one shard.",
                    "level_of_detail_and_texture": "Photorealistic glass texture with sharp fractures and distorted reflections.",
                    "desired_emotion_and_mood": "Thought-provoking, surreal, and fragmented."
                })
            },
            {
                id: "aa05",
                title: "Chromatic Aberration Glitch",
                prompt: "Image Type: Abstract glitch art. Subject: An extreme close-up of a digital screen. Style: The image is heavily distorted with intense chromatic aberration, pixel sorting, and datamoshing effects. Color Palette: Saturated, vibrant RGB color shifts. Detail: Visually complex, chaotic, and noisy texture. Mood: Tech-focused, chaotic, modern, digital.",
                jsonPrompt: JSON.stringify({
                    "subject_and_action": "An extreme close-up of a digital screen, heavily distorted.",
                    "image_type_and_style": "Abstract glitch art with intense chromatic aberration, pixel sorting, and datamoshing effects.",
                    "setting_location_and_background": "N/A (abstract).",
                    "lighting_and_atmosphere": "Digital light from the screen itself, heavily glitched.",
                    "composition_and_camera_angle": "Extreme close-up, chaotic composition.",
                    "color_palette_and_tonality": "Saturated, vibrant RGB color shifts.",
                    "level_of_detail_and_texture": "Visually complex, chaotic, and noisy digital texture.",
                    "desired_emotion_and_mood": "Tech-focused, chaotic, modern, and digital."
                })
            },
            {
                id: "aa06",
                title: "Ink Wash Painting in Motion",
                prompt: "Image Type: High-speed photography, abstract. Subject: Black sumi-e ink. Action: The ink spreads through clear water in ultra slow motion, forming delicate, organic shapes that resemble smoke, mountains, or dragons. Style: Minimalist, inspired by Japanese ink wash painting. Setting: Clean white background. Mood: Zen, contemplative, elegant, fluid.",
                jsonPrompt: JSON.stringify({
                    "subject_and_action": "Black sumi-e ink spreads through clear water in ultra slow motion, forming delicate, organic shapes.",
                    "image_type_and_style": "Abstract high-speed photography, inspired by minimalist Japanese ink wash painting.",
                    "setting_location_and_background": "A clean, white background.",
                    "lighting_and_atmosphere": "Clean, bright lighting to silhouette the ink.",
                    "composition_and_camera_angle": "Macro shot capturing the fluid motion of the ink.",
                    "color_palette_and_tonality": "Monochromatic black and white.",
                    "level_of_detail_and_texture": "Delicate, smoky, fluid textures of ink in water.",
                    "desired_emotion_and_mood": "Zen, contemplative, elegant, and fluid."
                })
            },
            {
                id: "aa07",
                title: "Crystalline Growth Structure",
                prompt: "Image Type: Abstract macro time-lapse. Subject: Intricate, fractal-like crystal formations. Action: The crystals are growing and branching out from a central point, filling the frame. Lighting: The crystals glow with a soft, internal light. Detail: Extremely detailed macro shot, showing the sharp geometric patterns of the crystals. Mood: Mesmerizing, complex, beautiful, organic growth.",
                jsonPrompt: JSON.stringify({
                    "subject_and_action": "Intricate, fractal-like crystal formations are growing and branching out from a central point.",
                    "image_type_and_style": "Abstract macro time-lapse.",
                    "setting_location_and_background": "N/A (abstract).",
                    "lighting_and_atmosphere": "The crystals glow with a soft, internal light.",
                    "composition_and_camera_angle": "Extremely detailed macro shot that fills the frame with the growing structure.",
                    "color_palette_and_tonality": "A palette determined by the color of the glowing crystals.",
                    "level_of_detail_and_texture": "Extremely detailed, sharp geometric patterns of the crystal structure.",
                    "desired_emotion_and_mood": "Mesmerizing, complex, beautiful, depicting organic growth."
                })
            },
            {
                id: "aa08",
                title: "Neural Network Visualization",
                prompt: "Image Type: Abstract 3D data visualization. Subject: A visualization of a firing artificial neural network. Details: A vast, intricate web of glowing nodes connected by pulsing synapses of light. The connections fire in complex patterns. Setting: A dark, deep space background. Style: Beautiful, complex, and technological. Mood: Intelligent, futuristic, interconnected.",
                jsonPrompt: JSON.stringify({
                    "subject_and_action": "A visualization of a firing artificial neural network, a vast web of glowing nodes and pulsing synapses.",
                    "image_type_and_style": "Abstract 3D data visualization.",
                    "setting_location_and_background": "A dark, deep space background.",
                    "lighting_and_atmosphere": "Light comes from the glowing nodes and pulsing connections themselves.",
                    "composition_and_camera_angle": "A wide shot showing the vast, intricate web.",
                    "color_palette_and_tonality": "Bright, electric colors against a dark background.",
                    "level_of_detail_and_texture": "Complex, glowing, technological web of light.",
                    "desired_emotion_and_mood": "Intelligent, futuristic, and interconnected."
                })
            }
        ]
    }
];
