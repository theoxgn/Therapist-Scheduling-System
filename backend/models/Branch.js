const { DataTypes } = require('sequelize');
const sequelize = require('../config/config');

const Branch = sequelize.define('Branch', {
  branchCode: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  address: DataTypes.STRING,
  maxTherapistsShift1: {
    type: DataTypes.INTEGER,
    defaultValue: 3
  },
  genderRestrictionFlag: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  weekendOnlyMaleFlag: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
});

module.exports = Branch;
