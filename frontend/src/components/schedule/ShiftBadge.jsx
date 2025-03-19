import React from 'react';

const ShiftBadge = ({ code, shifts, onClick, className = '' }) => {
  const shift = shifts[code];
  if (!shift) return null;
  
  return (
    <span 
      onClick={onClick}
      className={`
        ${shift.color} ${shift.textColor}
        px-3 py-1.5 rounded-md font-bold text-center
        cursor-pointer select-none min-w-[40px] min-h-[32px]
        flex items-center justify-center
        border border-opacity-40 ${code === '1' ? 'border-blue-300' : 
                                   code === 'M' ? 'border-green-300' : 
                                   code === '2' ? 'border-purple-300' : 'border-yellow-300'}
        transition-transform hover:scale-105 active:scale-95
        ${className}
      `}
    >
      {code}
    </span>
  );
};

export default ShiftBadge;