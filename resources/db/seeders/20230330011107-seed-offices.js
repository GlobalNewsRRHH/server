'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const date = new Date()
    await queryInterface.bulkInsert(
      'offices',
      [
        {
          name: 'Oficina 1',
          countryId: 1,
          createdAt: date,
          updatedAt: date,
        },
        {
          name: 'Oficina 2',
          countryId: 2,
          createdAt: date,
          updatedAt: date,
        },
        {
          name: 'Oficina 3',
          countryId: 3,
          createdAt: date,
          updatedAt: date,
        },
      ],
      {}
    )
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('offices', null, {})
  },
}
