import React from 'react';

interface BlurryButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

const BlurryButton: React.FC<BlurryButtonProps> = ({
  children,
  onClick,
  className = '',
  disabled = false,
  type = 'button',
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        group relative inline-flex items-center justify-center
        p-[1px] rounded-2xl
        font-bold uppercase tracking-widest
        transition-all duration-300 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-white/20
        disabled:opacity-60 disabled:cursor-not-allowed
        bg-gradient-to-br from-white/40 to-transparent
        hover:from-white/60 hover:to-white/10
        ${className}
      `}
    >
      <span
        className="
          relative w-full h-full px-8 py-4 text-sm
          bg-background-dark text-slate-200
          rounded-[0.95rem] leading-none flex items-center justify-center gap-3
          group-hover:bg-white group-hover:text-background-dark transition-all duration-300
        "
      >
        {children}
      </span>
    </button>
  );
};

export default BlurryButton;