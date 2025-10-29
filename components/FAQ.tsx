import React, { useState } from 'react';
import { FAQPlusIcon, FAQMinusIcon, BrainCircuitIcon } from './icons.tsx';
import GlowCard from './GlowCard.tsx';

const faqData = [
  {
    question: "How does the AI analysis work?",
    answer: "Our app uses Google's advanced Gemini AI model. When you upload a video, we extract several key frames. These frames, along with a specialized system prompt, are sent to the AI. The AI then 'looks' at these images and generates a detailed, structured description based on what it sees, covering everything from subjects and actions to style and lighting."
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
    answer: "The standard output is structured text, designed for readability. The JSON output, however, is a highly structured data format perfect for developers or for use in automated workflows. You can convert any text prompt to JSON using the 'Convert to JSON' button. This gives you a more detailed, machine-readable breakdown of the analysis."
  },
  {
    question: "What does the 'Test Consistency' feature do?",
    answer: "This powerful tool uses AI to compare your prompt against the original media you uploaded. It scores how accurately the text describes the visuals and identifies specific details that are missing from your prompt. It even provides a revised, more accurate version for you to apply, helping you create the most faithful text-to-media prompts possible."
  }
];

interface FAQItemProps {
  faq: { question: string; answer: string; };
  isOpen: boolean;
  onClick: () => void;
}

const FAQItem: React.FC<FAQItemProps> = ({ faq, isOpen, onClick }) => (
  <div className="border-b border-border-primary-light dark:border-border-primary-dark">
    <button
      onClick={onClick}
      className="w-full flex justify-between items-center text-left py-5 px-6"
      aria-expanded={isOpen}
    >
      <span className="font-semibold text-text-primary-light dark:text-text-primary-dark">{faq.question}</span>
      {isOpen ? <FAQMinusIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" /> : <FAQPlusIcon className="w-6 h-6 text-text-secondary-light dark:text-text-secondary-dark" />}
    </button>
    {isOpen && (
      <div className="pb-5 px-6 animate-fade-in-slide-up" style={{ animationDuration: '300ms' }}>
        <p className="text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
          {faq.answer}
        </p>
      </div>
    )}
  </div>
);

const FAQ = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const handleClick = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section className="mt-24">
             <h2 className="text-3xl font-bold text-center mb-12">
                <span className="title-glow-subtle bg-gradient-to-r from-gray-700 to-gray-900 dark:from-stone-100 dark:to-stone-300 bg-clip-text text-transparent">Frequently Asked Questions</span>
            </h2>
            <GlowCard className="bg-bg-secondary-light dark:bg-bg-secondary-dark rounded-2xl p-1 shadow-lg border border-border-primary-light dark:border-border-primary-dark max-w-4xl mx-auto">
                <div className="rounded-xl overflow-hidden">
                    {faqData.map((faq, index) => (
                        <FAQItem
                            key={index}
                            faq={faq}
                            isOpen={openIndex === index}
                            onClick={() => handleClick(index)}
                        />
                    ))}
                </div>
            </GlowCard>
        </section>
    );
};

export default FAQ;