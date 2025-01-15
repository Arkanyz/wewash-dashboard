import React from 'react';
import { motion } from 'framer-motion';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

export const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  size = 'md',
  disabled = false,
}) => {
  const sizes = {
    sm: {
      track: 'w-12 h-6',
      thumb: 'w-5 h-5',
      translate: 28,
      icon: 'h-2.5 w-2.5',
      padding: 2,
    },
    md: {
      track: 'w-14 h-7',
      thumb: 'w-6 h-6',
      translate: 32,
      icon: 'h-3 w-3',
      padding: 2,
    },
    lg: {
      track: 'w-16 h-8',
      thumb: 'w-7 h-7',
      translate: 36,
      icon: 'h-3.5 w-3.5',
      padding: 2,
    },
  };

  return (
    <motion.button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`
        relative inline-flex shrink-0 cursor-pointer rounded-full border-2 border-transparent
        transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2
        focus-visible:ring-[#286BD4] focus-visible:ring-opacity-50
        ${sizes[size].track}
        ${checked ? 'bg-[#286BD4]' : 'bg-gray-200'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
      whileTap={disabled ? undefined : { scale: 0.95 }}
      style={{ padding: sizes[size].padding }}
    >
      <motion.span
        className={`
          pointer-events-none relative inline-block transform rounded-full
          bg-white shadow-lg
          ${sizes[size].thumb}
        `}
        initial={false}
        animate={{
          x: checked ? sizes[size].translate : 0,
        }}
        transition={{ 
          type: "spring", 
          stiffness: 500, 
          damping: 30 
        }}
      >
        <span
          className={`
            absolute inset-0 flex items-center justify-center
            transition-opacity duration-200
            ${checked ? 'opacity-0' : 'opacity-100'}
          `}
        >
          <svg
            className={`${sizes[size].icon} text-gray-400`}
            fill="none"
            viewBox="0 0 12 12"
          >
            <path
              d="M4 8l2-2m0 0l2-2M6 6L4 4m2 2l2 2"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <span
          className={`
            absolute inset-0 flex items-center justify-center
            transition-opacity duration-200
            ${checked ? 'opacity-100' : 'opacity-0'}
          `}
        >
          <svg
            className={`${sizes[size].icon} text-[#286BD4]`}
            fill="currentColor"
            viewBox="0 0 12 12"
          >
            <path d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-3.293a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z" />
          </svg>
        </span>
      </motion.span>
    </motion.button>
  );
};

export default Toggle;
