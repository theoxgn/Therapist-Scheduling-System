// models/ShiftSettings.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');

const ShiftSettings = sequelize.define('ShiftSettings', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  branchCode: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'Branches',
      key: 'branchCode'
    }
  },
  settings: {
    type: DataTypes.JSON,
    allowNull: false
  }
}, {
  tableName: 'shift_settings',
  timestamps: true
});

module.exports = ShiftSettings;