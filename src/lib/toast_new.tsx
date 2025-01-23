import { toast as hotToast } from 'react-hot-toast';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastOptions {
  duration?: number;
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
}

const defaultOptions: ToastOptions = {
  duration: 4000,
  position: 'top-right',
};

const styles = {
  success: {
    background: '#10B981',
    color: '#FFFFFF',
    padding: '16px',
    borderRadius: '8px',
  },
  error: {
    background: '#EF4444',
    color: '#FFFFFF',
    padding: '16px',
    borderRadius: '8px',
  },
  info: {
    background: '#286BD4',
    color: '#FFFFFF',
    padding: '16px',
    borderRadius: '8px',
  },
  warning: {
    background: '#F59E0B',
    color: '#FFFFFF',
    padding: '16px',
    borderRadius: '8px',
  },
};

const createToast = (message: string, type: ToastType, options: ToastOptions = {}) => {
  return hotToast(message, {
    ...defaultOptions,
    ...options,
    style: styles[type],
  });
};

const toast = {
  success: (message: string, options?: ToastOptions) => createToast(message, 'success', options),
  error: (message: string, options?: ToastOptions) => createToast(message, 'error', options),
  info: (message: string, options?: ToastOptions) => createToast(message, 'info', options),
  warning: (message: string, options?: ToastOptions) => createToast(message, 'warning', options),
  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    },
    options: ToastOptions = {}
  ) => {
    return hotToast.promise(promise, messages, {
      ...defaultOptions,
      ...options,
      style: styles.info,
      success: {
        style: styles.success,
      },
      error: {
        style: styles.error,
      },
    });
  },
};

export default toast;
