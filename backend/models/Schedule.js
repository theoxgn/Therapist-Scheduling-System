const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');

const Schedule = sequelize.define('Schedule', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  therapistId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Therapists',
      key: 'id'
    }
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  shift: {
    type: DataTypes.ENUM('1', 'M', '2', 'X'),
    allowNull: false
  },
  isLeaveRequest: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
});

module.exports = Schedule;