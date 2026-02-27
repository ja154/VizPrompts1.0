import React from 'react';
import { motion } from 'motion/react';

const PatternBackground: React.FC = () => {
    return (
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-[#5b1e6e]">
            {/* Base Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#d1227a] via-[#7a288a] to-[#4a154b] opacity-90"></div>
            
            {/* Animated Blobs to mimic the 3D fluid shapes */}
            <motion.div 
                animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 10, -10, 0],
                    x: [0, 30, -30, 0],
                    y: [0, -40, 20, 0]
                }}
                transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] rounded-full bg-gradient-to-br from-[#e82877] to-[#9b2c98] blur-[80px] opacity-70 mix-blend-screen"
            />
            
            <motion.div 
                animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, -15, 10, 0],
                    x: [0, -50, 40, 0],
                    y: [0, 50, -30, 0]
                }}
                transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                className="absolute top-[30%] -right-[20%] w-[80vw] h-[80vw] rounded-full bg-gradient-to-tl from-[#d1227a] to-[#5b1e6e] blur-[100px] opacity-80 mix-blend-multiply"
            />

            <motion.div 
                animate={{ 
                    scale: [1, 1.15, 1],
                    x: [0, 40, -20, 0],
                    y: [0, -30, 40, 0]
                }}
                transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 5 }}
                className="absolute -bottom-[30%] left-[10%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-tr from-[#7a288a] to-[#e82877] blur-[90px] opacity-60 mix-blend-overlay"
            />
            
            {/* Subtle noise overlay for texture */}
            <div className="absolute inset-0 opacity-[0.04] mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>
        </div>
    );
};

export default PatternBackground;
