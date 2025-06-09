import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../utils/cn';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  variant?: 'default' | 'white' | 'dark';
}

export const Logo: React.FC<LogoProps> = ({
  className,
  size = 'md',
  showText = true,
  variant = 'default'
}) => {
  const sizes = {
    sm: 'h-8 w-auto',
    md: 'h-12 w-auto',
    lg: 'h-16 w-auto',
    xl: 'h-20 w-auto',
  };

  const textSizes = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl',
  };

  // Professional color scheme matching your website
  const getTextColor = () => {
    switch (variant) {
      case 'white':
        return 'text-white';
      case 'dark':
        return 'text-gray-900';
      default:
        return 'text-gray-900 dark:text-white';
    }
  };

  const getAccentColor = () => {
    switch (variant) {
      case 'white':
        return 'text-blue-200';
      case 'dark':
        return '#126FD6';
      default:
        return '#126FD6';
    }
  };

  return (
    <Link
      to="/"
      className={cn(
        'flex items-center gap-2 transition-all duration-200 hover:opacity-80',
        className
      )}
    >
      {/* Professional Logo Image */}
      <img
        src="/logo_lemur.png"
        alt="Lemur AI Logo"
        className={cn(
          'object-contain transition-all duration-200',
          sizes[size]
        )}
        style={{
          filter: variant === 'white'
            ? 'brightness(0) invert(1)'
            : variant === 'dark'
            ? 'brightness(0)'
            : 'none'
        }}
      />

      {showText && (
        <span className={cn(
          'font-bold tracking-tight transition-colors duration-200',
          textSizes[size],
          getTextColor()
        )}>
          Lemur
          <span
            className="font-bold transition-colors duration-200"
            style={{ color: getAccentColor() }}
          >
            AI
          </span>
        </span>
      )}
    </Link>
  );
};