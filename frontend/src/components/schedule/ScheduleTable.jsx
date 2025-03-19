import React from 'react';
import { format } from 'date-fns';
import ValidationTooltip from './ValidationTooltip';
import ShiftBadge from './ShiftBadge';

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
  return (
    <div 
      className="overflow-x-auto max-h-[600px] overflow-y-auto" 
      ref={tableContainerRef}
    >
      <table className="w-full border-collapse">
        <thead className="sticky top-0 z-10">
          <tr>
            <th className="p-3 border-b bg-gray-50 text-left w-48">
              NAMA
            </th>
            {dates.map(date => {
              const dateErrors = getDateValidationErrors(date);
              const hasErrors = dateErrors.length > 0;
              const remainingSlots = getRemainingSlots(date);
              const isWeekend = date.getDay() === 0 || date.getDay() === 6;
              
              return (
                <th 
                  key={date.toISOString()} 
                  className={`p-3 border-b text-center min-w-[120px] ${
                    isWeekend ? 'bg-blue-50' : 'bg-gray-50'
                  } ${hasErrors ? 'border-yellow-300' : ''}`}
                >
                  <ValidationTooltip errors={dateErrors}>
                    <div className="font-medium">
                      {format(date, 'EEE, MMM d')}
                    </div>
                    <div className="text-xs text-gray-500 mb-1">
                      {isWeekend ? 'Weekend' : 'Weekday'}
                    </div>
                    
                    {/* Slot availability indicators */}
                    {remainingSlots && (
                      <div className="space-y-1 mt-2 border-t pt-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-medium text-blue-600">Shift 1:</span>
                          <span className={remainingSlots.shift1.current < remainingSlots.shift1.min ? 'text-red-600 font-bold' : ''}>
                            {remainingSlots.shift1.current}/{remainingSlots.shift1.max}
                          </span>
                        </div>
                        
                        <div className="flex justify-between text-xs">
                          <span className="font-medium text-green-600">Middle:</span>
                          <span className={remainingSlots.shiftM.current < remainingSlots.shiftM.min ? 'text-red-600 font-bold' : ''}>
                            {remainingSlots.shiftM.current}/{remainingSlots.shiftM.max}
                          </span>
                        </div>
                        
                        <div className="flex justify-between text-xs">
                          <span className="font-medium text-purple-600">Shift 2:</span>
                          <span className={remainingSlots.shift2.current < remainingSlots.shift2.min ? 'text-red-600 font-bold' : ''}>
                            {remainingSlots.shift2.current}/{remainingSlots.shift2.max}
                          </span>
                        </div>
                        
                        <div className="flex justify-between text-xs">
                          <span className="font-medium text-yellow-600">Leave:</span>
                          <span className={remainingSlots.leave.current >= remainingSlots.leave.max ? 'text-red-600 font-bold' : ''}>
                            {remainingSlots.leave.current}/{remainingSlots.leave.max}
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {hasErrors && !remainingSlots && (
                      <div className="text-xs text-yellow-600 mt-1 flex items-center justify-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                          />
                        </svg>
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
          {therapists.map(therapist => {
            const therapistErrors = getTherapistValidationErrors(therapist.id);
            const hasTherapistErrors = therapistErrors.length > 0;
            
            return (
              <tr key={therapist.id} className="group">
                <td className={`p-3 border-b font-medium sticky left-0 ${
                  hasTherapistErrors ? 'bg-amber-200' : 'bg-amber-100'
                }`}>
                  <ValidationTooltip errors={therapistErrors}>
                    <div className="flex items-center justify-between">
                      <span>{therapist.name}</span>
                      {therapist.gender === 'male' && (
                        <span className="px-1.5 py-0.5 text-xs bg-blue-100 text-blue-600 rounded">M</span>
                      )}
                    </div>
                    {hasTherapistErrors && (
                      <div className="text-xs text-amber-800 mt-1">
                        {therapistErrors[0]}
                        {therapistErrors.length > 1 && ` (+${therapistErrors.length - 1} more)`}
                      </div>
                    )}
                  </ValidationTooltip>
                </td>
                {dates.map(date => {
                  const shift = getTherapistShift(therapist.id, date);
                  const isSelected = 
                    selectedCell && 
                    selectedCell.therapistId === therapist.id && 
                    format(selectedCell.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
                  
                  // Get validation errors specific to this cell
                  const dateStr = format(date, 'yyyy-MM-dd');
                  const cellErrorKeys = Object.keys(validationErrors).filter(key => 
                    key.includes(dateStr) && key.includes(shift) && !key.includes('min') && !key.includes('max')
                  );
                  const cellErrors = cellErrorKeys.map(key => validationErrors[key]);
                  const hasCellError = cellErrors.length > 0;
                  
                  return (
                    <td 
                      key={date.toISOString()}
                      className={`p-3 border-b border-r text-center ${
                        isSelected ? 'bg-blue-100' : hasCellError ? 'bg-red-50' : ''
                      }`}
                      onClick={() => onCellClick(therapist.id, date)}
                    >
                      {shift && (
                        <div className="relative">
                          <ShiftBadge code={shift} shifts={shifts} className="w-full" />
                          {hasCellError && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500"></div>
                          )}
                        </div>
                      )}
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