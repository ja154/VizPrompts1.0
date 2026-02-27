import React, { useState } from 'react';
import { Plus, Minus, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const faqData = [
  {
    question: "How does the AI analysis work?",
    answer: "Our app uses Google's advanced Gemini AI model. When you upload a video, we extract several key frames. These frames, along with a specialized system prompt, are sent to the AI. The AI then 'looks' at these images and generates a detailed, structured description based on what it sees, covering subjects, actions, style, and lighting."
  },
  {
    question: "What kind of videos or images produce the best prompts?",
    answer: "Clear, high-quality media works best. For videos, choose clips with distinct actions and clear subjects. For images, ensure the composition and focus are well-defined. The AI analyzes what it can see, so better input leads to more detailed and accurate output."
  },
  {
    question: "How can I get more detailed prompts?",
    answer: "There are two main ways: 1) Upload higher quality media with more distinct details for the AI to analyze. 2) After an initial prompt is generated, use the 'Add More Detail' button in the 'Refine Prompt' section. This tells the AI to re-evaluate its analysis and expand on every aspect of the scene."
  },
  {
    question: "What's the difference between Text and JSON output?",
    answer: "The standard output is structured text, designed for readability. The JSON output, however, is a highly structured data format perfect for developers or for use in automated workflows. You can convert any text prompt to JSON using the 'Convert to JSON' button."
  },
  {
    question: "What does the 'Test Consistency' feature do?",
    answer: "This powerful tool uses AI to compare your prompt against the original media you uploaded. It scores how accurately the text describes the visuals and identifies specific details that are missing from your prompt. It even provides a revised, more accurate version for you to apply."
  }
];

interface FAQItemProps {
  faq: { question: string; answer: string; };
  isOpen: boolean;
  onClick: () => void;
}

const FAQItem: React.FC<FAQItemProps> = ({ faq, isOpen, onClick }) => (
  <div className={`border-b border-white/5 last:border-0 transition-all duration-500 ${isOpen ? 'bg-white/5' : ''}`}>
    <button
      onClick={onClick}
      className="w-full flex justify-between items-center text-left py-8 px-10 group"
      aria-expanded={isOpen}
    >
      <span className={`font-bold transition-colors duration-300 ${isOpen ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>
        {faq.question}
      </span>
      <div className={`p-2 rounded-full transition-all duration-500 ${isOpen ? 'bg-white text-[#31326f] rotate-180' : 'bg-white/5 text-slate-500'}`}>
        {isOpen ? <Minus size={16} /> : <Plus size={16} />}
      </div>
    </button>
    <AnimatePresence>
      {isOpen && (
        <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
        >
          <div className="pb-8 px-10">
            <p className="text-slate-400 text-sm leading-relaxed font-medium">
              {faq.answer}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

const FAQ = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const handleClick = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section className="mt-32 max-w-4xl mx-auto">
             <header className="text-center mb-16">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
                    <HelpCircle size={14} className="text-slate-400" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Support Center</span>
                </div>
                <h2 className="text-4xl font-bold font-heading uppercase tracking-tighter mb-4">Knowledge Base</h2>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.3em]">Frequently Asked Questions</p>
            </header>
            
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="glassmorphic-card rounded-[3rem] border border-white/10 overflow-hidden shadow-2xl"
            >
                <div>
                    {faqData.map((faq, index) => (
                        <FAQItem
                            key={index}
                            faq={faq}
                            isOpen={openIndex === index}
                            onClick={() => handleClick(index)}
                        />
                    ))}
                </div>
            </motion.div>
        </section>
    );
};

export default FAQ;