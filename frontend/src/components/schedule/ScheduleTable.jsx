import React, { useEffect, useState } from 'react';
import { format, startOfWeek, addDays, addWeeks, isSameDay } from 'date-fns';
import ValidationTooltip from './ValidationTooltip';
import ShiftBadge from './ShiftBadge';
import { AlertTriangle } from 'lucide-react';

const ScheduleTable = ({
  therapists,
  startDate, // This will be the date we start from (will be adjusted to Monday)
  getTherapistShift,
  selectedCell,
  onCellClick,
  validationErrors,
  getDateValidationErrors,
  getTherapistValidationErrors,
  getRemainingSlots,
  shifts,
  tableContainerRef
}) => {
  // Generate 2 weeks of dates starting from Monday
  const [dates, setDates] = useState([]);

  useEffect(() => {
    // Ensure we start from Monday (1 is Monday in date-fns)
    const mondayStart = startOfWeek(startDate, { weekStartsOn: 1 });
    
    // Generate 14 days (2 weeks) starting from Monday
    const twoWeekDates = Array(14)
      .fill()
      .map((_, i) => addDays(mondayStart, i));
    
    setDates(twoWeekDates);
  }, [startDate]);

  // Function to get only leave-related errors for a therapist
  const getTherapistLeaveErrors = (therapistId) => {
    const leaveErrors = [];
    
    // Look for leave-related error keys
    Object.keys(validationErrors || {}).forEach(key => {
      if (key.startsWith(`${therapistId}`) && 
          (key.includes('leave') || key.includes('consecutive') || key.includes('total'))) {
        leaveErrors.push(validationErrors[key]);
      }
    });
    
    return leaveErrors;
  };

  // Function to get validation errors for a week
  const getWeekValidationErrors = (weekStartDate) => {
    let weekErrors = [];
    
    // Check for 7 days from the weekStartDate
    for (let i = 0; i < 7; i++) {
      const currentDate = addDays(weekStartDate, i);
      const dateErrors = getDateValidationErrors ? getDateValidationErrors(currentDate) : [];
      weekErrors = [...weekErrors, ...dateErrors];
    }
    
    return weekErrors;
  };

  // Function to determine if a date is in the first or second week
  const isSecondWeek = (date, firstDate) => {
    return !isSameDay(startOfWeek(date, { weekStartsOn: 1 }), 
                     startOfWeek(firstDate, { weekStartsOn: 1 }));
  };

  // Get the first day of each week
  const week1Start = dates.length > 0 ? dates[0] : null;
  const week2Start = dates.length > 0 ? dates[7] : null;

  // Get validation errors for each week
  const week1Errors = week1Start ? getWeekValidationErrors(week1Start) : [];
  const week2Errors = week2Start ? getWeekValidationErrors(week2Start) : [];

  return (
    <div 
      className="overflow-auto max-h-[600px] border border-gray-200 rounded-lg"
      ref={tableContainerRef}
    >
      <table className="w-full border-collapse">
        <thead className="sticky top-0 z-20 bg-gray-50">
          <tr>
            {/* Week indicators spanning the date columns */}
            <th className="p-4 border-b text-left w-48 border-r border-gray-200 sticky left-0 z-30 bg-gray-50 border-b-0">
              {/* Empty cell above therapist column */}
            </th>
            {dates.length > 0 && (
              <>
                <th colSpan={7} className={`p-2 text-center border-b border-r border-gray-200 bg-blue-50 
                  ${week1Errors.length > 0 ? 'border border-yellow-300' : ''}`}>
                  
                    <div className="flex justify-center items-center gap-2">
                      <span className="font-semibold text-blue-700">Week 1</span>
                      {/* {week1Errors.length > 0 && (
                        <div className="text-xs text-yellow-700 flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded">
                          <AlertTriangle className="w-3 h-3" />
                          <span>{week1Errors.length} issues</span>
                        </div>
                      )} */}
                    </div>
                  
                </th>
                <th colSpan={7} className={`p-2 text-center border-b border-gray-200 bg-green-50
                  ${week2Errors.length > 0 ? 'border border-yellow-300' : ''}`}>
                 
                    <div className="flex justify-center items-center gap-2">
                      <span className="font-semibold text-green-700">Week 2</span>
                      {/* {week2Errors.length > 0 && (
                        <div className="text-xs text-yellow-700 flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded">
                          <AlertTriangle className="w-3 h-3" />
                          <span>{week2Errors.length} issues</span>
                        </div>
                      )} */}
                    </div>
                  
                </th>
              </>
            )}
          </tr>
          <tr>
            <th className="p-4 border-b text-left w-48 border-r border-gray-200 sticky left-0 z-30 bg-gray-50">
              <div className="font-semibold text-gray-700">THERAPIST</div>
            </th>
            {dates.map(date => {
              const dateErrors = getDateValidationErrors ? getDateValidationErrors(date) : [];
              const hasErrors = dateErrors.length > 0;
              const remainingSlots = getRemainingSlots ? getRemainingSlots(date) : null;
              const isWeekend = date.getDay() === 0 || date.getDay() === 6;
              const isWeek2 = dates.length > 0 && isSecondWeek(date, dates[0]);
              
              // Create sample data for week 2 if data is missing
              // This ensures min/max counts are always displayed in both weeks
              const displaySlots = remainingSlots || {
                shift1: { current: 0, min: 3, max: 3 },
                shift2: { current: 0, min: 5, max: 5 },
                shiftM: { current: 0, min: 3, max: 3 },
                leave: { current: 0, max: 3 }
              };
              
              return (
                <th 
                  key={date.toISOString()} 
                  className={`p-3 border-b text-center min-w-[130px] ${
                    isWeekend ? 'bg-gray-100' : (isWeek2 ? 'bg-green-50' : 'bg-blue-50')
                  } ${hasErrors ? 'border border-yellow-300' : 'border-r border-gray-200'}`}
                >
                  <ValidationTooltip errors={dateErrors}>
                    <div className="font-semibold text-gray-700">
                      {format(date, 'EEE')}
                    </div>
                    <div className="text-sm text-gray-500 mb-1">
                      {format(date, 'MMM d')}
                    </div>
                    
                    {/* Always show slot availability indicators for both weeks */}
                    <div className="space-y-1 mt-2 border-t border-gray-200 pt-2">
                      <div className="grid grid-cols-2 gap-1">
                        <div className="text-xs">
                          <div className={`rounded px-1.5 py-0.5 font-medium ${
                            displaySlots.shift1.current < displaySlots.shift1.min ? 
                            'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            1: {displaySlots.shift1.current}/{displaySlots.shift1.max}
                          </div>
                        </div>
                        
                        <div className="text-xs">
                          <div className={`rounded px-1.5 py-0.5 font-medium ${
                            displaySlots.shiftM.current < displaySlots.shiftM.min ? 
                            'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                          }`}>
                            M: {displaySlots.shiftM.current}/{displaySlots.shiftM.max}
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-1">
                        <div className="text-xs">
                          <div className={`rounded px-1.5 py-0.5 font-medium ${
                            displaySlots.shift2.current < displaySlots.shift2.min ? 
                            'bg-red-100 text-red-700' : 'bg-purple-100 text-purple-700'
                          }`}>
                            2: {displaySlots.shift2.current}/{displaySlots.shift2.max}
                          </div>
                        </div>
                        
                        <div className="text-xs">
                          <div className={`rounded px-1.5 py-0.5 font-medium ${
                            displaySlots.leave.current >= displaySlots.leave.max ? 
                            'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            X: {displaySlots.leave.current}/{displaySlots.leave.max}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {hasErrors && (
                      <div className="text-xs text-yellow-700 mt-1 flex items-center justify-center gap-1 bg-yellow-50 p-1 rounded">
                        <AlertTriangle className="w-3 h-3" />
                        <span>{dateErrors.length} issues</span>
                      </div>
                    )}
                  </ValidationTooltip>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {therapists.map((therapist, index) => {
            // Get only leave-related errors for this therapist
            const leaveErrors = getTherapistLeaveErrors(therapist.id);
            const hasLeaveErrors = leaveErrors.length > 0;
            const bgColor = index % 2 === 0 ? 'bg-gray-50' : 'bg-white';
            
            return (
              <tr key={therapist.id} className={`group ${bgColor} hover:bg-gray-100`}>
                <td 
                  className={`p-4 border-b font-medium sticky left-0 z-10 border-r ${
                    hasLeaveErrors ? 'bg-amber-100' : bgColor
                  } group-hover:bg-gray-100`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span>{therapist.name}</span>
                      {therapist.gender === 'male' && (
                        <span className="px-1.5 py-0.5 text-xs bg-blue-100 text-blue-700 rounded">Male</span>
                      )}
                    </div>
                    
                    {/* Show only leave-related errors */}
                    {hasLeaveErrors && (
                      <div className="text-xs text-amber-800 mt-1 bg-amber-50 px-2 py-1 rounded flex items-center">
                        <AlertTriangle className="w-3 h-3 mr-1 flex-shrink-0" />
                        <span>
                          {leaveErrors[0]}
                          {leaveErrors.length > 1 && ` (+${leaveErrors.length - 1} more)`}
                        </span>
                      </div>
                    )}
                  </div>
                </td>
                {dates.map(date => {
                  const shift = getTherapistShift(therapist.id, date);
                  const dateStr = format(date, 'yyyy-MM-dd');
                  const isSelected = 
                    selectedCell && 
                    selectedCell.therapistId === therapist.id && 
                    format(selectedCell.date, 'yyyy-MM-dd') === dateStr;
                  const isWeek2 = dates.length > 0 && isSecondWeek(date, dates[0]);
                  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                  
                  return (
                    <td 
                      key={date.toISOString()}
                      className={`p-0 border-b border-r text-center ${
                        isSelected ? 'ring-2 ring-blue-500 z-10 relative' : ''
                      }`}
                      onClick={() => onCellClick(therapist.id, date)}
                    >
                      <div className={`w-full h-full flex items-center justify-center p-3 ${
                        isSelected ? 'bg-blue-100' : 
                        isWeekend ? 'bg-gray-50' :
                        (isWeek2 ? 'bg-green-50/30' : 'bg-blue-50/30')
                      } hover:bg-gray-100 cursor-pointer transition-colors`}>
                        {shift ? (
                          <div className="relative flex justify-center w-full">
                            <ShiftBadge code={shift} shifts={shifts} className="w-full shadow-sm" />
                          </div>
                        ) : (
                          <div className="w-full h-9 rounded-md border-2 border-dashed border-gray-200 flex items-center justify-center text-xs text-gray-400">
                            Click to assign
                          </div>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ScheduleTable;