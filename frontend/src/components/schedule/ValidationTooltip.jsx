import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';

const ValidationTooltip = ({ errors, children, showValidationOnHover = true }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  if (!errors || errors.length === 0) {
    return children;
  }
  
  // If validation should not be shown on hover, just render the children
  if (!showValidationOnHover) {
    return (
      <div className="relative">
        {children}
      </div>
    );
  }
  
  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className="absolute z-50 bg-white border border-yellow-300 shadow-lg rounded-lg p-3 min-w-[250px] max-w-xs left-0 top-full mt-1">
          {/* Tooltip arrow - positioned at the top left */}
          <div className="absolute -top-2 left-4 transform w-4 h-4 rotate-45 bg-white border-t border-l border-yellow-300"></div>
          
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-800 mb-2 text-sm">
                Validation Issues
              </h4>
              <ul className="text-xs text-yellow-700 space-y-1.5 max-h-40 overflow-y-auto">
                {errors.map((error, index) => (
                  <li key={index} className="flex items-start">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-yellow-500 mt-1.5 mr-1.5 flex-shrink-0"></span>
                    <span>{error}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ValidationTooltip;