import React, { useState, useEffect, useCallback } from 'react';
import { format, addDays } from 'date-fns';
import { useParams } from 'react-router-dom';
import { Calendar, ChevronLeft, ChevronRight, FileDown, Loader2 } from 'lucide-react';
import api from '../services/api';

const SHIFTS = {
  '1': { 
    code: '1',
    label: 'Morning', 
    time: '09:00 - 18:00',
    color: 'bg-blue-100',
    textColor: 'text-blue-600'
  },
  'M': { 
    code: 'M',
    label: 'Middle', 
    time: '11:30 - 20:30',
    color: 'bg-green-100',
    textColor: 'text-green-600'
  },
  '2': { 
    code: '2',
    label: 'Evening', 
    time: '13:00 - 22:00',
    color: 'bg-purple-100',
    textColor: 'text-purple-600'
  },
  'X': { 
    code: 'X',
    label: 'Leave Request', 
    time: 'Leave Request',
    color: 'bg-yellow-100',
    textColor: 'text-yellow-600'
  }
};

const ShiftBadge = ({ code, className = '' }) => {
  const shift = SHIFTS[code];
  if (!shift) return null;
  
  return (
    <span 
      className={`
        ${shift.color} ${shift.textColor}
        px-3 py-1.5 rounded-md font-bold text-center
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

const ScheduleView = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [schedules, setSchedules] = useState([]);
  const [therapists, setTherapists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { branchCode } = useParams();
  const [branch, setBranch] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  // Fungsi untuk export PDF
  const handleExportPDF = async () => {
    try {
      setIsExporting(true);
      const dates = getDates();
      const startDate = dates[0].toISOString().split('T')[0];
      const endDate = dates[6].toISOString().split('T')[0];

      console.log('Exporting PDF with params:', { branchCode, startDate, endDate }); // Debug log

      const pdfBlob = await api.schedules.exportPDF({
        branchCode,
        startDate,
        endDate
      });

      //link
      const url = window.URL.createObjectURL(new Blob([pdfBlob]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `schedule-${branchCode}-${startDate}.pdf`;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
  

    } catch (err) {
      console.error('Export error:', err);
      setError('Failed to export schedule');
    } finally {
      setIsExporting(false);
    }
  };

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

  const getTherapistShift = (therapistId, date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const schedule = schedules.find(s => 
      s.therapistId === therapistId && 
      s.date === dateStr
    );
    return schedule?.shift || '';
  };

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
            <h1 className="text-2xl font-bold">Schedule View</h1>
            <div className="text-sm text-gray-600">
              {branch?.name} ({branchCode})
            </div>
          </div>
          <button
                onClick={handleExportPDF}
                disabled={isExporting}
                className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
              >
                {isExporting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <FileDown className="w-4 h-4" />
                )}
                Export PDF
              </button>

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

          <ShiftLegend />
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
                        className="p-3 border-b border-r text-center"
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

      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
    </div>
  );
};

export default ScheduleView;