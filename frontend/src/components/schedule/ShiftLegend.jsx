import React from 'react';
import { Clock } from 'lucide-react';

const ShiftLegend = ({ shifts }) => (
  <div className="mb-6">
    <h2 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Shift Types</h2>
    <div className="flex flex-wrap gap-3">
      {Object.entries(shifts).map(([code, shift]) => (
        <div key={code} className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-lg shadow-sm border border-gray-200">
          <div className={`w-9 h-9 flex items-center justify-center rounded-md font-bold ${shift.color} ${shift.textColor} border ${
            code === '1' ? 'border-blue-300' : 
            code === 'M' ? 'border-green-300' : 
            code === '2' ? 'border-purple-300' : 'border-yellow-300'
          } border-opacity-40`}>
            {code}
          </div>
          <div>
            <div className="font-medium text-sm">{shift.label}</div>
            <div className="text-xs text-gray-500 flex items-center mt-0.5">
              <Clock className="w-3 h-3 mr-1" />
              {shift.time}
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default ShiftLegend;