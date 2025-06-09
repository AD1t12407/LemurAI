import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '../utils/cn';

interface OverlayEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
}

export const OverlayEditModal: React.FC<OverlayEditModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  className,
}) => {
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-7xl mx-4',
  };

  // Handle escape key and body scroll
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.classList.add('modal-open');
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.classList.remove('modal-open');
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 overflow-y-auto"
          style={{
            zIndex: 99999,
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0
          }}
        >
      {/* Professional Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="fixed inset-0"
        style={{
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'var(--backdrop-blur)',
          zIndex: 99999
        }}
        onClick={onClose}
      />

      {/* Modal Container */}
      <div
        className="flex min-h-full items-center justify-center p-4"
        style={{
          position: 'relative',
          zIndex: 100000
        }}
      >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{
                duration: 0.3,
                ease: "easeOut",
                type: "spring",
                stiffness: 300,
                damping: 30
              }}
              className={cn(
                'relative w-full transform overflow-hidden rounded-2xl shadow-2xl transition-all',
                sizeClasses[size],
                className
              )}
              style={{
                background: 'var(--glass-bg)',
                border: '1px solid var(--border-primary)',
                boxShadow: 'var(--shadow-lg)',
                backdropFilter: 'var(--backdrop-blur)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Dark mode styles */}
              <style jsx>{`
                .dark .modal-content {
                  background: linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95)) !important;
                  border: 1px solid rgba(96, 165, 250, 0.3) !important;
                  box-shadow: 0 25px 50px -12px rgba(96, 165, 250, 0.4), 0 0 0 1px rgba(96, 165, 250, 0.2) !important;
                }
              `}</style>

              <div className="modal-content">
                {/* Professional Header */}
                <div
                  className="flex items-center justify-between p-6 border-b"
                  style={{
                    borderColor: 'var(--border-primary)',
                    background: 'var(--bg-secondary)'
                  }}
                >
                  <h3 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {title}
                  </h3>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    className="rounded-full p-2 transition-all duration-200"
                    style={{
                      color: 'var(--text-secondary)',
                      backgroundColor: 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                      e.currentTarget.style.color = 'var(--text-primary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'var(--text-secondary)';
                    }}
                  >
                    <X className="h-5 w-5" />
                  </motion.button>
                </div>

                {/* Modal Content */}
                <div className="p-6">
                  {children}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );

  // Use portal to render modal outside of the component tree
  return typeof document !== 'undefined'
    ? createPortal(modalContent, document.body)
    : null;
};

// Professional form wrapper for edit modals
interface EditFormWrapperProps {
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  className?: string;
}

export const EditFormWrapper: React.FC<EditFormWrapperProps> = ({
  children,
  onSubmit,
  className,
}) => {
  return (
    <form onSubmit={onSubmit} className={cn('space-y-6', className)}>
      {children}
    </form>
  );
};

// Professional form section
interface FormSectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export const FormSection: React.FC<FormSectionProps> = ({
  title,
  description,
  children,
  className,
}) => {
  return (
    <div className={cn('space-y-4', className)}>
      {(title || description) && (
        <div className="space-y-1">
          {title && (
            <h4 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              {title}
            </h4>
          )}
          {description && (
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {description}
            </p>
          )}
        </div>
      )}
      {children}
    </div>
  );
};

// Professional form actions
interface FormActionsProps {
  children: React.ReactNode;
  className?: string;
}

export const FormActions: React.FC<FormActionsProps> = ({
  children,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex gap-3 justify-end pt-6 border-t',
        className
      )}
      style={{
        borderColor: 'var(--border-primary)',
      }}
    >
      {children}
    </div>
  );
};

// Professional input group
interface InputGroupProps {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  className?: string;
}

export const InputGroup: React.FC<InputGroupProps> = ({
  label,
  required,
  error,
  children,
  className,
}) => {
  return (
    <div className={cn('space-y-2', className)}>
      <label className="block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {children}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-400"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};
