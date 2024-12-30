import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#1E201F]">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-[#99E5DC]/30 rounded-full"></div>
        <div className="w-12 h-12 border-4 border-[#99E5DC] border-t-transparent rounded-full animate-spin absolute top-0"></div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
