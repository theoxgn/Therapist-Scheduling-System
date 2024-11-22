import React from 'react';
import ShiftCell from './ShiftCell';

function ScheduleGrid({ schedules, selectedDate }) {
  const startDate = new Date(selectedDate);
  startDate.setDate(startDate.getDate() - startDate.getDay());
  
  const days = Array.from({ length: 14 }, (_, i) => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    return date;
  });

  const shifts = ['1', 'M', '2'];

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="w-20"></th>
            {days.map((day, index) => (
              <th key={index} className="p-2 border">
                <div className="text-sm font-bold">
                  {day.toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div className="text-xs">
                  {day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {shifts.map(shift => (
            <tr key={shift}>
              <td className="p-2 border font-bold">
                {shift === '1' ? 'Morning' : shift === 'M' ? 'Middle' : 'Evening'}
              </td>
              {days.map((day, index) => (
                <ShiftCell
                  key={`${shift}-${index}`}
                  schedules={schedules.filter(s => 
                    s.shift === shift && 
                    s.date === day.toISOString().split('T')[0]
                  )}
                />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ScheduleGrid;