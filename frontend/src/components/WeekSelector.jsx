import React from 'react';

function WeekSelector({ selectedDate, onDateChange }) {
  const moveWeek = (weeks) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + (weeks * 7));
    onDateChange(newDate);
  };

  const formatDateRange = () => {
    const startOfWeek = new Date(selectedDate);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 13);
    
    return `${startOfWeek.toLocaleDateString()} - ${endOfWeek.toLocaleDateString()}`;
  };

  return (
    <div className="flex justify-between items-center mb-4">
      <button
        onClick={() => moveWeek(-2)}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Previous
      </button>
      <span className="font-bold">{formatDateRange()}</span>
      <button
        onClick={() => moveWeek(2)}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Next
      </button>
    </div>
  );
}

export default WeekSelector;