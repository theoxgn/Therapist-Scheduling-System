import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ScheduleGrid from '../components/ScheduleGrid';
import WeekSelector from '../components/WeekSelector';
import api from '../services/api';

function ScheduleView() {
  const [schedules, setSchedules] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { branchCode } = useParams();

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const startDate = new Date(selectedDate);
        startDate.setDate(startDate.getDate() - startDate.getDay());
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 13);

        const response = await api.get('/schedules', {
          params: {
            branchCode,
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0]
          }
        });
        setSchedules(response.data);
      } catch (error) {
        console.error('Error fetching schedules:', error);
      }
    };
    fetchSchedules();
  }, [branchCode, selectedDate]);

  return (
    <div className="container mx-auto p-4">
      <WeekSelector selectedDate={selectedDate} onDateChange={setSelectedDate} />
      <ScheduleGrid schedules={schedules} selectedDate={selectedDate} />
    </div>
  );
}

export default ScheduleView;