import React from 'react';
import { AnimeIcon, PaintBrushIcon, FilmIcon, LogoIcon, MagicWandIcon } from '../components/icons.tsx';

export interface RemixStyle {
  name: string;
  icon: React.FC<{ className?: string }>;
};

export const remixStyles: RemixStyle[] = [
  {
    name: "Anime",
    icon: AnimeIcon,
  },
  {
    name: "Claymation",
    icon: PaintBrushIcon,
  },
  {
    name: "Classic Film Noir",
    icon: FilmIcon,
  },
  {
    name: "8-Bit Pixel Art",
    icon: LogoIcon,
  },
  {
    name: "Watercolor",
    icon: PaintBrushIcon,
  },
  {
    name: "Cyberpunk",
    icon: MagicWandIcon,
  },
];