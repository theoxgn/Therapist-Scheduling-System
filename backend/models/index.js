const Branch = require('./Branch');
const Therapist = require('./Therapist');
const Schedule = require('./Schedule');
const ShiftSettings = require('./ShiftSettings');

// Associations
Therapist.belongsTo(Branch, { foreignKey: 'branchCode' });
Branch.hasMany(Therapist, { foreignKey: 'branchCode' });

Schedule.belongsTo(Therapist, { foreignKey: 'therapistId' });
Therapist.hasMany(Schedule, { foreignKey: 'therapistId' });

module.exports = {
  Branch,
  Therapist,
  Schedule,
  ShiftSettings
};

