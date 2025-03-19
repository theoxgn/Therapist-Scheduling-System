import React, { useState } from 'react';

const ValidationTooltip = ({ errors, children }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  if (!errors || errors.length === 0) {
    return children;
  }
  
  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className="absolute z-50 bg-white border border-yellow-300 shadow-lg rounded-md p-3 min-w-[250px] max-w-xs left-1/2 transform -translate-x-1/2 top-full mt-1">
          <h4 className="font-medium text-yellow-800 mb-1 flex items-center gap-1 text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
              />
            </svg>
            <span>Validation Issues</span>
          </h4>
          <ul className="text-xs text-yellow-700 list-disc pl-4 max-h-40 overflow-y-auto">
            {errors.map((error, index) => (
              <li key={index} className="mb-1">{error}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ValidationTooltip;