import React, { useState, useEffect, useCallback, useRef } from 'react';
import { format, addDays } from 'date-fns';
import { useParams, useNavigate } from 'react-router-dom';
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
        cursor-pointer select-none min-w-[40px] min-h-[30px]
        flex items-center justify-center
        ${className}
      `}
    >
      {code}
    </span>
  );
};

const ShiftLegend = () => (
  <div className="flex flex-wrap gap-4 text-sm mb-6">
    {Object.entries(SHIFTS).map(([code, shift]) => (
      <div key={code} className="flex items-center gap-2 bg-white px-3 py-2 rounded shadow-sm">
        <div className={`w-8 h-8 flex items-center justify-center rounded-md font-bold ${
          code === '1' ? 'bg-blue-100 text-blue-600' :
          code === '2' ? 'bg-purple-100 text-purple-600' :
          code === 'M' ? 'bg-green-100 text-green-600' :
          'bg-yellow-100 text-yellow-600'
        }`}>
          {code}
        </div>
        <span className="text-gray-600">{shift.time}</span>
      </div>
    ))}
  </div>
);

const QuickActions = ({ onClearDay, onClearAllSchedules, onCopyPrevious, onExportPDF, onOpenSettings }) => (
  <div className="grid grid-cols-5 gap-4 mb-6">
    <button
      onClick={onClearDay}
      className="flex flex-col items-center justify-center gap-2 p-4 border rounded hover:bg-gray-50 transition-colors"
    >
      <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
      <span className="text-sm font-medium">Clear Day</span>
    </button>
    <button
      onClick={onClearAllSchedules}
      className="flex flex-col items-center justify-center gap-2 p-4 border rounded hover:bg-gray-50 transition-colors"
    >
      <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
      <span className="text-sm font-medium text-red-500">Clear All</span>
    </button>
    <button
      onClick={onCopyPrevious}
      className="flex flex-col items-center justify-center gap-2 p-4 border rounded hover:bg-gray-50 transition-colors"
    >
      <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
      </svg>
      <span className="text-sm font-medium">Copy Previous Week</span>
    </button>
    <button
      onClick={onExportPDF}
      className="flex flex-col items-center justify-center gap-2 p-4 border rounded hover:bg-gray-50 transition-colors"
    >
      <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <span className="text-sm font-medium text-blue-500">Export PDF</span>
    </button>
    <button
      onClick={onOpenSettings}
      className="flex flex-col items-center justify-center gap-2 p-4 border rounded hover:bg-gray-50 transition-colors"
    >
      <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
      <span className="text-sm font-medium">Settings</span>
    </button>
  </div>
);

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

// Validation message component
const ValidationMessage = ({ message, type = 'warning' }) => {
  const bgColor = type === 'error' ? 'bg-red-50' : 'bg-yellow-50';
  const borderColor = type === 'error' ? 'border-red-200' : 'border-yellow-200';
  const textColor = type === 'error' ? 'text-red-700' : 'text-yellow-700';

  return (
    <div className={`mt-2 ${bgColor} border ${borderColor} ${textColor} px-4 py-2 rounded-md text-sm`}>
      <div className="flex items-center gap-2">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
          />
        </svg>
        <span>{message}</span>
      </div>
    </div>
  );
};

const ScheduleManagement = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [schedules, setSchedules] = useState([]);
  const [therapists, setTherapists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { branchCode } = useParams();
  const navigate = useNavigate();
  const [branch, setBranch] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedCell, setSelectedCell] = useState(null);
  const [isBulkOperation, setIsBulkOperation] = useState(false);
  const [shiftSettings, setShiftSettings] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  
  // Refs for maintaining scroll position
  const scrollPositionRef = useRef(0);
  const tableContainerRef = useRef(null);

  // Save scroll position
  const saveScrollPosition = useCallback(() => {
    if (tableContainerRef.current) {
      scrollPositionRef.current = tableContainerRef.current.scrollTop;
    }
  }, []);

  // Restore scroll position
  const restoreScrollPosition = useCallback(() => {
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollTop = scrollPositionRef.current;
    }
  }, []);

  // Function to navigate to shift settings
  const handleOpenSettings = useCallback(() => {
    navigate(`/branches/${branchCode}/shift-settings`);
  }, [navigate, branchCode]);

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

  // Fetch shift settings
  const fetchShiftSettings = useCallback(async () => {
    try {
      const result = await api.shiftSettings.get(branchCode);
      if (result.success) {
        setShiftSettings(result.data);
        console.log('Shift settings loaded:', result.data);
      } else {
        console.warn('No shift settings found:', result.error);
        // Use default settings if none exist
        setShiftSettings({
          weekday: {
            shift1: { min: 2, max: 3 },
            shiftMiddle: { min: 2, max: 3 },
            shift2: { min: 2, max: 3 }
          },
          weekend: {
            shift1: { min: 4, max: 5 },
            shiftMiddle: { min: 4, max: 5 },
            shift2: { min: 4, max: 5 }
          },
          off: {
            maxPerDay: 2,
            maxConsecutive: 2,
            maxPerWeek: 1
          },
          settings: { type: 'default' }
        });
      }
    } catch (err) {
      console.error('Error fetching shift settings:', err);
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
      // Save scroll position before fetching new data
      saveScrollPosition();

      const therapistsResult = await api.therapists.getByBranch(branchCode);
      const dates = getDates();
      const startDate = format(dates[0], 'yyyy-MM-dd');
      const endDate = format(dates[6], 'yyyy-MM-dd');

      const schedulesResult = await api.schedules.getByDateRange(
        branchCode,
        startDate,
        endDate
      );

      if (therapistsResult.success && schedulesResult.success) {
        setTherapists(therapistsResult.data);
        setSchedules(schedulesResult.data);
        
        // After loading schedules, validate against shift settings
        validateSchedules(schedulesResult.data);
      } else {
        if (!therapistsResult.success) {
          console.error('Error fetching therapists:', therapistsResult.error);
        }
        if (!schedulesResult.success) {
          console.error('Error fetching schedules:', schedulesResult.error);
        }
        setError(schedulesResult.error || therapistsResult.error || 'Failed to load data');
      }
    } catch (err) {
      console.error('Error in fetchData:', err);
      setError('Failed to load schedule data');
    } finally {
      setIsLoading(false);
      // Restore scroll position after fetch completes
      setTimeout(restoreScrollPosition, 0);
    }
  }, [branchCode, getDates, saveScrollPosition, restoreScrollPosition]);

  useEffect(() => {
    fetchBranch();
    fetchShiftSettings();
    fetchData();
  }, [fetchBranch, fetchShiftSettings, fetchData]);

  // Validate schedules against shift settings
  const validateSchedules = useCallback((schedulesData = schedules) => {
    if (!shiftSettings) return;
    
    const errors = {};
    const dates = getDates();
    
    // For each date, check the shift requirements
    dates.forEach(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      const settingsType = isWeekend ? 'weekend' : 'weekday';
      
      // Group schedules by shift for this date
      const shiftsOnDate = schedulesData.filter(s => s.date === dateStr);
      const shift1Schedules = shiftsOnDate.filter(s => s.shift === '1');
      const shiftMSchedules = shiftsOnDate.filter(s => s.shift === 'M');
      const shift2Schedules = shiftsOnDate.filter(s => s.shift === '2');
      const leaveSchedules = shiftsOnDate.filter(s => s.shift === 'X');
      
      // Check minimum therapists for each shift
      if (shift1Schedules.length < shiftSettings[settingsType].shift1.min) {
        errors[`${dateStr}-shift1-min`] = `Need at least ${shiftSettings[settingsType].shift1.min} therapists for Shift 1`;
      }
      
      if (shiftMSchedules.length < shiftSettings[settingsType].shiftMiddle.min) {
        errors[`${dateStr}-shiftM-min`] = `Need at least ${shiftSettings[settingsType].shiftMiddle.min} therapists for Middle Shift`;
      }
      
      if (shift2Schedules.length < shiftSettings[settingsType].shift2.min) {
        errors[`${dateStr}-shift2-min`] = `Need at least ${shiftSettings[settingsType].shift2.min} therapists for Shift 2`;
      }
      
      // Check maximum therapists for each shift
      if (shift1Schedules.length > shiftSettings[settingsType].shift1.max) {
        errors[`${dateStr}-shift1-max`] = `Maximum ${shiftSettings[settingsType].shift1.max} therapists allowed for Shift 1`;
      }
      
      if (shiftMSchedules.length > shiftSettings[settingsType].shiftMiddle.max) {
        errors[`${dateStr}-shiftM-max`] = `Maximum ${shiftSettings[settingsType].shiftMiddle.max} therapists allowed for Middle Shift`;
      }
      
      if (shift2Schedules.length > shiftSettings[settingsType].shift2.max) {
        errors[`${dateStr}-shift2-max`] = `Maximum ${shiftSettings[settingsType].shift2.max} therapists allowed for Shift 2`;
      }
      
      // Check maximum leave requests per day
      if (leaveSchedules.length > shiftSettings.off.maxPerDay) {
        errors[`${dateStr}-leave-max`] = `Maximum ${shiftSettings.off.maxPerDay} therapists can be on leave per day`;
      }
      
      // Check male therapist requirement
      const shift1MaleCount = shift1Schedules.filter(s => 
        therapists.find(t => t.id === s.therapistId)?.gender === 'male'
      ).length;
      
      const shiftMMaleCount = shiftMSchedules.filter(s => 
        therapists.find(t => t.id === s.therapistId)?.gender === 'male'
      ).length;
      
      if (shift1Schedules.length > 0 && shift1MaleCount < 1) {
        errors[`${dateStr}-shift1-male`] = 'At least 1 male therapist required for Shift 1';
      }
      
      if (shiftMSchedules.length > 0 && shiftMMaleCount < 1) {
        errors[`${dateStr}-shiftM-male`] = 'At least 1 male therapist required for Middle Shift';
      }
    });
    
    // Check consecutive leave days for therapists
    therapists.forEach(therapist => {
      let consecutiveLeave = 0;
      let totalLeave = 0;
      let lastLeaveDate = null;
      
      // Sort dates to ensure we check in order
      const sortedDates = getDates().sort((a, b) => a - b);
      
      sortedDates.forEach(date => {
        const dateStr = format(date, 'yyyy-MM-dd');
        const therapistSchedule = schedulesData.find(s => 
          s.therapistId === therapist.id && s.date === dateStr
        );
        
        if (therapistSchedule && therapistSchedule.shift === 'X') {
          totalLeave++;
          
          // Check if consecutive
          if (lastLeaveDate) {
            const lastDate = new Date(lastLeaveDate);
            const currentDate = new Date(dateStr);
            const dayDiff = Math.round((currentDate - lastDate) / (1000 * 60 * 60 * 24));
            
            if (dayDiff === 1) {
              consecutiveLeave++;
            } else {
              consecutiveLeave = 1;
            }
          } else {
            consecutiveLeave = 1;
          }
          
          lastLeaveDate = dateStr;
        } else {
          consecutiveLeave = 0;
          lastLeaveDate = null;
        }
        
        // Check against settings
        if (consecutiveLeave > shiftSettings.off.maxConsecutive) {
          errors[`${therapist.id}-consecutive-leave`] = `${therapist.name} has too many consecutive leave days`;
        }
      });
      
      // Check total leave per week
      if (totalLeave > shiftSettings.off.maxPerWeek) {
        errors[`${therapist.id}-total-leave`] = `${therapist.name} has too many leave days in this week`;
      }
    });
    
    setValidationErrors(errors);
  }, [getDates, shiftSettings, schedules, therapists]);

  // Check for validation errors when schedules or settings change
  useEffect(() => {
    if (shiftSettings && schedules.length > 0) {
      validateSchedules();
    }
  }, [shiftSettings, schedules, validateSchedules]);

  // Get validation errors for a specific date and shift
  const getShiftValidationErrors = (date, shift) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const keys = Object.keys(validationErrors).filter(key => 
      key.startsWith(`${dateStr}-${shift}`)
    );
    
    return keys.map(key => validationErrors[key]);
  };

  // Optimistic update function to update schedules locally without refetching
  const updateScheduleLocally = (therapistId, dateStr, shift) => {
    setSchedules(prevSchedules => {
      // Check if the schedule exists
      const existingScheduleIndex = prevSchedules.findIndex(s => 
        s.therapistId === therapistId && s.date === dateStr
      );
      
      // If it exists, update it
      if (existingScheduleIndex !== -1) {
        const updatedSchedules = [...prevSchedules];
        updatedSchedules[existingScheduleIndex] = {
          ...updatedSchedules[existingScheduleIndex],
          shift
        };
        return updatedSchedules;
      }
      
      // If it doesn't exist, add it
      return [...prevSchedules, {
        id: `temp-${Date.now()}`, // Temporary ID until server sync
        therapistId,
        date: dateStr,
        shift,
        branchCode
      }];
    });
  };

  const handleClearDay = async () => {
    if (!window.confirm('Are you sure you want to clear all schedules for this day?')) {
      return;
    }
  
    try {
      setIsBulkOperation(true);
      saveScrollPosition();
      const result = await api.schedules.clearDay(branchCode, currentDate);
      
      if (result.success) {
        // Get the date string for the current date
        const currentDateStr = format(currentDate, 'yyyy-MM-dd');
        
        // Optimistically update the UI by removing all schedules for this day
        setSchedules(prevSchedules => 
          prevSchedules.filter(schedule => schedule.date !== currentDateStr)
        );
        
        // Remove validation errors for this day
        setValidationErrors(prevErrors => {
          const newErrors = { ...prevErrors };
          Object.keys(newErrors).forEach(key => {
            if (key.startsWith(currentDateStr)) {
              delete newErrors[key];
            }
          });
          return newErrors;
        });
        
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        setError(result.error || 'Failed to clear schedules');
        // Fall back to refetching data if the optimistic update might be incorrect
        await fetchData();
      }
    } catch (err) {
      console.error('Clear day error:', err);
      setError('Failed to clear schedules');
      await fetchData();
    } finally {
      setIsBulkOperation(false);
      setTimeout(restoreScrollPosition, 0);
    }
  };

  const handleClearAllSchedules = async () => {
    if (!window.confirm('Are you sure you want to clear ALL schedules for this week? This action cannot be undone.')) {
      return;
    }
  
    try {
      setIsBulkOperation(true);
      saveScrollPosition();
      
      // Get the start and end dates of the current week
      const dates = getDates();
      const startDate = format(dates[0], 'yyyy-MM-dd');
      const endDate = format(dates[dates.length - 1], 'yyyy-MM-dd');
      
      const result = await api.schedules.clearAll(branchCode, startDate, endDate);
      
      if (result.success) {
        // Clear all schedules for the week in the local state
        setSchedules([]);
        
        // Reset validation errors since there are no schedules to validate
        setValidationErrors({});
        
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        setError(result.error || 'Failed to clear schedules for this week');
        await fetchData();
      }
    } catch (err) {
      console.error('Clear week schedules error:', err);
      setError('Failed to clear schedules for this week');
      await fetchData();
    } finally {
      setIsBulkOperation(false);
      setTimeout(restoreScrollPosition, 0);
    }
  };

  // Copy previous week's schedules
  const handleCopyPrevious = async () => {
    if (!window.confirm('Copy schedules from previous week?')) return;
    
    try {
      setIsBulkOperation(true);
      saveScrollPosition();
      
      // Get the current week's start date
      const dates = getDates();
      const currentWeekStart = format(dates[0], 'yyyy-MM-dd');
      
      // Calculate the previous week's dates
      const prevWeekStart = new Date(dates[0]);
      prevWeekStart.setDate(prevWeekStart.getDate() - 7);
      const prevWeekEnd = new Date(prevWeekStart);
      prevWeekEnd.setDate(prevWeekEnd.getDate() + 6);
      
      const prevStartStr = format(prevWeekStart, 'yyyy-MM-dd');
      const prevEndStr = format(prevWeekEnd, 'yyyy-MM-dd');
      
      console.log('Copying schedules from previous week:', { prevStartStr, prevEndStr, toWeekStart: currentWeekStart });
      
      // 1. Get the previous week's schedules
      const prevWeekResult = await api.schedules.getByDateRange(
        branchCode,
        prevStartStr,
        prevEndStr
      );
      
      if (!prevWeekResult.success) {
        throw new Error(prevWeekResult.error || 'Failed to fetch previous week schedules');
      }
      
      const prevWeekSchedules = prevWeekResult.data;
      
      if (prevWeekSchedules.length === 0) {
        setError('No schedules found for previous week to copy');
        setIsBulkOperation(false);
        setTimeout(restoreScrollPosition, 0);
        return;
      }
      
      // 2. Clear current week schedules first
      const clearResult = await api.schedules.clearDay(branchCode, currentDate);
      if (!clearResult.success) {
        console.warn('Warning: Failed to clear current schedules:', clearResult.error);
      }
      
      // 3. Create new schedules with the same pattern but shifted by 7 days
      let successCount = 0;
      const totalSchedules = prevWeekSchedules.length;
      
      for (const schedule of prevWeekSchedules) {
        // Calculate the new date (7 days later)
        const oldDate = new Date(schedule.date);
        const newDate = new Date(oldDate);
        newDate.setDate(newDate.getDate() + 7);
        const newDateStr = format(newDate, 'yyyy-MM-dd');
        
        // Create the new schedule
        const createResult = await api.schedules.create({
          branchCode,
          therapistId: schedule.therapistId,
          shift: schedule.shift,
          date: newDateStr
        });
        
        if (createResult.success) {
          successCount++;
        }
      }
      
      // Show success message
      console.log(`Copied ${successCount} of ${totalSchedules} schedules from previous week`);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      
      // Refresh the data to show the new schedules
      await fetchData();
    } catch (err) {
      console.error('Copy schedules error:', err);
      setError(err.message || 'Failed to copy schedules');
    } finally {
      setIsBulkOperation(false);
      setTimeout(restoreScrollPosition, 0);
    }
  };

  // Export PDF functionality
  const handleExportPDF = async () => {
    try {
      setIsBulkOperation(true);
      saveScrollPosition();
      
      // Get the current week's dates
      const dates = getDates();
      const startDate = format(dates[0], 'yyyy-MM-dd');
      const endDate = format(dates[dates.length - 1], 'yyyy-MM-dd');
      
      console.log('Exporting PDF with params:', { branchCode, startDate, endDate });
      
      // Call the exportPDF API
      const pdfBlob = await api.schedules.exportPDF({
        branchCode,
        startDate,
        endDate
      });

      // Create a download link
      const url = window.URL.createObjectURL(new Blob([pdfBlob]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `schedule-${branchCode}-${startDate}.pdf`;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error('Export PDF error:', err);
      setError('Failed to export schedule to PDF');
    } finally {
      setIsBulkOperation(false);
      setTimeout(restoreScrollPosition, 0);
    }
  };

  // Process key presses for schedule updates
  const handleKeyDown = useCallback(async (e) => {
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
        saveScrollPosition();
        
        const existingSchedule = schedules.find(s => 
          s.therapistId === therapistId && 
          s.date === dateStr
        );
        
        // Optimistic UI update before API call
        updateScheduleLocally(therapistId, dateStr, newShift);
        
        // If setting to X (Leave Request), handle the special pattern
        if (newShift === 'X') {
          // Check against shift settings for leave
          const isWeekend = date.getDay() === 0 || date.getDay() === 6;
          
          // Check if we're exceeding max leave per day
          const leavesOnDay = schedules.filter(s => 
            s.date === dateStr && 
            s.shift === 'X' && 
            s.therapistId !== therapistId
          ).length + 1;
          
          if (shiftSettings && leavesOnDay > shiftSettings.off.maxPerDay) {
            throw new Error(`Maximum ${shiftSettings.off.maxPerDay} therapists can be on leave per day`);
          }
          
          // Weekend leave restrictions - can be customized based on your requirements
          if (isWeekend && branch?.weekendOnlyMale) {
            const therapist = therapists.find(t => t.id === therapistId);
            if (therapist?.gender === 'male') {
              throw new Error('Male therapists cannot take leave on weekends at this branch');
            }
          }
          
          // Set up dates for the day before and after
          const prevDate = new Date(date);
          prevDate.setDate(prevDate.getDate() - 1);
          const prevDateStr = format(prevDate, 'yyyy-MM-dd');
          
          const nextDate = new Date(date);
          nextDate.setDate(nextDate.getDate() + 1);
          const nextDateStr = format(nextDate, 'yyyy-MM-dd');
          
          // Optimistically update adjacent days
          updateScheduleLocally(therapistId, prevDateStr, '1');
          updateScheduleLocally(therapistId, nextDateStr, '2');
          
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
        // For non-leave shifts, validate against shift settings
        else {
          if (shiftSettings) {
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;
            const settingsType = isWeekend ? 'weekend' : 'weekday';
            const shiftKey = newShift === '1' ? 'shift1' : 
                            newShift === 'M' ? 'shiftMiddle' : 'shift2';
                            
            // Count therapists with this shift on this day
            const shiftsOnDate = schedules.filter(s => 
              s.date === dateStr && 
              s.shift === newShift &&
              s.therapistId !== therapistId
            ).length + 1;
            
            // Check if exceeding maximum allowed
            if (shiftsOnDate > shiftSettings[settingsType][shiftKey].max) {
              throw new Error(`Maximum ${shiftSettings[settingsType][shiftKey].max} therapists allowed for this shift`);
            }
            
            // Male therapist requirement checks
            if ((newShift === '1' || newShift === 'M') && branch?.genderRestrictionFlag) {
              const therapist = therapists.find(t => t.id === therapistId);
              const maleTherapistsInShift = schedules.filter(s => 
                s.date === dateStr && 
                s.shift === newShift &&
                s.therapistId !== therapistId &&
                therapists.find(t => t.id === s.therapistId)?.gender === 'male'
              ).length;
              
              // If this is the only male therapist and removing would violate constraint
              if (therapist?.gender === 'male' && maleTherapistsInShift < 1) {
                const currentShift = existingSchedule?.shift;
                if (currentShift === newShift) {
                  // Just updating the same shift, no problem
                } else {
                  // Check if removing this therapist would leave no males
                  const otherMales = schedules.filter(s => 
                    s.date === dateStr && 
                    s.shift === currentShift &&
                    s.therapistId !== therapistId &&
                    therapists.find(t => t.id === s.therapistId)?.gender === 'male'
                  ).length;
                  
                  if (otherMales === 0 && schedules.filter(s => s.date === dateStr && s.shift === currentShift).length > 0) {
                    throw new Error(`Cannot remove the only male therapist from ${currentShift === '1' ? 'Shift 1' : 'Middle Shift'}`);
                  }
                }
              }
            }
          }
        }
        
        // Update current day's schedule
        if (existingSchedule) {
          await api.schedules.update(existingSchedule.id, {
            branchCode,
            shift: newShift,
            date: dateStr,
            therapistId
          });
        } else {
          await api.schedules.create({
            branchCode,
            shift: newShift,
            date: dateStr,
            therapistId
          });
        }
        
        // Validate the updated schedules
        validateSchedules();
        
      } catch (err) {
        console.error('Schedule update error:', err);
        setError(err.message || 'Failed to update shift');
        
        // If there was an error, fetch the correct data
        await fetchData();
      } finally {
        setTimeout(restoreScrollPosition, 0);
      }
    }
  }, [selectedCell, schedules, branchCode, branch, therapists, shiftSettings, saveScrollPosition, restoreScrollPosition, updateScheduleLocally, fetchData, validateSchedules]);

  // Add this useEffect to handle keyboard events
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    
    // Cleanup function to remove event listener
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]); // Include all dependencies

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
  
  // Get validation errors for a specific date
  const getDateValidationErrors = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const keys = Object.keys(validationErrors).filter(key => 
      key.startsWith(`${dateStr}`)
    );
    
    return keys.map(key => validationErrors[key]);
  };
  
  // Get validation errors for a specific therapist
  const getTherapistValidationErrors = (therapistId) => {
    const keys = Object.keys(validationErrors).filter(key => 
      key.startsWith(`${therapistId}`)
    );
    
    return keys.map(key => validationErrors[key]);
  };

  if (isLoading && !isBulkOperation) {
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
              onClick={() => {
                saveScrollPosition();
                setCurrentDate(prev => addDays(prev, -7));
              }}
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
              onClick={() => {
                saveScrollPosition();
                setCurrentDate(prev => addDays(prev, 7));
              }}
              className="p-2 hover:bg-gray-100 rounded-full w-10 h-10 flex items-center justify-center"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <QuickActions 
            onClearDay={handleClearDay}
            onClearAllSchedules={handleClearAllSchedules}
            onCopyPrevious={handleCopyPrevious}
            onExportPDF={handleExportPDF}
            onOpenSettings={handleOpenSettings}
          />

          <ShiftLegend />
          
          {/* Display shift settings status */}
          {shiftSettings && (
            <div className="mb-4 p-3 bg-gray-100 rounded-lg flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Shift Settings: {shiftSettings.settings?.type === 'default' ? 'Default' : 'Custom'}
                </p>
                <p className="text-xs text-gray-500">
                  Weekday: {shiftSettings.weekday.shift1.min}-{shiftSettings.weekday.shift1.max} therapists per shift | 
                  Weekend: {shiftSettings.weekend.shift1.min}-{shiftSettings.weekend.shift1.max} therapists per shift | 
                  Max leave: {shiftSettings.off.maxPerDay} per day
                </p>
              </div>
              <button
                onClick={handleOpenSettings}
                className="px-3 py-1 bg-blue-100 text-blue-600 rounded-md text-sm hover:bg-blue-200 transition-colors flex items-center gap-1"
              >
                <Settings className="w-4 h-4" />
                <span>Configure</span>
              </button>
            </div>
          )}
        </div>

        <div className="mb-4 p-3 bg-gray-50 rounded">
          <p className="text-sm text-gray-600">
            <strong>Keyboard Controls:</strong> Click on a cell and press 1, 2, M, or X to assign shifts. 
            When setting X (Leave), shift 1 will be auto-assigned before and shift 2 after.
          </p>
        </div>

        <div className="mb-4 p-3 bg-gray-50 rounded">
        {/* Success Message */}
        {showSuccess && <SuccessMessage />}

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
            <button 
              className="float-right text-red-700"
              onClick={() => setError(null)}
            >
              &times;
            </button>
          </div>
        )}
        </div>


        {isBulkOperation && (
          <div className="flex justify-center items-center p-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2" />
            <span>Processing...</span>
          </div>
        )}

        {/* Show validation error summary if there are errors */}
        {Object.keys(validationErrors).length > 0 && (
          <div className="p-4 mb-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="text-yellow-800 font-medium mb-2 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                />
              </svg>
              <span>Schedule Validation Issues</span>
            </h3>
            <p className="text-sm text-yellow-700 mb-2">
              The current schedule has some issues based on your shift settings. These don't prevent saving, but you may want to address them:
            </p>
            <ul className="text-sm text-yellow-700 list-disc pl-5 max-h-32 overflow-y-auto">
              {Object.values(validationErrors).slice(0, 5).map((error, index) => (
                <li key={index}>{error}</li>
              ))}
              {Object.values(validationErrors).length > 5 && (
                <li>...and {Object.values(validationErrors).length - 5} more issues</li>
              )}
            </ul>
          </div>
        )}

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
                {getDates().map(date => {
                  const dateErrors = getDateValidationErrors(date);
                  const hasErrors = dateErrors.length > 0;
                  
                  return (
                    <th 
                      key={date.toISOString()} 
                      className={`p-3 border-b text-center min-w-[120px] ${
                        [0, 6].includes(date.getDay()) ? 'bg-blue-50' : 'bg-gray-50'
                      } ${hasErrors ? 'border-yellow-300' : ''}`}
                    >
                      <div className="font-medium">
                        {format(date, 'EEE, MMM d')}
                      </div>
                      <div className="text-xs text-gray-500">
                        {[0, 6].includes(date.getDay()) ? 'Weekend' : 'Weekday'}
                      </div>
                      {hasErrors && (
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
                      <div className="flex items-center justify-between">
                        <span>{therapist.name}</span>
                        {therapist.gender === 'male' && (
                          <span className="px-1.5 py-0.5 text-xs bg-blue-100 text-blue-600 rounded">M</span>
                        )}
                      </div>
                      {hasTherapistErrors && (
                        <div className="text-xs text-amber-800 mt-1">
                          {therapistErrors[0]}
                        </div>
                      )}
                    </td>
                    {getDates().map(date => {
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
                      const hasCellError = cellErrorKeys.length > 0;
                      
                      return (
                        <td 
                          key={date.toISOString()}
                          className={`p-3 border-b border-r text-center ${
                            isSelected ? 'bg-blue-100' : hasCellError ? 'bg-red-50' : ''
                          }`}
                          onClick={() => handleCellClick(therapist.id, date)}
                        >
                          {shift && (
                            <div className="relative">
                              <ShiftBadge code={shift} className="w-full" />
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
      </div>
    </div>
  );
};

export default ScheduleManagement;