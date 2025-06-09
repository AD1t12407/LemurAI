import { Variants } from 'framer-motion';

// Easing curves for professional animations
export const easings = {
  smooth: [0.25, 0.1, 0.25, 1],
  snappy: [0.4, 0, 0.2, 1],
  bounce: [0.68, -0.55, 0.265, 1.55],
  elastic: [0.175, 0.885, 0.32, 1.275],
} as const;

// Hero section animations
export const heroAnimations = {
  badge: {
    hidden: { opacity: 0, y: 20, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: easings.smooth,
      },
    },
  },
  
  title: {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 1,
        delay: 0.2,
        ease: easings.smooth,
      },
    },
  },
  
  subtitle: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        delay: 0.4,
        ease: easings.smooth,
      },
    },
  },
  
  buttons: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        delay: 0.6,
        ease: easings.smooth,
      },
    },
  },
  
  dashboard: {
    hidden: { opacity: 0, y: 60, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 1.2,
        delay: 0.8,
        ease: easings.smooth,
      },
    },
  },
} satisfies Record<string, Variants>;

// Stagger animations
export const staggerAnimations = {
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  },
  
  fastContainer: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.05,
      },
    },
  },
  
  item: {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: easings.smooth,
      },
    },
  },
  
  cardHover: {
    rest: { scale: 1, y: 0 },
    hover: {
      scale: 1.02,
      y: -5,
      transition: {
        duration: 0.3,
        ease: easings.snappy,
      },
    },
  },
} satisfies Record<string, Variants>;

// Feature card animations
export const featureAnimations = {
  card: {
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.7,
        ease: easings.smooth,
      },
    },
    hover: {
      y: -8,
      scale: 1.02,
      transition: {
        duration: 0.3,
        ease: easings.snappy,
      },
    },
  },
  
  icon: {
    rest: { scale: 1, rotate: 0 },
    hover: {
      scale: 1.1,
      rotate: 5,
      transition: {
        duration: 0.3,
        ease: easings.bounce,
      },
    },
  },
  
  glow: {
    rest: { boxShadow: '0 0 0 rgba(18, 111, 214, 0)' },
    hover: {
      boxShadow: '0 0 30px rgba(18, 111, 214, 0.3)',
      transition: {
        duration: 0.3,
        ease: easings.smooth,
      },
    },
  },
} satisfies Record<string, Variants>;

// How it works animations
export const processAnimations = {
  step: {
    hidden: { opacity: 0, x: 50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.8,
        ease: easings.smooth,
      },
    },
  },
  
  stepReverse: {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.8,
        ease: easings.smooth,
      },
    },
  },
  
  number: {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.5,
        delay: 0.3,
        ease: easings.bounce,
      },
    },
  },
  
  line: {
    hidden: { scaleY: 0 },
    visible: {
      scaleY: 1,
      transition: {
        duration: 1,
        ease: easings.smooth,
      },
    },
  },
} satisfies Record<string, Variants>;

// Button animations
export const buttonAnimations = {
  primary: {
    rest: { 
      scale: 1,
      boxShadow: '0 4px 14px 0 rgba(18, 111, 214, 0.25)',
    },
    hover: {
      scale: 1.05,
      boxShadow: '0 8px 25px 0 rgba(18, 111, 214, 0.4)',
      transition: {
        duration: 0.2,
        ease: easings.snappy,
      },
    },
    tap: {
      scale: 0.98,
      transition: {
        duration: 0.1,
        ease: easings.snappy,
      },
    },
  },
  
  outline: {
    rest: { 
      scale: 1,
      borderColor: 'rgba(18, 111, 214, 0.3)',
    },
    hover: {
      scale: 1.02,
      borderColor: 'rgba(18, 111, 214, 0.6)',
      backgroundColor: 'rgba(18, 111, 214, 0.05)',
      transition: {
        duration: 0.2,
        ease: easings.snappy,
      },
    },
    tap: {
      scale: 0.98,
      transition: {
        duration: 0.1,
        ease: easings.snappy,
      },
    },
  },
} satisfies Record<string, Variants>;

// Scroll animations
export const scrollAnimations = {
  fadeInUp: {
    hidden: { opacity: 0, y: 60 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: easings.smooth,
      },
    },
  },
  
  fadeInLeft: {
    hidden: { opacity: 0, x: -60 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.8,
        ease: easings.smooth,
      },
    },
  },
  
  fadeInRight: {
    hidden: { opacity: 0, x: 60 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.8,
        ease: easings.smooth,
      },
    },
  },
  
  scaleIn: {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: easings.smooth,
      },
    },
  },
} satisfies Record<string, Variants>;

// Typing effect animation
export const typingAnimation = {
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03,
        delayChildren: 0.5,
      },
    },
  },
  
  letter: {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.1,
        ease: easings.smooth,
      },
    },
  },
};

// Floating animation for dashboard
export const floatingAnimation = {
  y: [-10, 10, -10],
  transition: {
    duration: 6,
    repeat: Infinity,
    ease: 'easeInOut',
  },
};

// Pulse animation for live indicators
export const pulseAnimation = {
  scale: [1, 1.2, 1],
  opacity: [1, 0.8, 1],
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: 'easeInOut',
  },
};

// Viewport settings for scroll animations
export const viewportSettings = {
  once: true,
  margin: '-100px',
  amount: 0.3,
} as const;