import React from 'react';
import { motion, MotionProps } from 'framer-motion';
import { cn } from '../utils/cn';

interface AnimatedContainerProps extends MotionProps {
  children: React.ReactNode;
  className?: string;
  animation?: 'fadeIn' | 'slideUp' | 'slideDown' | 'scaleIn' | 'bounceIn' | 'slideLeft' | 'slideRight';
  delay?: number;
  duration?: number;
  stagger?: number;
  hover?: boolean;
  tap?: boolean;
}

const animations = {
  fadeIn: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  },
  slideUp: {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -30 }
  },
  slideDown: {
    initial: { opacity: 0, y: -30 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 30 }
  },
  slideLeft: {
    initial: { opacity: 0, x: 30 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -30 }
  },
  slideRight: {
    initial: { opacity: 0, x: -30 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 30 }
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 }
  },
  bounceIn: {
    initial: { opacity: 0, scale: 0.3 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    },
    exit: { opacity: 0, scale: 0.3 }
  }
};

const hoverAnimations = {
  lift: { y: -4, transition: { duration: 0.2 } },
  scale: { scale: 1.02, transition: { duration: 0.2 } },
  glow: { 
    boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.15), 0 10px 10px -5px rgba(59, 130, 246, 0.04)",
    transition: { duration: 0.2 }
  }
};

const tapAnimations = {
  scale: { scale: 0.95 },
  press: { scale: 0.98, y: 1 }
};

export const AnimatedContainer: React.FC<AnimatedContainerProps> = ({
  children,
  className,
  animation = 'fadeIn',
  delay = 0,
  duration = 0.6,
  stagger = 0,
  hover = false,
  tap = false,
  ...motionProps
}) => {
  const selectedAnimation = animations[animation];
  
  const motionConfig = {
    initial: selectedAnimation.initial,
    animate: selectedAnimation.animate,
    exit: selectedAnimation.exit,
    transition: {
      duration,
      delay,
      ease: "easeOut",
      ...selectedAnimation.animate?.transition
    },
    ...(hover && {
      whileHover: hoverAnimations.lift
    }),
    ...(tap && {
      whileTap: tapAnimations.scale
    }),
    ...motionProps
  };

  return (
    <motion.div
      className={cn('animate-fade-in', className)}
      {...motionConfig}
    >
      {children}
    </motion.div>
  );
};

// Staggered container for animating lists
interface StaggeredContainerProps {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
  animation?: 'fadeIn' | 'slideUp' | 'scaleIn';
}

export const StaggeredContainer: React.FC<StaggeredContainerProps> = ({
  children,
  className,
  stagger = 0.1,
  animation = 'fadeIn'
}) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: stagger,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: animations[animation].initial,
    visible: animations[animation].animate
  };

  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {React.Children.map(children, (child, index) => (
        <motion.div key={index} variants={itemVariants}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};

// Page transition wrapper
interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  className
}) => {
  return (
    <motion.div
      className={cn('min-h-screen', className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
};

// Loading skeleton component
interface LoadingSkeletonProps {
  className?: string;
  lines?: number;
  avatar?: boolean;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  className,
  lines = 3,
  avatar = false
}) => {
  return (
    <div className={cn('animate-pulse', className)}>
      {avatar && (
        <div className="flex items-center space-x-4 mb-4">
          <div className="rounded-full bg-dark-200 h-10 w-10 dark:bg-dark-700"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-dark-200 rounded w-3/4 dark:bg-dark-700"></div>
            <div className="h-3 bg-dark-200 rounded w-1/2 dark:bg-dark-700"></div>
          </div>
        </div>
      )}
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={cn(
              'h-4 bg-dark-200 rounded dark:bg-dark-700',
              index === lines - 1 ? 'w-2/3' : 'w-full'
            )}
          />
        ))}
      </div>
    </div>
  );
};

// Floating action button with animation
interface FloatingButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

export const FloatingButton: React.FC<FloatingButtonProps> = ({
  children,
  onClick,
  className,
  position = 'bottom-right'
}) => {
  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6'
  };

  return (
    <motion.button
      className={cn(
        'fixed z-50 h-14 w-14 rounded-full bg-primary-500 text-white shadow-lg hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
        'flex items-center justify-center',
        positionClasses[position],
        className
      )}
      onClick={onClick}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      whileHover={{ scale: 1.1, y: -2 }}
      whileTap={{ scale: 0.9 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      {children}
    </motion.button>
  );
};
