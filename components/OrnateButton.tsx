import * as React from 'react';
import { motion } from 'framer-motion';

interface OrnateButtonProps {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
}

const OrnateButton: React.FC<OrnateButtonProps> = ({ onClick, disabled, children, className = '' }) => {
  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.02, letterSpacing: '0.1em' } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      onClick={onClick}
      disabled={disabled}
      className={`
        relative group px-12 py-4 overflow-hidden
        font-cinzel text-sm tracking-widest uppercase font-semibold
        text-noble-gold border border-noble-gold/30
        hover:text-noble-paper hover:border-noble-gold
        transition-colors duration-500 ease-out
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      <span className="relative z-10 flex items-center gap-2 justify-center">
        {/* Left decorative diamond */}
        <span className="w-1.5 h-1.5 bg-noble-gold rotate-45 opacity-50 group-hover:opacity-100 transition-opacity" />
        {children}
        {/* Right decorative diamond */}
        <span className="w-1.5 h-1.5 bg-noble-gold rotate-45 opacity-50 group-hover:opacity-100 transition-opacity" />
      </span>
      
      {/* Background fill animation */}
      <span className="absolute inset-0 bg-noble-gold/10 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out" />
    </motion.button>
  );
};

export default OrnateButton;