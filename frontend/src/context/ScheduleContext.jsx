import React, { createContext, useContext, useState, useCallback } from 'react';
import api from '../services/api';

const ScheduleContext = createContext(null);

export const ScheduleProvider = ({ children }) => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSchedules = useCallback(async (branchCode, startDate, endDate) => {
    setLoading(true);
    try {
      const response = await api.get('/schedules', {
        params: { branchCode, startDate, endDate }
      });
      setSchedules(response.data);
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch schedules');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const addSchedule = useCallback(async (scheduleData) => {
    try {
      const response = await api.post('/schedules', scheduleData);
      setSchedules(prev => [...prev, response.data]);
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to add schedule');
      throw error;
    }
  }, []);

  const updateSchedule = useCallback(async (id, scheduleData) => {
    try {
      const response = await api.put(`/schedules/${id}`, scheduleData);
      setSchedules(prev => 
        prev.map(schedule => 
          schedule.id === id ? response.data : schedule
        )
      );
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update schedule');
      throw error;
    }
  }, []);

  return (
    <ScheduleContext.Provider
      value={{
        schedules,
        loading,
        error,
        fetchSchedules,
        addSchedule,
        updateSchedule,
        setError
      }}
    >
      {children}
    </ScheduleContext.Provider>
  );
};

export const useSchedule = () => {
  const context = useContext(ScheduleContext);
  if (!context) {
    throw new Error('useSchedule must be used within a ScheduleProvider');
  }
  return context;
};