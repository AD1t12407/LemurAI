import { create } from 'zustand';
import { Toast, ToastType } from '../components/Toast';

interface ToastStore {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
  // Convenience methods
  success: (title: string, message?: string, options?: Partial<Toast>) => void;
  error: (title: string, message?: string, options?: Partial<Toast>) => void;
  warning: (title: string, message?: string, options?: Partial<Toast>) => void;
  info: (title: string, message?: string, options?: Partial<Toast>) => void;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

export const useToastStore = create<ToastStore>((set, get) => ({
  toasts: [],

  addToast: (toast) => {
    const id = generateId();
    const newToast = { ...toast, id };
    set((state) => ({
      toasts: [...state.toasts, newToast],
    }));
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }));
  },

  clearToasts: () => {
    set({ toasts: [] });
  },

  success: (title, message, options = {}) => {
    get().addToast({
      type: 'success',
      title,
      message,
      duration: 4000,
      ...options,
    });
  },

  error: (title, message, options = {}) => {
    get().addToast({
      type: 'error',
      title,
      message,
      duration: 6000,
      ...options,
    });
  },

  warning: (title, message, options = {}) => {
    get().addToast({
      type: 'warning',
      title,
      message,
      duration: 5000,
      ...options,
    });
  },

  info: (title, message, options = {}) => {
    get().addToast({
      type: 'info',
      title,
      message,
      duration: 4000,
      ...options,
    });
  },
}));
