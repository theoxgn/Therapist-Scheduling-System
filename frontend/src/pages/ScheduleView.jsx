import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ScheduleGrid from '../components/ScheduleGrid';
import WeekSelector from '../components/WeekSelector';
import api from '../services/api';

function ScheduleView() {
  const [schedules, setSchedules] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { branchCode } = useParams();
  const navigate = useNavigate();

  // Function to calculate date range
  const getDateRange = useCallback((baseDate) => {
    const startDate = new Date(baseDate);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 13);
    
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
  }, []);

  // Memoize fetchSchedules function with error handling
  const fetchSchedules = useCallback(async (dateRange) => {
    setIsLoading(true);
    setError(null);

    try {
      // Validate branchCode
      if (!branchCode) {
        throw new Error('Branch code is required');
      }

      const result = await api.schedules.getByDateRange(
        branchCode,
        dateRange.startDate,
        dateRange.endDate
      );

      if (result.success) {
        setSchedules(result.data);
      } else {
        // Handle specific error cases
        if (result.details?.status === 404) {
          setError('Branch not found. Please check the branch code.');
        } else if (result.details?.status === 401) {
          // Handle unauthorized access
          navigate('/login');
        } else if (result.details?.status === 500) {
          setError('Server error occurred. Please try again later.');
        } else {
          setError(result.error);
        }

        // Log error for debugging
        console.error('Schedule fetch failed:', result.details);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Schedule fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [branchCode, navigate]);

  // Initial fetch on mount and when date/branch changes
  useEffect(() => {
    const dateRange = getDateRange(selectedDate);
    fetchSchedules(dateRange);
  }, [selectedDate, fetchSchedules, getDateRange]);

  const handleRetry = useCallback(() => {
    const dateRange = getDateRange(selectedDate);
    fetchSchedules(dateRange);
  }, [fetchSchedules, getDateRange, selectedDate]);

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-bold">Error</p>
              <p className="text-sm">{error}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleRetry}
                className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded text-sm"
              >
                Retry
              </button>
              <button
                className="text-red-400 hover:text-red-600"
                onClick={() => setError(null)}
              >
                <span className="sr-only">Dismiss</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6">
        <WeekSelector 
          selectedDate={selectedDate} 
          onDateChange={setSelectedDate}
        />
      </div>

      {!isLoading && !error && schedules.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="text-lg">No schedules found for this period</p>
          <p className="mt-2">Try selecting a different date range.</p>
        </div>
      ) : (
        <ScheduleGrid 
          schedules={schedules} 
          selectedDate={selectedDate}
          onUpdateSchedule={async (scheduleId, updateData) => {
            const dateRange = getDateRange(selectedDate);
            const result = await api.schedules.update(scheduleId, updateData);
            if (result.success) {
              await fetchSchedules(dateRange);
            } else {
              setError(result.error);
            }
          }}
          onRequestLeave={async (leaveData) => {
            const result = await api.schedules.requestLeave(leaveData);
            if (result.success) {
              const dateRange = getDateRange(selectedDate);
              await fetchSchedules(dateRange);
            }
            return result;
          }}
        />
      )}
    </div>
  );
}

export default ScheduleView;