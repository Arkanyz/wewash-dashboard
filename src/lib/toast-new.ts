import { toast as hotToast, ToastPosition } from 'react-hot-toast';

interface ToastOptions {
  duration?: number;
  position?: ToastPosition;
}

const defaultOptions: ToastOptions = {
  duration: 4000,
  position: 'top-right',
};

const toast = {
  success: (message: string, options: ToastOptions = {}) => {
    return hotToast.success(message, {
      ...defaultOptions,
      ...options,
      className: 'bg-white',
      style: {
        padding: '16px',
        color: '#10B981',
        borderLeft: '4px solid #10B981',
      },
    });
  },

  error: (message: string, options: ToastOptions = {}) => {
    return hotToast.error(message, {
      ...defaultOptions,
      ...options,
      className: 'bg-white',
      style: {
        padding: '16px',
        color: '#EF4444',
        borderLeft: '4px solid #EF4444',
      },
    });
  },

  info: (message: string, options: ToastOptions = {}) => {
    return hotToast(message, {
      ...defaultOptions,
      ...options,
      className: 'bg-white',
      style: {
        padding: '16px',
        color: '#286BD4',
        borderLeft: '4px solid #286BD4',
      },
    });
  },

  warning: (message: string, options: ToastOptions = {}) => {
    return hotToast(message, {
      ...defaultOptions,
      ...options,
      className: 'bg-white',
      style: {
        padding: '16px',
        color: '#F59E0B',
        borderLeft: '4px solid #F59E0B',
      },
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
      className: 'bg-white',
      loading: {
        style: {
          padding: '16px',
          color: '#286BD4',
          borderLeft: '4px solid #286BD4',
        },
      },
      success: {
        style: {
          padding: '16px',
          color: '#10B981',
          borderLeft: '4px solid #10B981',
        },
      },
      error: {
        style: {
          padding: '16px',
          color: '#EF4444',
          borderLeft: '4px solid #EF4444',
        },
      },
    });
  },
};

export default toast;
