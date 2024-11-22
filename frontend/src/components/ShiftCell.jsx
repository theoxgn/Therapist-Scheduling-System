// src/components/ShiftCell.jsx
import React from 'react';

function ShiftCell({ schedules }) {
  const getBackgroundColor = (shift) => {
    switch (shift) {
      case 'X': return 'bg-yellow-200';
      case '1': return 'bg-blue-200';
      case 'M': return 'bg-green-200';
      case '2': return 'bg-purple-200';
      default: return 'bg-gray-200';
    }
  };

  return (
    <td className="border p-2">
      {schedules.map((schedule, index) => (
        <div 
          key={index}
          className={`${getBackgroundColor(schedule.shift)} p-1 rounded mb-1`}
        >
          <span className="text-xs">{schedule.Therapist.name}</span>
        </div>
      ))}
    </td>
  );
}

export default ShiftCell;