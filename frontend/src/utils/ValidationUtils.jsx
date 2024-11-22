import React from 'react';

export const ScheduleValidator = ({ schedules, branchSettings }) => {
  const validateShift = (shift) => {
    const shiftSchedules = schedules.filter(s => s.shift === shift);
    const maleTherapists = shiftSchedules.filter(s => s.Therapist.gender === 'male');

    const errors = [];
    if (shift === '1' && shiftSchedules.length >= branchSettings.maxTherapistsShift1) {
      errors.push('Maximum therapists for Shift 1 exceeded');
    }
    if (maleTherapists.length < 1) {
      errors.push('Minimum one male therapist required');
    }
    return errors;
  };

  return (
    <div className="validation-errors">
      {validateShift(schedules[0]?.shift).map((error, index) => (
        <div key={index} className="text-red-500">{error}</div>
      ))}
    </div>
  );
};