import { toast as hotToast } from 'react-hot-toast';

interface ToastOptions {
  duration?: number;
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
}

const defaultOptions: ToastOptions = {
  duration: 4000,
  position: 'top-right',
};

const getStyle = (type: 'success' | 'error' | 'info' | 'warning') => {
  const baseStyle = {
    padding: '16px',
    borderRadius: '8px',
    color: '#FFFFFF',
  };

  switch (type) {
    case 'success':
      return { ...baseStyle, background: '#10B981' };
    case 'error':
      return { ...baseStyle, background: '#EF4444' };
    case 'info':
      return { ...baseStyle, background: '#286BD4' };
    case 'warning':
      return { ...baseStyle, background: '#F59E0B' };
  }
};

const toast = {
  success: (message: string, options: ToastOptions = {}) => {
    return hotToast(message, {
      ...defaultOptions,
      ...options,
      style: getStyle('success'),
    });
  },

  error: (message: string, options: ToastOptions = {}) => {
    return hotToast(message, {
      ...defaultOptions,
      ...options,
      style: getStyle('error'),
    });
  },

  info: (message: string, options: ToastOptions = {}) => {
    return hotToast(message, {
      ...defaultOptions,
      ...options,
      style: getStyle('info'),
    });
  },

  warning: (message: string, options: ToastOptions = {}) => {
    return hotToast(message, {
      ...defaultOptions,
      ...options,
      style: getStyle('warning'),
    });
  },

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
      loading: {
        style: getStyle('info'),
      },
      success: {
        style: getStyle('success'),
      },
      error: {
        style: getStyle('error'),
      },
    });
  },
};

export default toast;
