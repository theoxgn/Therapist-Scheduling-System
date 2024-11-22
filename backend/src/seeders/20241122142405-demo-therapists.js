module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert('Therapists', [
      {
        name: 'John Doe',
        gender: 'male',
        branchCode: 'DARMO',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Jane Smith',
        gender: 'female',
        branchCode: 'DARMO',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Mike Wilson',
        gender: 'male',
        branchCode: 'DIENG',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },
  down: async (queryInterface) => {
    await queryInterface.bulkDelete('Therapists', null, {});
  }
};