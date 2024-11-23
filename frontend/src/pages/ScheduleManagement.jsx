// src/pages/ScheduleManagement.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Info, 
  X as XIcon,
  UserPlus,
  Trash2,
  Copy,
  Settings
} from 'lucide-react';
import api from '../services/api';
import "react-datepicker/dist/react-datepicker.css";

// Therapist Selection Modal Component
const TherapistSelectModal = ({ onClose, onSelect, date, shift, therapists }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Select Therapist</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2">
          {therapists.map(therapist => (
            <button
              key={therapist.id}
              onClick={() => onSelect(therapist.id)}
              className="w-full p-3 text-left hover:bg-gray-50 rounded border transition-colors"
            >
              <div className="font-medium">{therapist.name}</div>
              <div className="text-sm text-gray-500 flex items-center gap-2">
                <span>{therapist.gender === 'male' ? 'Male' : 'Female'}</span>
                {therapist.specialization && (
                  <span className="text-blue-500">• {therapist.specialization}</span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

function ScheduleManagement() {
  // State management
  const [schedules, setSchedules] = useState([]);
  const [therapists, setTherapists] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [branch, setBranch] = useState(null);
  const [selectedCell, setSelectedCell] = useState(null);
  const [showTherapistSelect, setShowTherapistSelect] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const { branchCode } = useParams();
  const navigate = useNavigate();

  // Constants
  const SHIFTS = {
    SHIFT_1: { code: '1', label: 'Morning', time: '09:00 - 18:00', color: 'blue' },
    MIDDLE: { code: 'M', label: 'Middle', time: '11:30 - 20:30', color: 'green' },
    SHIFT_2: { code: '2', label: 'Evening', time: '13:00 - 22:00', color: 'purple' },
    LEAVE: { code: 'X', label: 'Leave', time: 'Leave Request', color: 'yellow' }
  };

  // Fetch branch details
  const fetchBranch = useCallback(async () => {
    try {
      const result = await api.branches.getOne(branchCode);
      if (result.success) {
        setBranch(result.data);
      } else {
        setError('Branch not found');
        navigate('/branches');
      }
    } catch (err) {
      console.error('Error fetching branch:', err);
      setError('Failed to load branch details');
    }
  }, [branchCode, navigate]);

  // Fetch schedules and therapists
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Get therapists for this branch
      const therapistsResult = await api.therapists.getByBranch(branchCode);
      if (therapistsResult.success) {
        setTherapists(therapistsResult.data);
      } else {
        throw new Error(therapistsResult.error);
      }

      // Calculate two-week range
      const startDate = getStartDate(selectedDate);
      const endDate = getEndDate(startDate);

      // Get schedules for the date range
      const schedulesResult = await api.schedules.getByDateRange(
        branchCode,
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      );

      if (schedulesResult.success) {
        setSchedules(schedulesResult.data);
      } else {
        throw new Error(schedulesResult.error);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to load schedule data');
    } finally {
      setIsLoading(false);
    }
  }, [branchCode, selectedDate]);

  // Date utilities
  const getStartDate = (date) => {
    const startDate = new Date(date);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    return startDate;
  };

  const getEndDate = (startDate) => {
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 13);
    return endDate;
  };

  const getDates = useCallback(() => {
    const dates = [];
    const startDate = getStartDate(selectedDate);
    
    for (let i = 0; i < 14; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    return dates;
  }, [selectedDate]);

  // Format utilities
  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  // Schedule management
  const handleCellClick = useCallback((date, shift) => {
    setSelectedCell({ date, shift });
    setShowTherapistSelect(true);
  }, []);

  const validateSchedule = async (date, shift, therapistId) => {
    if (!branch) return { valid: false, message: 'Branch data not loaded' };
  
    try {
      const dateObj = new Date(date);
      const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
      const therapist = therapists.find(t => t.id === therapistId);
      const daySchedules = schedules.filter(s => s.date === date);
  
      // Block weekends and holidays for leave requests
      if (shift === SHIFTS.LEAVE.code && isWeekend) {
        return {
          valid: false,
          message: 'Leave requests not allowed for weekends'
        };
      }
  
      // Check staff requirements
      const staffInShift = daySchedules.filter(s => s.shift === shift).length;
      const minStaff = isWeekend ? 4 : 2;
      const maxStaff = isWeekend ? 5 : 3;
  
      if (staffInShift >= maxStaff) {
        return {
          valid: false,
          message: `Maximum ${maxStaff} therapists allowed in this shift`
        };
      }
  
      // Check male therapist requirements
      const maleTherapistsInShift = daySchedules.filter(s => 
        s.shift === shift && 
        therapists.find(t => t.id === s.therapistId)?.gender === 'male'
      ).length;
  
      if ((shift === SHIFTS.SHIFT_1.code || shift === SHIFTS.MIDDLE.code) && 
          maleTherapistsInShift === 0 && 
          therapist.gender !== 'male') {
        return {
          valid: false,
          message: 'At least one male therapist required in Shift 1 and Middle shift'
        };
      }
  
      // Check branch-specific rules
      if (branch.branchCode === 'DARMO') {
        if (shift === SHIFTS.SHIFT_1.code && staffInShift >= 3) {
          return {
            valid: false,
            message: 'Darmo branch: Maximum 3 therapists in Shift 1'
          };
        }
      }
  
      if (branch.branchCode === 'DIENG') {
        if (therapist.gender === 'male' && !isWeekend) {
          return {
            valid: false,
            message: 'Dieng branch: Male therapists can only be scheduled on weekends'
          };
        }
      }
  
      // Validate leave requests for male therapists
      if (shift === SHIFTS.LEAVE.code && therapist.gender === 'male') {
        const maleTherapistsOnLeave = daySchedules.filter(s => 
          s.shift === SHIFTS.LEAVE.code && 
          therapists.find(t => t.id === s.therapistId)?.gender === 'male'
        ).length;
  
        if (maleTherapistsOnLeave >= 2) {
          return {
            valid: false,
            message: 'Maximum 2 male therapists can take leave on the same day'
          };
        }
      }
  
      return { valid: true };
    } catch (err) {
      console.error('Validation error:', err);
      return {
        valid: false,
        message: 'Error validating schedule'
      };
    }
  };

  const handleTherapistSelect = useCallback(async (therapistId) => {
    if (!selectedCell) return;

    try {
      const validation = await validateSchedule(
        selectedCell.date,
        selectedCell.shift,
        therapistId
      );

      if (!validation.valid) {
        setError(validation.message);
        setShowTherapistSelect(false);
        setSelectedCell(null);
        return;
      }

      await handleScheduleUpdate(therapistId, selectedCell.date, selectedCell.shift);
      setShowTherapistSelect(false);
      setSelectedCell(null);
    } catch (err) {
      setError('Failed to assign therapist');
    }
  }, [selectedCell]);

  const handleScheduleUpdate = async (therapistId, date, shift) => {
    try {
        const existingSchedule = schedules.find(s => 
          s.therapistId === therapistId && 
          s.date === date
        );
    
        if (existingSchedule) {
          const result = await api.schedules.update(existingSchedule.id, {
            shift,
            date,
            therapistId
          });
          if (!result.success) {
            setError(result.error);
            return;
          }
        } else {
          const result = await api.schedules.create({
            shift,
            date,
            therapistId
          });
          if (!result.success) {
            setError(result.error);
            return;
          }
        }
    
        await fetchData();
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000); // Hide after 3 seconds
      } catch (err) {
        setError('Failed to update schedule');
      }
  };

  useEffect(() => {
    let timer;
    if (showSuccess) {
      timer = setTimeout(() => setShowSuccess(false), 3000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [showSuccess]);

  const handleRemoveTherapist = useCallback(async (scheduleId) => {
    try {
      const confirmDelete = window.confirm('Are you sure you want to remove this therapist from the schedule?');
      if (!confirmDelete) return;
  
      setIsLoading(true);
      const result = await api.schedules.delete(scheduleId);
      
      if (result.success) {
        await fetchData();
        // Show success message
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        setError(result.error || 'Failed to remove therapist');
      }
    } catch (err) {
      console.error('Error removing therapist:', err);
      setError('Failed to remove therapist from schedule');
    } finally {
      setIsLoading(false);
    }
  }, [fetchData]);

  // Quick Actions
  const handleClearDay = async (date) => {
    try {
      if (window.confirm('Clear all schedules for this day?')) {
        const result = await api.schedules.clearDay(branchCode, date);
        if (result.success) {
          await fetchData();
        } else {
          setError(result.error);
        }
      }
    } catch (err) {
      setError('Failed to clear schedules');
    }
  };

  const handleCopyPreviousWeek = async () => {
    try {
      if (window.confirm('Copy schedules from previous week?')) {
        const result = await api.schedules.copyPreviousWeek(branchCode, selectedDate);
        if (result.success) {
          await fetchData();
        } else {
          setError(result.error);
        }
      }
    } catch (err) {
      setError('Failed to copy schedules');
    }
  };

  // Effects
  useEffect(() => {
    fetchBranch();
  }, [fetchBranch]);

  useEffect(() => {
    if (branch) {
      fetchData();
    }
  }, [fetchData, branch]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Return your existing JSX with the updated components...
  return (
    <div className="container mx-auto p-4">
      {/* Error Message */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">{error}</span>
          <button
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
            onClick={() => setError(null)}
          >
            <span className="sr-only">Dismiss</span>
            <XIcon className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Schedule Management</h1>
            <div className="text-sm text-gray-600">
              {branch?.name} ({branchCode})
            </div>
          </div>

          {/* Date Navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => {
                const newDate = new Date(selectedDate);
                newDate.setDate(newDate.getDate() - 7);
                setSelectedDate(newDate);
              }}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-500" />
              <DatePicker
                selected={selectedDate}
                onChange={date => setSelectedDate(date)}
                dateFormat="MMMM d, yyyy"
                className="p-2 border rounded"
              />
            </div>

            <button
              onClick={() => {
                const newDate = new Date(selectedDate);
                newDate.setDate(newDate.getDate() + 7);
                setSelectedDate(newDate);
              }}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <button
              onClick={() => handleClearDay(selectedDate.toISOString().split('T')[0])}
              className="p-3 border rounded hover:bg-gray-50 flex flex-col items-center gap-1"
            >
              <Trash2 className="w-5 h-5 text-gray-600" />
              <span className="text-sm">Clear Day</span>
            </button>
            <button
              onClick={handleCopyPreviousWeek}
              className="p-3 border rounded hover:bg-gray-50 flex flex-col items-center gap-1"
            >
              <Copy className="w-5 h-5 text-gray-600" />
              <span className="text-sm">Copy Previous Week</span>
            </button>
            <button
              className="p-3 border rounded hover:bg-gray-50 flex flex-col items-center gap-1"
            >
              <Settings className="w-5 h-5 text-gray-600" />
              <span className="text-sm">Settings</span>
            </button>
          </div>
        </div>

        {/* Shift Legend */}
        <div className="px-4 pb-4">
          <div className="flex flex-wrap gap-4 text-sm">
            {Object.values(SHIFTS).map(shift => (
              <div key={shift.code} className="flex items-center gap-2">
                <span className={`w-6 h-6 flex items-center justify-center rounded bg-${shift.color}-100 text-${shift.color}-700`}>
                  {shift.code}
                </span>
                <span>{shift.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Schedule Grid */}
      {therapists.length > 0 ? (
        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead>
              <tr>
                <th className="p-3 border-b bg-gray-50 text-left">Shift</th>
                {getDates().map(date => (
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
              {Object.values(SHIFTS).slice(0, 3).map(shift => (
                <tr key={shift.code}>
                <td className="p-3 border-b font-medium">
                  {shift.label} ({shift.code})
                </td>
                {getDates().map(date => {
                  const dateStr = date.toISOString().split('T')[0];
                  const cellSchedules = schedules.filter(s => 
                    s.date === dateStr && s.shift === shift.code
                  );
                  return (
                    <td 
                      key={date.toISOString()}
                      className="p-3 border-b border-r"
                    >
                      <div className="min-h-[100px] relative group">
                      {cellSchedules.map(schedule => {
                        const therapist = therapists.find(t => t.id === schedule.therapistId);
                        return (
                            <div 
                            key={schedule.id}
                            className={`mb-1 p-2 rounded text-sm bg-${shift.color}-100 text-${shift.color}-700 flex justify-between items-center group relative`} // Tambahkan relative
                            >
                            <div className="flex items-center gap-2">
                                <span>{therapist?.name}</span>
                                {therapist?.gender === 'male' && (
                                <span className="text-xs bg-blue-200 text-blue-700 px-1.5 py-0.5 rounded">M</span>
                                )}
                            </div>
                            <button 
                                onClick={(e) => {
                                e.stopPropagation(); // Mencegah event bubbling
                                e.preventDefault();
                                handleRemoveTherapist(schedule.id);
                                }}
                                className="absolute right-2 opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-opacity duration-200 p-1 rounded hover:bg-red-100"
                            >
                                <XIcon className="w-4 h-4" />
                            </button>
                            </div>
                        );
                        })}
                        {/* Add Therapist button */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <button 
                                className={`bg-${shift.color}-500 text-white px-3 py-1 rounded text-sm hover:bg-${shift.color}-600 flex items-center gap-1 z-10`}
                                onClick={(e) => {
                                e.stopPropagation();
                                handleCellClick(dateStr, shift.code);
                                }}
                            >
                                <UserPlus className="w-4 h-4" />
                                Add Therapist
                            </button>
                            </div>
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black bg-opacity-5">
                          <button 
                            className={`bg-${shift.color}-500 text-white px-3 py-1 rounded text-sm hover:bg-${shift.color}-600 flex items-center gap-1`}
                            onClick={() => handleCellClick(dateStr, shift.code)}
                          >
                            <UserPlus className="w-4 h-4" />
                            Add Therapist
                          </button>
                        </div>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : (
      <div className="text-center py-8 text-gray-500">
        <p className="text-lg">No therapists found</p>
        <p className="mt-2">Add therapists to start managing schedules</p>
      </div>
    )}

    {/* Therapist Selection Modal */}
    {showTherapistSelect && selectedCell && (
      <TherapistSelectModal
        onClose={() => {
          setShowTherapistSelect(false);
          setSelectedCell(null);
        }}
        onSelect={handleTherapistSelect}
        date={selectedCell.date}
        shift={selectedCell.shift}
        therapists={therapists.filter(therapist => {
          // Filter out therapists already scheduled for this date
          const existingSchedule = schedules.find(s => 
            s.therapistId === therapist.id && 
            s.date === selectedCell.date
          );
          return !existingSchedule;
        })}
      />
    )}

    {/* Success Message */}
    {showSuccess && (
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
            <span>Schedule updated successfully</span>
        </div>
        )}
  </div>
);
}

export default ScheduleManagement;