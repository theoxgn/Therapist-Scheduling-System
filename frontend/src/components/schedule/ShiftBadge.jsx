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
        cursor-pointer select-none min-w-[40px] min-h-[30px]
        flex items-center justify-center
        ${className}
      `}
    >
      {code}
    </span>
  );
};

export default ShiftBadge;