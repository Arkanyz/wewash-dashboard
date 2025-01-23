import { toast as hotToast } from 'react-hot-toast';

interface ToastOptions {
  duration?: number;
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
}

const defaultOptions: ToastOptions = {
  duration: 4000,
  position: 'top-right',
};

const baseStyle = {
  padding: '16px',
  borderRadius: '8px',
  background: '#FFFFFF',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
};

const styles = {
  success: { 
    ...baseStyle,
    borderLeft: '4px solid #10B981',
    color: '#10B981',
  },
  error: { 
    ...baseStyle,
    borderLeft: '4px solid #EF4444',
    color: '#EF4444',
  },
  info: { 
    ...baseStyle,
    borderLeft: '4px solid #286BD4',
    color: '#286BD4',
  },
  warning: { 
    ...baseStyle,
    borderLeft: '4px solid #F59E0B',
    color: '#F59E0B',
  },
};

const toastOptions = {
  style: {
    background: '#FFFFFF',
  },
};

const toast = {
  success: (message: string, options: ToastOptions = {}) => {
    return hotToast(message, {
      ...defaultOptions,
      ...toastOptions,
      ...options,
      style: {
        ...toastOptions.style,
        ...styles.success,
      },
    });
  },

  error: (message: string, options: ToastOptions = {}) => {
    return hotToast(message, {
      ...defaultOptions,
      ...toastOptions,
      ...options,
      style: {
        ...toastOptions.style,
        ...styles.error,
      },
    });
  },

  info: (message: string, options: ToastOptions = {}) => {
    return hotToast(message, {
      ...defaultOptions,
      ...toastOptions,
      ...options,
      style: {
        ...toastOptions.style,
        ...styles.info,
      },
    });
  },

  warning: (message: string, options: ToastOptions = {}) => {
    return hotToast(message, {
      ...defaultOptions,
      ...toastOptions,
      ...options,
      style: {
        ...toastOptions.style,
        ...styles.warning,
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
      ...toastOptions,
      ...options,
      loading: { 
        style: {
          ...toastOptions.style,
          ...styles.info,
        }
      },
      success: { 
        style: {
          ...toastOptions.style,
          ...styles.success,
        }
      },
      error: { 
        style: {
          ...toastOptions.style,
          ...styles.error,
        }
      },
    });
  },
};

export default toast;
