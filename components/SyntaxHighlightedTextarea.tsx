import React, { useMemo } from 'react';
import { refinementOptions } from '../data/refinementOptions.ts';

// Combine keywords from various sources for comprehensive highlighting
const qualityKeywords = ['hyperrealistic', 'detailed', 'intricate', '8k', '4k', 'ultra-hd', 'sharp focus', 'photorealistic'];
const colorKeywords = ['red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'black', 'white', 'gray', 'brown', 'cyan', 'magenta', 'gold', 'silver', 'bronze', 'vibrant', 'monochromatic', 'pastel'];

const KEYWORD_CATEGORIES = {
  style: { 
    keywords: [...new Set([...refinementOptions.style, ...qualityKeywords])], 
    className: 'text-indigo-400 font-bold' 
  },
  camera: { 
    keywords: refinementOptions.camera, 
    className: 'text-sky-400 font-bold' 
  },
  lighting: { 
    keywords: refinementOptions.lighting, 
    className: 'text-amber-400 font-bold' 
  },
  tone: { 
    keywords: refinementOptions.tone, 
    className: 'text-emerald-400 font-bold' 
  },
  color: { 
    keywords: colorKeywords, 
    className: 'text-rose-400 font-bold' 
  },
};

// Function to escape special regex characters.
const escapeRegExp = (string: string) => {
  // $& means the whole matched string
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const allKeywords = Object.values(KEYWORD_CATEGORIES).flatMap(cat => cat.keywords);
// Sort by length (desc) to ensure longer phrases (e.g., "Close-up Shot") are matched before shorter substrings (e.g., "Shot").
// Also, filter out any potentially undefined or empty keywords to prevent errors.
const sortedKeywords = [...new Set(allKeywords)]
  .filter((k): k is string => typeof k === 'string' && k.length > 0)
  .sort((a, b) => b.length - a.length);
  
// Create a regex with a capturing group. This allows `split` to preserve the delimiters (our keywords).
// Keywords with special regex characters are now properly escaped.
const highlightRegex = new RegExp(`(\\b(?:${sortedKeywords.map(escapeRegExp).join('|')})\\b)`, 'gi');

const getKeywordClass = (keyword: string): string => {
    // Add a guard to prevent calling methods on null or undefined.
    if (typeof keyword !== 'string') {
        return '';
    }
    const lowerKeyword = keyword.toLowerCase().trim();
    for (const category of Object.values(KEYWORD_CATEGORIES)) {
        // Also check that `k` is a string before calling toLowerCase on it.
        if (category.keywords.some(k => typeof k === 'string' && k.toLowerCase() === lowerKeyword)) {
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

const highlightJson = (jsonString: string): string => {
    try {
        // This ensures the JSON is valid and formatted before highlighting.
        const formattedJson = JSON.stringify(JSON.parse(jsonString), null, 2);

        // Basic HTML escaping
        const escapedJson = formattedJson.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

        // Use a single regex pass to tokenize and wrap JSON elements.
        return escapedJson.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, (match) => {
            let cls = 'text-sky-400'; // Default to number
            if (/^"/.test(match)) {
                if (/:$/.test(match)) {
                    // It's a key
                    cls = 'text-indigo-400 font-bold';
                    // Return the styled key without the colon, then add the colon back.
                    return `<span class="${cls}">${match.slice(0, -1)}</span>:`;
                } else {
                    // It's a string value
                    cls = 'text-emerald-400';
                }
            } else if (/true|false/.test(match)) {
                // It's a boolean
                cls = 'text-amber-400 font-bold';
            } else if (/null/.test(match)) {
                // It's null
                cls = 'text-slate-500 font-bold';
            }
            return `<span class="${cls}">${match}</span>`;
        });
    } catch (e) {
        // If JSON is invalid, return the plain text, escaped.
        return jsonString.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
};


interface SyntaxHighlightedTextareaProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  className?: string;
  placeholder?: string;
  mode?: 'text' | 'json';
  readOnly?: boolean;
}

const SyntaxHighlightedTextarea: React.FC<SyntaxHighlightedTextareaProps> = ({ 
  value, 
  onChange, 
  className, 
  placeholder,
  mode = 'text',
  readOnly = false,
}) => {
  const highlightedContent = useMemo(() => {
    if (mode === 'json') {
      return highlightJson(value);
    }
    return highlightText(value);
  }, [value, mode]);

  const sharedClasses = "w-full prompt-textarea p-6 rounded-3xl border focus:outline-none font-mono whitespace-pre-wrap break-words text-sm leading-relaxed transition-all duration-300";
  
  return (
    <div className={`relative grid ${className || ''}`}>
      {/* Backdrop for highlighted text */}
      {mode === 'json' ? (
         <div
            className={`${sharedClasses} col-start-1 row-start-1 bg-white/5 border-white/5 text-slate-300 pointer-events-none`}
            aria-hidden="true"
            dangerouslySetInnerHTML={{ __html: highlightedContent as string }}
         />
      ) : (
        <div
            className={`${sharedClasses} col-start-1 row-start-1 bg-white/5 border-white/5 text-slate-300 pointer-events-none`}
            aria-hidden="true"
        >
            {highlightedContent}
            {/* Add a line break if the text ends with a newline to maintain height */}
            {value.slice(-1) === '\n' ? <br /> : null}
        </div>
      )}

      {/* The actual, invisible textarea that handles user input */}
      <textarea
        rows={8}
        value={value}
        onChange={onChange}
        className={`${sharedClasses} col-start-1 row-start-1 bg-transparent text-transparent caret-white focus:ring-2 focus:ring-white/20 focus:border-white/10`}
        placeholder={placeholder}
        spellCheck="false"
        autoCapitalize="none"
        autoCorrect="off"
        readOnly={readOnly}
      />
    </div>
  );
};

export default SyntaxHighlightedTextarea;