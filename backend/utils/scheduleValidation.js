const { Schedule, Therapist, Branch } = require('../models');
const { Op } = require('sequelize');

const validateSchedule = async (scheduleData) => {
  const { therapistId, date, shift } = scheduleData;

  // Get therapist and branch info
  const therapist = await Therapist.findByPk(therapistId, {
    include: [Branch]
  });

  // Get existing schedules for the date
  const existingSchedules = await Schedule.findAll({
    where: { date },
    include: [{
      model: Therapist,
      include: [Branch]
    }]
  });

  // Validate male therapist rules
  if (therapist.gender === 'male') {
    const maleLeaveRequests = existingSchedules.filter(s => 
      s.Therapist.gender === 'male' && s.shift === 'X'
    );
    if (maleLeaveRequests.length >= 2 && shift === 'X') {
      return {
        isValid: false,
        message: 'Maximum 2 male therapists can take leave on the same day'
      };
    }
  }

  // Validate shift 1 restrictions
  if (shift === '1') {
    const shift1Count = existingSchedules.filter(s => 
      s.shift === '1' && s.Therapist.branchCode === therapist.branchCode
    ).length;
    
    if (shift1Count >= therapist.Branch.maxTherapistsShift1) {
      return {
        isValid: false,
        message: `Maximum ${therapist.Branch.maxTherapistsShift1} therapists allowed in Shift 1`
      };
    }
  }

  // Weekend validation for male therapists
  const dayOfWeek = new Date(date).getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  
  if (therapist.Branch.weekendOnlyMaleFlag && 
      therapist.gender === 'male' && 
      !isWeekend) {
    return {
      isValid: false,
      message: 'Male therapists can only be scheduled on weekends in this branch'
    };
  }

  return { isValid: true };
};

const validateLeaveRequest = async (therapistId, date) => {
  // Check if date is weekend or holiday
  const dayOfWeek = new Date(date).getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return {
      isValid: false,
      message: 'Leave requests not allowed on weekends'
    };
  }

  // Add more leave request validations as needed
  return { isValid: true };
};

module.exports = {
  validateSchedule,
  validateLeaveRequest
};