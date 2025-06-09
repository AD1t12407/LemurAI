import React from 'react';
import { motion } from 'framer-motion';
import { typingAnimation } from '../utils/animations';

interface TypingTextProps {
  text: string;
  className?: string;
  delay?: number;
}

export const TypingText: React.FC<TypingTextProps> = ({ 
  text, 
  className = '', 
  delay = 0 
}) => {
  const letters = text.split('');

  return (
    <motion.span
      className={className}
      variants={typingAnimation.container}
      initial="hidden"
      animate="visible"
      style={{ display: 'inline-block' }}
    >
      {letters.map((letter, index) => (
        <motion.span
          key={index}
          variants={typingAnimation.letter}
          style={{ display: 'inline-block' }}
        >
          {letter === ' ' ? '\u00A0' : letter}
        </motion.span>
      ))}
    </motion.span>
  );
};