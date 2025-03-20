// File: src/pages/ScheduleManagement.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { format } from 'date-fns';
import { useParams, useNavigate } from 'react-router-dom';
import { Settings } from 'lucide-react';
import api from '../services/api';
import ScheduleHeader from '../components/schedule/ScheduleHeader';
import ScheduleTable from '../components/schedule/ScheduleTable';
import ShiftLegend from '../components/schedule/ShiftLegend';
import QuickActions from '../components/schedule/QuickActions';
import SuccessMessage from '../components/common/SuccessMessage';

// Define shifts data to be used throughout the component
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

const ScheduleManagement = () => {
  // State management
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
  const [slotOccupancy, setSlotOccupancy] = useState({});
  
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
        const remaining = shiftSettings[settingsType].shift1.min - shift1Schedules.length;
        errors[`${dateStr}-shift1-min`] = `Need ${remaining} more therapist${remaining > 1 ? 's' : ''} for Shift 1`;
      }
      
      if (shiftMSchedules.length < shiftSettings[settingsType].shiftMiddle.min) {
        const remaining = shiftSettings[settingsType].shiftMiddle.min - shiftMSchedules.length;
        errors[`${dateStr}-shiftM-min`] = `Need ${remaining} more therapist${remaining > 1 ? 's' : ''} for Middle Shift`;
      }
      
      if (shift2Schedules.length < shiftSettings[settingsType].shift2.min) {
        const remaining = shiftSettings[settingsType].shift2.min - shift2Schedules.length;
        errors[`${dateStr}-shift2-min`] = `Need ${remaining} more therapist${remaining > 1 ? 's' : ''} for Shift 2`;
      }
      
      // Check maximum therapists for each shift
      if (shift1Schedules.length > shiftSettings[settingsType].shift1.max) {
        const excess = shift1Schedules.length - shiftSettings[settingsType].shift1.max;
        errors[`${dateStr}-shift1-max`] = `${excess} too many therapists assigned to Shift 1`;
      }
      
      if (shiftMSchedules.length > shiftSettings[settingsType].shiftMiddle.max) {
        const excess = shiftMSchedules.length - shiftSettings[settingsType].shiftMiddle.max;
        errors[`${dateStr}-shiftM-max`] = `${excess} too many therapists assigned to Middle Shift`;
      }
      
      if (shift2Schedules.length > shiftSettings[settingsType].shift2.max) {
        const excess = shift2Schedules.length - shiftSettings[settingsType].shift2.max;
        errors[`${dateStr}-shift2-max`] = `${excess} too many therapists assigned to Shift 2`;
      }
      
      // Check maximum leave requests per day
      if (leaveSchedules.length > shiftSettings.off.maxPerDay) {
        const excess = leaveSchedules.length - shiftSettings.off.maxPerDay;
        errors[`${dateStr}-leave-max`] = `${excess} too many therapists on leave`;
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
  }, [getDates, shiftSettings, therapists, schedules]);

  // Calculate slot occupancy 
  const calculateSlotOccupancy = useCallback(() => {
    if (!shiftSettings || schedules.length === 0) return {};
    
    const newSlotOccupancy = {};
    const dates = getDates();
    
    dates.forEach(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      const settingsType = isWeekend ? 'weekend' : 'weekday';
      
      // Get shifts for this date
      const shiftsOnDate = schedules.filter(s => s.date === dateStr);
      const shift1Count = shiftsOnDate.filter(s => s.shift === '1').length;
      const shiftMCount = shiftsOnDate.filter(s => s.shift === 'M').length;
      const shift2Count = shiftsOnDate.filter(s => s.shift === '2').length;
      const leaveCount = shiftsOnDate.filter(s => s.shift === 'X').length;
      
      newSlotOccupancy[dateStr] = {
        shift1: {
          current: shift1Count,
          min: shiftSettings[settingsType].shift1.min,
          max: shiftSettings[settingsType].shift1.max,
          remaining: shiftSettings[settingsType].shift1.max - shift1Count
        },
        shiftM: {
          current: shiftMCount,
          min: shiftSettings[settingsType].shiftMiddle.min,
          max: shiftSettings[settingsType].shiftMiddle.max,
          remaining: shiftSettings[settingsType].shiftMiddle.max - shiftMCount
        },
        shift2: {
          current: shift2Count,
          min: shiftSettings[settingsType].shift2.min,
          max: shiftSettings[settingsType].shift2.max,
          remaining: shiftSettings[settingsType].shift2.max - shift2Count
        },
        leave: {
          current: leaveCount,
          max: shiftSettings.off.maxPerDay,
          remaining: shiftSettings.off.maxPerDay - leaveCount
        }
      };
    });
    
    setSlotOccupancy(newSlotOccupancy);
    return newSlotOccupancy;
  }, [getDates, schedules, shiftSettings]);

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
        // We'll do this in a separate useEffect to avoid the circular dependency
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

  // Update validation and slot occupancy when data changes
  useEffect(() => {
    if (shiftSettings && schedules.length > 0) {
      validateSchedules(schedules);
      calculateSlotOccupancy();
    }
  }, [shiftSettings, schedules, validateSchedules, calculateSlotOccupancy]);

  useEffect(() => {
    fetchBranch();
    fetchShiftSettings();
    fetchData();
  }, [fetchBranch, fetchShiftSettings, fetchData]);

  // Optimistic update function to update schedules locally without refetching
  const updateScheduleLocally = useCallback((therapistId, dateStr, shift) => {
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
    
    // Update slot occupancy and validation immediately after state updates
    setTimeout(() => {
      calculateSlotOccupancy();
      validateSchedules();
    }, 0);
  }, [branchCode, calculateSlotOccupancy, validateSchedules]);

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
        
        // Update slot occupancy
        setTimeout(() => calculateSlotOccupancy(), 0);
        
        setShowSuccess(true);
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
        
        // Update slot occupancy
        setTimeout(() => calculateSlotOccupancy(), 0);
        
        setShowSuccess(true);
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
    
    // Handle backspace key to delete cell value
    if (keyPressed === 'Backspace') {
      try {
        saveScrollPosition();
        
        const existingSchedule = schedules.find(s => 
          s.therapistId === therapistId && 
          s.date === dateStr
        );
        
        if (existingSchedule) {
          // Delete the schedule
          await api.schedules.delete(existingSchedule.id);
          
          // Update local state by removing the schedule
          setSchedules(prevSchedules => 
            prevSchedules.filter(s => s.id !== existingSchedule.id)
          );
          
          // Update validation and slot occupancy
          setTimeout(() => {
            validateSchedules();
            calculateSlotOccupancy();
          }, 0);
        }
      } catch (err) {
        console.error('Schedule deletion error:', err);
        setError(err.message || 'Failed to delete shift');
        
        // If there was an error, fetch the correct data
        await fetchData();
      } finally {
        setTimeout(restoreScrollPosition, 0);
      }
      return;
    }
    
    // Check if the pressed key is valid
    if (validKeys[keyPressed]) {
      const newShift = validKeys[keyPressed];
      
      try {
        saveScrollPosition();
        
        const existingSchedule = schedules.find(s => 
          s.therapistId === therapistId && 
          s.date === dateStr
        );
        
        // Check slot availability before updating
        if (newShift !== 'X') {
          const dateObj = new Date(dateStr);
          const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
          const settingsType = isWeekend ? 'weekend' : 'weekday';
          const shiftKey = newShift === '1' ? 'shift1' : 
                          newShift === 'M' ? 'shiftMiddle' : 'shift2';
                          
          // Count therapists with this shift on this day (excluding current therapist if already assigned)
          const currentShiftsCount = schedules.filter(s => 
            s.date === dateStr && 
            s.shift === newShift &&
            s.therapistId !== therapistId
          ).length;
          
          // Check if adding would exceed maximum
          if (currentShiftsCount >= shiftSettings[settingsType][shiftKey].max) {
            throw new Error(`Maximum ${shiftSettings[settingsType][shiftKey].max} therapists allowed for this shift`);
          }
        } else if (newShift === 'X') {
          // Check leave availability
          const currentLeaveCount = schedules.filter(s => 
            s.date === dateStr && 
            s.shift === 'X' &&
            s.therapistId !== therapistId
          ).length;
          
          if (currentLeaveCount >= shiftSettings.off.maxPerDay) {
            throw new Error(`Maximum ${shiftSettings.off.maxPerDay} therapists can be on leave per day`);
          }
        }
        
        // Optimistic UI update before API call
        updateScheduleLocally(therapistId, dateStr, newShift);
        
        // If setting to X (Leave Request), handle the special pattern
        if (newShift === 'X') {
          // Check against shift settings for leave
          const isWeekend = date.getDay() === 0 || date.getDay() === 6;
          
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
        
        // Update validation and slot occupancy after the change
        setTimeout(() => {
          validateSchedules();
          calculateSlotOccupancy();
        }, 0);
        
      } catch (err) {
        console.error('Schedule update error:', err);
        setError(err.message || 'Failed to update shift');
        
        // If there was an error, fetch the correct data
        await fetchData();
      } finally {
        setTimeout(restoreScrollPosition, 0);
      }
    }
  }, [selectedCell, schedules, branchCode, branch, therapists, shiftSettings, saveScrollPosition, restoreScrollPosition, updateScheduleLocally, fetchData, validateSchedules, calculateSlotOccupancy]);
  
  // Add this useEffect to handle keyboard events
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    
    // Cleanup function to remove event listener
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

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
  
  // Get remaining slots info for header display
  const getRemainingSlots = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const slotData = slotOccupancy[dateStr];
    
    if (!slotData) return null;
    
    return {
      shift1: slotData.shift1,
      shiftM: slotData.shiftM,
      shift2: slotData.shift2,
      leave: slotData.leave
    };
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto py-6 px-4">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Enhanced header with gradient background */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800">
            <ScheduleHeader 
              branchName={branch?.name}
              branchCode={branchCode}
              currentDate={currentDate}
              onDateChange={(newDate) => {
                saveScrollPosition();
                setCurrentDate(newDate);
              }}
            />
          </div>

          {/* Improved Quick Actions */}
          <div className="pt-4 px-4">
            <QuickActions 
              onClearDay={handleClearDay}
              onClearAllSchedules={handleClearAllSchedules}
              onCopyPrevious={handleCopyPrevious}
              onExportPDF={handleExportPDF}
              onOpenSettings={handleOpenSettings}
            />
          </div>

          {/* Enhanced Shift Legend */}
          <div className="px-4 pt-2">
            <ShiftLegend shifts={SHIFTS} />
          </div>
          
          {/* Settings status panel with improved design */}
          {shiftSettings && (
            <div className="mx-4 mb-4 p-4 bg-blue-50 rounded-lg flex justify-between items-center border border-blue-100">
              <div>
                <p className="text-sm font-medium text-blue-800 flex items-center">
                  <Settings className="w-4 h-4 mr-1" />
                  Shift Settings: {shiftSettings.settings?.type === 'default' ? 'Default' : 'Custom'}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Weekday: {shiftSettings.weekday.shift1.min}-{shiftSettings.weekday.shift1.max} therapists per shift | 
                  Weekend: {shiftSettings.weekend.shift1.min}-{shiftSettings.weekend.shift1.max} therapists per shift | 
                  Max leave: {shiftSettings.off.maxPerDay} per day
                </p>
              </div>
              <button
                onClick={handleOpenSettings}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors flex items-center gap-1 shadow-sm"
              >
                <Settings className="w-4 h-4" />
                <span>Configure</span>
              </button>
            </div>
          )}

          {/* Improved help text box */}
          <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200 mx-4 flex items-start">
            {/* <Info className="w-5 h-5 text-gray-500 mr-2 flex-shrink-0 mt-0.5" /> */}
            <p className="text-sm text-gray-600">
              <strong>Keyboard Controls:</strong> Click on a cell and press 1, 2, M, or X to assign shifts. 
              Press <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-xs mx-1">Backspace</kbd> to clear a shift.
              When setting X (Leave), shift 1 will be auto-assigned before and shift 2 after.
            </p>
          </div>

          <div className="mx-4 mb-4">
            {showSuccess && <SuccessMessage />}

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg relative flex items-center">
                <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
                <button 
                  className="absolute top-3 right-3 text-red-700 hover:bg-red-100 p-1 rounded-full"
                  onClick={() => setError(null)}
                  aria-label="Dismiss"
                >
                  &times;
                </button>
              </div>
            )}
          </div>

          {/* Improved loading indicators */}
          {isBulkOperation && (
            <div className="flex justify-center items-center p-6 bg-white/80 rounded-lg mx-4 mb-4 border">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3" />
              <span className="text-blue-800 font-medium">Processing bulk operation...</span>
            </div>
          )}

          {isLoading && !isBulkOperation ? (
            <div className="flex justify-center items-center min-h-[300px]">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mr-3" />
              <span className="text-blue-800 font-medium">Loading schedule data...</span>
            </div>
          ) : (
            <div className="px-4 pb-6">
              <div className="border rounded-lg overflow-hidden shadow-sm">
                <ScheduleTable
                  therapists={therapists}
                  startDate={currentDate}
                  dates={getDates()}
                  getTherapistShift={getTherapistShift}
                  selectedCell={selectedCell}
                  onCellClick={handleCellClick}
                  validationErrors={validationErrors}
                  getDateValidationErrors={getDateValidationErrors}
                  getTherapistValidationErrors={getTherapistValidationErrors}
                  getRemainingSlots={getRemainingSlots}
                  shifts={SHIFTS}
                  tableContainerRef={tableContainerRef}
                />
              </div>
              
              {/* Keyboard shortcut reminder */}
              <div className="mt-4 text-sm text-gray-500 flex items-center justify-center flex-wrap gap-2">
                <span className="bg-gray-100 rounded px-2 py-1 font-mono">1</span>
                <span className="bg-gray-100 rounded px-2 py-1 font-mono">2</span>
                <span className="bg-gray-100 rounded px-2 py-1 font-mono">M</span>
                <span className="bg-gray-100 rounded px-2 py-1 font-mono">X</span>
                <span className="mr-4">to assign shifts</span>
                
                <span className="bg-gray-100 rounded px-2 py-1 font-mono">⌫</span>
                <span>to clear shifts</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScheduleManagement;