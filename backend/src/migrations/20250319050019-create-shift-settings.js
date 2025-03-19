'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('shift_settings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      branchCode: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'Branches',
          key: 'branchCode'
        },
        onDelete: 'CASCADE'
      },
      settings: {
        type: Sequelize.JSON,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
    
    await queryInterface.addIndex('shift_settings', ['branchCode']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('shift_settings');
  }
};