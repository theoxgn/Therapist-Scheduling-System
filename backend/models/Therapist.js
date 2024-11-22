// backend/models/Therapist.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');

const Therapist = sequelize.define('Therapist', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  gender: {
    type: DataTypes.ENUM('male', 'female'),
    allowNull: false
  },
  branchCode: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'Branches',
      key: 'branchCode'
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
});

module.exports = Therapist;