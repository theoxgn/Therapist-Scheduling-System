module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkInsert('Branches', [
      {
        branchCode: 'DARMO',
        name: 'Darmo Branch',
        address: 'Jl. Darmo No. 123',
        maxTherapistsShift1: 3,
        genderRestrictionFlag: true,
        weekendOnlyMaleFlag: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        branchCode: 'DIENG',
        name: 'Dieng Branch',
        address: 'Jl. Dieng No. 456',
        maxTherapistsShift1: 3,
        genderRestrictionFlag: true,
        weekendOnlyMaleFlag: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },
  down: async (queryInterface) => {
    await queryInterface.bulkDelete('Branches', null, {});
  }
};