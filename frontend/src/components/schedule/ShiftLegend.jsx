import React from 'react';

const ShiftLegend = ({ shifts }) => (
  <div className="flex flex-wrap gap-4 text-sm mb-6 mx-4">
    {Object.entries(shifts).map(([code, shift]) => (
      <div key={code} className="flex items-center gap-2 bg-white px-3 py-2 rounded shadow-sm">
        <div className={`w-8 h-8 flex items-center justify-center rounded-md font-bold ${shift.color} ${shift.textColor}`}>
          {code}
        </div>
        <span className="text-gray-600">{shift.time}</span>
      </div>
    ))}
  </div>
);

export default ShiftLegend;