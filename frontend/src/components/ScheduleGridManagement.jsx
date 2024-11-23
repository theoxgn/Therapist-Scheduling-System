import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

function ScheduleGridManagement({ therapists, onScheduleUpdate }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedShift, setSelectedShift] = useState(null);
  const [selectedTherapist, setSelectedTherapist] = useState(null);

  // Shift definitions
  const SHIFTS = {
    MORNING: { code: '1', label: 'Morning', time: '09:00 - 18:00' },
    MIDDLE: { code: 'M', label: 'Middle', time: '11:30 - 20:30' },
    EVENING: { code: '2', label: 'Evening', time: '13:00 - 22:00' },
    LEAVE: { code: 'X', label: 'Leave', time: 'Leave Request' }
  };

  // Get dates for two weeks starting from selected date
  const getDates = () => {
    const dates = [];
    const startDate = new Date(selectedDate);
    startDate.setDate(startDate.getDate() - startDate.getDay()); // Start from Sunday
    
    for (let i = 0; i < 14; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  // Format date for display
  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const dates = getDates();

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Schedule Management</h2>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSelectedDate(prev => {
                const newDate = new Date(prev);
                newDate.setDate(newDate.getDate() - 7);
                return newDate;
              })}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-500" />
              <span className="font-medium">{formatDate(selectedDate)}</span>
            </div>
            <button 
              onClick={() => setSelectedDate(prev => {
                const newDate = new Date(prev);
                newDate.setDate(newDate.getDate() + 7);
                return newDate;
              })}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Shift Legend */}
        <div className="flex gap-6 text-sm">
          {Object.values(SHIFTS).map(shift => (
            <div key={shift.code} className="flex items-center gap-2">
              <span className={`w-6 h-6 flex items-center justify-center rounded ${
                shift.code === 'X' ? 'bg-yellow-100 text-yellow-700' :
                shift.code === '1' ? 'bg-blue-100 text-blue-700' :
                shift.code === 'M' ? 'bg-green-100 text-green-700' :
                'bg-purple-100 text-purple-700'
              }`}>
                {shift.code}
              </span>
              <span>{shift.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Schedule Grid */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="p-3 border-b bg-gray-50 text-left">Shift</th>
              {dates.map(date => (
                <th 
                  key={date.toISOString()} 
                  className={`p-3 border-b text-center min-w-[120px] ${
                    date.getDay() === 0 || date.getDay() === 6 
                      ? 'bg-blue-50' 
                      : 'bg-gray-50'
                  }`}
                >
                  <div className="font-medium">{formatDate(date)}</div>
                  <div className="text-xs text-gray-500">
                    {date.getDay() === 0 || date.getDay() === 6 ? 'Weekend' : 'Weekday'}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Morning Shift Row */}
            <tr>
              <td className="p-3 border-b font-medium">Morning (1)</td>
              {dates.map(date => (
                <td 
                  key={date.toISOString()}
                  className="p-3 border-b border-r"
                >
                  <div className="min-h-[100px] relative group hover:bg-gray-50 cursor-pointer rounded">
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <button className="bg-blue-500 text-white px-3 py-1 rounded text-sm">
                        Add Shift
                      </button>
                    </div>
                  </div>
                </td>
              ))}
            </tr>

            {/* Middle Shift Row */}
            <tr>
              <td className="p-3 border-b font-medium">Middle (M)</td>
              {dates.map(date => (
                <td 
                  key={date.toISOString()}
                  className="p-3 border-b border-r"
                >
                  <div className="min-h-[100px] relative group hover:bg-gray-50 cursor-pointer rounded">
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <button className="bg-green-500 text-white px-3 py-1 rounded text-sm">
                        Add Shift
                      </button>
                    </div>
                  </div>
                </td>
              ))}
            </tr>

            {/* Evening Shift Row */}
            <tr>
              <td className="p-3 border-b font-medium">Evening (2)</td>
              {dates.map(date => (
                <td 
                  key={date.toISOString()}
                  className="p-3 border-b border-r"
                >
                  <div className="min-h-[100px] relative group hover:bg-gray-50 cursor-pointer rounded">
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <button className="bg-purple-500 text-white px-3 py-1 rounded text-sm">
                        Add Shift
                      </button>
                    </div>
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-t bg-gray-50">
        <div className="flex justify-end gap-2">
          <button className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300">
            Clear Day
          </button>
          <button className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

ScheduleGridManagement.propTypes = {
  therapists: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    gender: PropTypes.string.isRequired
  })).isRequired,
  onScheduleUpdate: PropTypes.func.isRequired
};

export default ScheduleGridManagement;