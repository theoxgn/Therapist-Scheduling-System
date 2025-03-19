import React from 'react';
import { format } from 'date-fns';
import ValidationTooltip from './ValidationTooltip';
import ShiftBadge from './ShiftBadge';
import { AlertTriangle } from 'lucide-react';

const ScheduleTable = ({
  therapists,
  dates,
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
  // Function to get only leave-related errors for a therapist
  const getTherapistLeaveErrors = (therapistId) => {
    const leaveErrors = [];
    
    // Look for leave-related error keys
    Object.keys(validationErrors).forEach(key => {
      if (key.startsWith(`${therapistId}`) && 
          (key.includes('leave') || key.includes('consecutive') || key.includes('total'))) {
        leaveErrors.push(validationErrors[key]);
      }
    });
    
    return leaveErrors;
  };

  return (
    <div 
      className="overflow-auto max-h-[600px] border border-gray-200 rounded-lg"
      ref={tableContainerRef}
    >
      <table className="w-full border-collapse">
        <thead className="sticky top-0 z-20 bg-gray-50">
          <tr>
            <th className="p-4 border-b text-left w-48 border-r border-gray-200 sticky left-0 z-30 bg-gray-50">
              <div className="font-semibold text-gray-700">THERAPIST</div>
            </th>
            {dates.map(date => {
              const dateErrors = getDateValidationErrors(date);
              const hasErrors = dateErrors.length > 0;
              const remainingSlots = getRemainingSlots(date);
              const isWeekend = date.getDay() === 0 || date.getDay() === 6;
              
              return (
                <th 
                  key={date.toISOString()} 
                  className={`p-3 border-b text-center min-w-[130px] ${
                    isWeekend ? 'bg-blue-50' : 'bg-gray-50'
                  } ${hasErrors ? 'border border-yellow-300' : 'border-r border-gray-200'}`}
                >
                  <ValidationTooltip errors={dateErrors}>
                    <div className="font-semibold text-gray-700">
                      {format(date, 'EEE')}
                    </div>
                    <div className="text-sm text-gray-500 mb-1">
                      {format(date, 'MMM d')}
                    </div>
                    
                    {/* Slot availability indicators */}
                    {remainingSlots && (
                      <div className="space-y-1 mt-2 border-t border-gray-200 pt-2">
                        <div className="grid grid-cols-2 gap-1">
                          <div className="text-xs">
                            <div className={`rounded px-1.5 py-0.5 font-medium ${
                              remainingSlots.shift1.current < remainingSlots.shift1.min ? 
                              'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                            }`}>
                              1: {remainingSlots.shift1.current}/{remainingSlots.shift1.max}
                            </div>
                          </div>
                          
                          <div className="text-xs">
                            <div className={`rounded px-1.5 py-0.5 font-medium ${
                              remainingSlots.shiftM.current < remainingSlots.shiftM.min ? 
                              'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                            }`}>
                              M: {remainingSlots.shiftM.current}/{remainingSlots.shiftM.max}
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-1">
                          <div className="text-xs">
                            <div className={`rounded px-1.5 py-0.5 font-medium ${
                              remainingSlots.shift2.current < remainingSlots.shift2.min ? 
                              'bg-red-100 text-red-700' : 'bg-purple-100 text-purple-700'
                            }`}>
                              2: {remainingSlots.shift2.current}/{remainingSlots.shift2.max}
                            </div>
                          </div>
                          
                          <div className="text-xs">
                            <div className={`rounded px-1.5 py-0.5 font-medium ${
                              remainingSlots.leave.current >= remainingSlots.leave.max ? 
                              'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              X: {remainingSlots.leave.current}/{remainingSlots.leave.max}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {hasErrors && !remainingSlots && (
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
                  
                  return (
                    <td 
                      key={date.toISOString()}
                      className={`p-0 border-b border-r text-center ${
                        isSelected ? 'ring-2 ring-blue-500 z-10 relative' : ''
                      }`}
                      onClick={() => onCellClick(therapist.id, date)}
                    >
                      <div className={`w-full h-full flex items-center justify-center p-3 ${
                        isSelected ? 'bg-blue-100' : ''
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