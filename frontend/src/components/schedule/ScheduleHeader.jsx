import React from 'react';
import { format, addDays } from 'date-fns';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

const ScheduleHeader = ({ branchName, branchCode, currentDate, onDateChange }) => {
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Schedule Management</h1>
        <div className="text-sm text-gray-600">
          {branchName} ({branchCode})
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => onDateChange(addDays(currentDate, -7))}
          className="p-2 hover:bg-gray-100 rounded-full w-10 h-10 flex items-center justify-center"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 bg-white py-2 px-4 shadow-sm rounded-md">
          <Calendar className="w-5 h-5 text-gray-600" />
          <span className="font-medium text-lg">
            {format(currentDate, 'MMMM d, yyyy')}
          </span>
        </div>

        <button
          onClick={() => onDateChange(addDays(currentDate, 7))}
          className="p-2 hover:bg-gray-100 rounded-full w-10 h-10 flex items-center justify-center"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default ScheduleHeader;