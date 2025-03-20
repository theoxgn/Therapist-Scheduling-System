import React from 'react';
import { format, addDays, startOfWeek } from 'date-fns';
import { Calendar, ChevronLeft, ChevronRight, Users } from 'lucide-react';

const ScheduleHeader = ({ branchName, branchCode, currentDate, onDateChange }) => {
  // Calculate the start date (Monday of the current week)
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  
  // Calculate the end date (Sunday of the second week - exactly 14 days total)
  const twoWeekEnd = addDays(weekStart, 13);
  
  return (
    <div className="p-6 text-white">
      <div className="flex justify-between items-center mb-5">
        <div>
          <h1 className="text-2xl font-bold">Schedule Management</h1>
          <div className="text-blue-100 flex items-center mt-1">
            <Users className="w-4 h-4 mr-1" />
            <span>{branchName} ({branchCode})</span>
          </div>
        </div>
        <div className="text-sm px-3 py-1.5 bg-white/20 rounded-md">
          Last updated: {format(new Date(), 'MMM d, yyyy h:mm a')}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={() => onDateChange(addDays(currentDate, -14))}
          className="p-2 hover:bg-white/20 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
          aria-label="Previous two weeks"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 bg-white/20 py-2.5 px-4 rounded-md">
          <Calendar className="w-5 h-5" />
          <span className="font-medium">
            {format(weekStart, 'MMM d')} - {format(twoWeekEnd, 'MMM d, yyyy')} (2 weeks)
          </span>
        </div>

        <button
          onClick={() => onDateChange(addDays(currentDate, 14))}
          className="p-2 hover:bg-white/20 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
          aria-label="Next two weeks"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default ScheduleHeader;