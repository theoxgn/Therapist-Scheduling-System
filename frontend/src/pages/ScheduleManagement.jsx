import React, { useState, useEffect, useCallback } from 'react';
import { format, addDays } from 'date-fns';
import { useParams } from 'react-router-dom';
import { Calendar, Trash2, Copy, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../services/api';

const SHIFTS = {
  '1': { 
    code: '1',
    label: 'Morning', 
    time: '09:00 - 18:00',
    color: 'bg-blue-100 hover:bg-blue-200',
    textColor: 'text-blue-600'
  },
  'M': { 
    code: 'M',
    label: 'Middle', 
    time: '11:30 - 20:30',
    color: 'bg-green-100 hover:bg-green-200',
    textColor: 'text-green-600'
  },
  '2': { 
    code: '2',
    label: 'Evening', 
    time: '13:00 - 22:00',
    color: 'bg-purple-100 hover:bg-purple-200',
    textColor: 'text-purple-600'
  },
  'X': { 
    code: 'X',
    label: 'Leave Request', 
    time: 'Leave Request',
    color: 'bg-yellow-100 hover:bg-yellow-200',
    textColor: 'text-yellow-600'
  }
};

const ShiftBadge = ({ code, onClick, className = '' }) => {
  const shift = SHIFTS[code];
  if (!shift) return null;
  
  return (
    <span 
      onClick={onClick}
      className={`
        ${shift.color} ${shift.textColor}
        px-3 py-1.5 rounded-md font-bold text-center
        cursor-pointer select-none
        ${className}
      `}
    >
      {code}
    </span>
  );
};

const ShiftLegend = () => (
  <div className="flex gap-4 text-sm mb-6">
    {Object.entries(SHIFTS).map(([code, shift]) => (
      <div key={code} className="flex items-center gap-2">
        <ShiftBadge code={code} />
        <span className="text-gray-600">{shift.time}</span>
      </div>
    ))}
  </div>
);

const QuickActions = ({ onClearDay, onClearAllSchedules, onCopyPrevious, onOpenSettings }) => (
  <div className="grid grid-cols-3 gap-4 mb-6">
    <button
      onClick={onClearDay}
      className="flex flex-col items-center gap-2 p-3 border rounded hover:bg-gray-50"
    >
      <Trash2 className="w-5 h-5 text-gray-600" />
      <span className="text-sm">Clear Day</span>
    </button>
    <button
      onClick={onClearAllSchedules}
      className="flex flex-col items-center gap-2 p-3 border rounded hover:bg-gray-50 text-red-600"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
      <span className="text-sm">Clear All</span>
    </button>
    <button
      onClick={onCopyPrevious}
      className="flex flex-col items-center gap-2 p-3 border rounded hover:bg-gray-50"
    >
      <Copy className="w-5 h-5 text-gray-600" />
      <span className="text-sm">Copy Previous Week</span>
    </button>
    <button
      onClick={onOpenSettings}
      className="flex flex-col items-center gap-2 p-3 border rounded hover:bg-gray-50"
    >
      <Settings className="w-5 h-5 text-gray-600" />
      <span className="text-sm">Settings</span>
    </button>
  </div>
);

const ScheduleManagement = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [schedules, setSchedules] = useState([]);
  const [therapists, setTherapists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { branchCode } = useParams();
  const [branch, setBranch] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedCell, setSelectedCell] = useState(null);

  // Fetch branch details
  const fetchBranch = useCallback(async () => {
    try {
      const result = await api.branches.getOne(branchCode);
      if (result.success) {
        setBranch(result.data);
      }
    } catch (err) {
      console.error('Error fetching branch:', err);
    }
  }, [branchCode]);

  // Success message effect
  useEffect(() => {
    let timer;
    if (showSuccess) {
      timer = setTimeout(() => setShowSuccess(false), 3000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [showSuccess]);

  const getDates = useCallback(() => {
    const dates = [];
    const startDate = new Date(currentDate);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    return dates;
  }, [currentDate]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const therapistsResult = await api.therapists.getByBranch(branchCode);
      const dates = getDates();
      const startDate = dates[0].toISOString().split('T')[0];
      const endDate = dates[6].toISOString().split('T')[0];

      const schedulesResult = await api.schedules.getByDateRange(
        branchCode,
        startDate,
        endDate
      );

      if (therapistsResult.success && schedulesResult.success) {
        setTherapists(therapistsResult.data);
        setSchedules(schedulesResult.data);
      }
    } catch (err) {
      setError('Failed to load schedule data');
    } finally {
      setIsLoading(false);
    }
  }, [branchCode, getDates]);

  useEffect(() => {
    fetchBranch();
    fetchData();
  }, [fetchBranch, fetchData]);

  const handleClearDay = async () => {
    if (!window.confirm('Are you sure you want to clear all schedules for this day?')) {
      return;
    }
  
    try {
      setIsLoading(true);
      const result = await api.schedules.clearDay(branchCode, currentDate);
      
      if (result.success) {
        // Show success message
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        // Refresh the data
        await fetchData();
      } else {
        setError(result.error || 'Failed to clear schedules');
      }
    } catch (err) {
      console.error('Clear day error:', err);
      setError('Failed to clear schedules');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearAllSchedules = async () => {
    // Show confirmation dialog
    if (!window.confirm('Are you sure you want to clear ALL schedules for this branch? This action cannot be undone.')) {
      return;
    }
  
    try {
      setIsLoading(true);
      
      // Call API to clear all schedules for the branch
      const result = await api.schedules.clearAll(branchCode);
      
      if (result.success) {
        // Show success message
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        
        // Refresh the data
        await fetchData();
      } else {
        setError(result.error || 'Failed to clear all schedules');
      }
    } catch (err) {
      console.error('Clear all schedules error:', err);
      setError('Failed to clear all schedules');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyPrevious = async () => {
    if (!window.confirm('Copy schedules from previous week?')) return;
    try {
      await api.schedules.copyPreviousWeek(branchCode, format(currentDate, 'yyyy-MM-dd'));
      fetchData();
    } catch (err) {
      setError('Failed to copy schedules');
    }
  };

  // Add this useEffect to handle keyboard events
  useEffect(() => {
    const handleKeyDown = async (e) => {
      // Only proceed if a cell is selected
      if (!selectedCell) return;
      
      const { therapistId, date } = selectedCell;
      const dateStr = format(date, 'yyyy-MM-dd');
      
      // Maps key press to shift code
      const validKeys = {
        '1': '1',
        '2': '2',
        'm': 'M',
        'M': 'M',
        'x': 'X',
        'X': 'X'
      };
      
      const keyPressed = e.key;
      
      // Check if the pressed key is valid
      if (validKeys[keyPressed]) {
        const newShift = validKeys[keyPressed];
        
        try {
          const existingSchedule = schedules.find(s => 
            s.therapistId === therapistId && 
            s.date === dateStr
          );
          
          let result;
          
          // If setting to X (Leave Request), handle the special pattern
          if (newShift === 'X') {
            // Set up dates for the day before and after
            const prevDate = new Date(date);
            prevDate.setDate(prevDate.getDate() - 1);
            const prevDateStr = format(prevDate, 'yyyy-MM-dd');
            
            const nextDate = new Date(date);
            nextDate.setDate(nextDate.getDate() + 1);
            const nextDateStr = format(nextDate, 'yyyy-MM-dd');
            
            // Find existing schedules for adjacent days
            const prevSchedule = schedules.find(s => 
              s.therapistId === therapistId && 
              s.date === prevDateStr
            );
            
            const nextSchedule = schedules.find(s => 
              s.therapistId === therapistId && 
              s.date === nextDateStr
            );
            
            // Update or create schedule for previous day (shift 1)
            if (prevSchedule) {
              await api.schedules.update(prevSchedule.id, {
                branchCode,
                shift: '1',
                date: prevDateStr,
                therapistId
              });
            } else {
              await api.schedules.create({
                branchCode,
                shift: '1',
                date: prevDateStr,
                therapistId
              });
            }
            
            // Update or create schedule for next day (shift 2)
            if (nextSchedule) {
              await api.schedules.update(nextSchedule.id, {
                branchCode,
                shift: '2',
                date: nextDateStr,
                therapistId
              });
            } else {
              await api.schedules.create({
                branchCode,
                shift: '2',
                date: nextDateStr,
                therapistId
              });
            }
          }
          
          // Update current day's schedule
          if (existingSchedule) {
            result = await api.schedules.update(existingSchedule.id, {
              branchCode,
              shift: newShift,
              date: dateStr,
              therapistId
            });
          } else {
            result = await api.schedules.create({
              branchCode,
              shift: newShift,
              date: dateStr,
              therapistId
            });
          }
          
          await fetchData(); // Refresh data after successful update
          // Optionally, keep the selection or clear it
          // setSelectedCell(null);
        } catch (err) {
          console.error('Schedule update error:', err);
          setError(err.message || 'Failed to update shift');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    // Cleanup function to remove event listener
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedCell, schedules, branchCode]); // Include all dependencies

  // const handleShiftClick = async (therapistId, date, currentShift) => {
  //   const dateStr = format(date, 'yyyy-MM-dd');
  //   const shiftCodes = Object.keys(SHIFTS);
  //   const currentIndex = shiftCodes.indexOf(currentShift || '');
  //   const nextShift = shiftCodes[(currentIndex + 1) % shiftCodes.length];
  
  //   try {
  //     const existingSchedule = schedules.find(s => 
  //       s.therapistId === therapistId && 
  //       s.date === dateStr
  //     );
      
  //     let result;
      
  //     // If setting to X (Leave Request), let's also set adjacent days
  //     if (nextShift === 'X') {
  //       // Set up date objects for the day before and after
  //       const prevDate = new Date(date);
  //       prevDate.setDate(prevDate.getDate() - 1);
  //       const prevDateStr = format(prevDate, 'yyyy-MM-dd');
        
  //       const nextDate = new Date(date);
  //       nextDate.setDate(nextDate.getDate() + 1);
  //       const nextDateStr = format(nextDate, 'yyyy-MM-dd');
        
  //       // Find existing schedules for adjacent days
  //       const prevSchedule = schedules.find(s => 
  //         s.therapistId === therapistId && 
  //         s.date === prevDateStr
  //       );
        
  //       const nextSchedule = schedules.find(s => 
  //         s.therapistId === therapistId && 
  //         s.date === nextDateStr
  //       );
        
  //       // Update or create schedule for previous day (shift 1)
  //       if (prevSchedule) {
  //         await api.schedules.update(prevSchedule.id, {
  //           branchCode,
  //           shift: '1',
  //           date: prevDateStr,
  //           therapistId
  //         });
  //       } else {
  //         await api.schedules.create({
  //           branchCode,
  //           shift: '1',
  //           date: prevDateStr,
  //           therapistId
  //         });
  //       }
        
  //       // Update or create schedule for next day (shift 2)
  //       if (nextSchedule) {
  //         await api.schedules.update(nextSchedule.id, {
  //           branchCode,
  //           shift: '2',
  //           date: nextDateStr,
  //           therapistId
  //         });
  //       } else {
  //         await api.schedules.create({
  //           branchCode,
  //           shift: '2',
  //           date: nextDateStr,
  //           therapistId
  //         });
  //       }
  //     }
      
  //     // Update the current day's schedule
  //     if (existingSchedule) {
  //       result = await api.schedules.update(existingSchedule.id, {
  //         branchCode,
  //         shift: nextShift,
  //         date: dateStr,
  //         therapistId
  //       });
        
  //       if (!result.success) {
  //         throw new Error(result.error || 'Failed to update schedule');
  //       }
  //     } else {
  //       result = await api.schedules.create({
  //         branchCode,
  //         shift: nextShift,
  //         date: dateStr,
  //         therapistId
  //       });
        
  //       if (!result.success) {
  //         throw new Error(result.error || 'Failed to create schedule');
  //       }
  //     }
      
  //     await fetchData(); // Refresh data after successful update
      
  //   } catch (err) {
  //     console.error('Schedule update error:', err);
  //     setError(err.message || 'Failed to update shift');
  //   }
  // };

  const handleCellClick = (therapistId, date) => {
    // Toggle selection if clicking the same cell, otherwise select the new cell
    if (selectedCell && 
        selectedCell.therapistId === therapistId && 
        format(selectedCell.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')) {
      setSelectedCell(null);
    } else {
      setSelectedCell({ therapistId, date });
    }
  };

  const getTherapistShift = (therapistId, date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const schedule = schedules.find(s => 
      s.therapistId === therapistId && 
      s.date === dateStr
    );
    return schedule?.shift || '';
  };
  
  // Success message component
  const SuccessMessage = () => (
    <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-slide-up">
      <svg 
        className="w-5 h-5" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M5 13l4 4L19 7" 
        />
      </svg>
      <span>Operation completed successfully</span>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Schedule Management</h1>
            <div className="text-sm text-gray-600">
              {branch?.name} ({branchCode})
            </div>
          </div>

          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setCurrentDate(prev => addDays(prev, -7))}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-500" />
              <span className="font-medium text-lg">
                {format(currentDate, 'MMMM d, yyyy')}
              </span>
            </div>

            <button
              onClick={() => setCurrentDate(prev => addDays(prev, 7))}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <QuickActions 
            onClearDay={handleClearDay}
            onClearAllSchedules={handleClearAllSchedules}
            onCopyPrevious={handleCopyPrevious}
            onOpenSettings={() => {}}
          />

          <ShiftLegend />
        </div>

        <div className="mb-4 p-3 bg-gray-50 rounded">
          <p className="text-sm text-gray-600">
            <strong>Keyboard Controls:</strong> Click on a cell and press 1, 2, M, or X to assign shifts. 
            When setting X (Leave), shift 1 will be auto-assigned before and shift 2 after.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="p-3 border-b bg-gray-50 text-left w-48">
                  NAMA
                </th>
                {getDates().map(date => (
                  <th 
                    key={date.toISOString()} 
                    className={`p-3 border-b text-center min-w-[120px] ${
                      [0, 6].includes(date.getDay()) ? 'bg-blue-50' : 'bg-gray-50'
                    }`}
                  >
                    <div className="font-medium">
                      {format(date, 'EEE, MMM d')}
                    </div>
                    <div className="text-xs text-gray-500">
                      {[0, 6].includes(date.getDay()) ? 'Weekend' : 'Weekday'}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {therapists.map(therapist => (
                <tr key={therapist.id} className="group">
                  <td className="p-3 border-b font-medium bg-amber-100">
                    {therapist.name}
                  </td>
                  {getDates().map(date => {
                    const shift = getTherapistShift(therapist.id, date);
                    return (
                      <td 
                        key={date.toISOString()}
                        className={`p-3 border-b border-r text-center ${
                          selectedCell && 
                          selectedCell.therapistId === therapist.id && 
                          format(selectedCell.date, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd') 
                            ? 'bg-blue-100' // Highlight selected cell
                            : ''
                        }`}
                        onClick={() => handleCellClick(therapist.id, date)}
                      >
                        {shift && <ShiftBadge code={shift} className="w-full" />}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Success Message */}
      {showSuccess && <SuccessMessage />}

      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
    </div>
  );
};

export default ScheduleManagement;