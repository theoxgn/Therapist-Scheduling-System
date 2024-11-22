module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert('Schedules', [
      {
        therapistId: 1,
        date: new Date('2024-03-25'),
        shift: '1',
        isLeaveRequest: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        therapistId: 2,
        date: new Date('2024-03-25'),
        shift: 'M',
        isLeaveRequest: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        therapistId: 3,
        date: new Date('2024-03-25'),
        shift: '2',
        isLeaveRequest: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },
  down: async (queryInterface) => {
    await queryInterface.bulkDelete('Schedules', null, {});
  }
};