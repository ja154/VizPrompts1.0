
import React, { useMemo } from 'react';
import { refinementOptions } from '../data/refinementOptions.ts';

// Combine keywords from various sources for comprehensive highlighting
const qualityKeywords = ['hyperrealistic', 'detailed', 'intricate', '8k', '4k', 'ultra-hd', 'sharp focus', 'photorealistic'];
const colorKeywords = ['red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'black', 'white', 'gray', 'brown', 'cyan', 'magenta', 'gold', 'silver', 'bronze', 'vibrant', 'monochromatic', 'pastel'];

const KEYWORD_CATEGORIES = {
  style: { 
    keywords: [...new Set([...refinementOptions.style, ...qualityKeywords])], 
    className: 'text-purple-500 dark:text-purple-400 font-semibold' 
  },
  camera: { 
    keywords: refinementOptions.camera, 
    className: 'text-blue-500 dark:text-blue-400 font-semibold' 
  },
  lighting: { 
    keywords: refinementOptions.lighting, 
    className: 'text-orange-500 dark:text-orange-400 font-semibold' 
  },
  tone: { 
    keywords: refinementOptions.tone, 
    className: 'text-emerald-600 dark:text-emerald-400 font-semibold' 
  },
  color: { 
    keywords: colorKeywords, 
    className: 'text-rose-600 dark:text-rose-400 font-semibold' 
  },
};

const allKeywords = Object.values(KEYWORD_CATEGORIES).flatMap(cat => cat.keywords);
// Sort by length (desc) to ensure longer phrases (e.g., "Close-up Shot") are matched before shorter substrings (e.g., "Shot").
const sortedKeywords = [...new Set(allKeywords)].sort((a, b) => b.length - a.length);
// Create a regex with a capturing group. This allows `split` to preserve the delimiters (our keywords).
const highlightRegex = new RegExp(`(\\b(?:${sortedKeywords.join('|')})\\b)`, 'gi');

const getKeywordClass = (keyword: string): string => {
    const lowerKeyword = keyword.toLowerCase().trim();
    for (const category of Object.values(KEYWORD_CATEGORIES)) {
        if (category.keywords.some(k => k.toLowerCase() === lowerKeyword)) {
            return category.className;
        }
    }
    return '';
};

/**
 * Parses a text string and wraps recognized keywords in styled spans.
 * @param text The input string from the textarea.
 * @returns A React Node containing the text with highlighted keywords.
 */
const highlightText = (text: string): React.ReactNode => {
    if (!text) return <>{text}</>;

    const parts = text.split(highlightRegex);
    
    return parts.map((part, index) => {
        // Matched keywords will be at odd indices due to the capturing group in the regex.
        if (index % 2 === 1) {
            return <span key={index} className={getKeywordClass(part)}>{part}</span>;
        }
        // Non-keyword parts are at even indices.
        return part;
    });
};

interface SyntaxHighlightedTextareaProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  className?: string;
  placeholder?: string;
}

const SyntaxHighlightedTextarea: React.FC<SyntaxHighlightedTextareaProps> = ({ value, onChange, className, placeholder }) => {
  const highlightedContent = useMemo(() => highlightText(value), [value]);

  const sharedClasses = "w-full prompt-textarea p-4 rounded-lg border focus:outline-none font-mono whitespace-pre-wrap break-words text-sm leading-relaxed";
  
  return (
    <div className={`relative grid ${className || ''}`}>
      {/* Backdrop for highlighted text */}
      <div
        className={`${sharedClasses} col-start-1 row-start-1 bg-bg-uploader-light dark:bg-bg-uploader-dark border-border-primary-light dark:border-border-primary-dark text-text-primary-light dark:text-text-primary-dark pointer-events-none`}
        aria-hidden="true"
      >
        {highlightedContent}
        {/* Add a line break if the text ends with a newline to maintain height */}
        {value.slice(-1) === '\n' ? <br /> : null}
      </div>
      {/* The actual, invisible textarea that handles user input */}
      <textarea
        value={value}
        onChange={onChange}
        className={`${sharedClasses} col-start-1 row-start-1 bg-transparent text-transparent caret-text-primary-light dark:caret-text-primary-dark focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
        placeholder={placeholder}
        spellCheck="false"
        autoCapitalize="none"
        autoCorrect="off"
      />
    </div>
  );
};

export default SyntaxHighlightedTextarea;
