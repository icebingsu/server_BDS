'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('real_estate_types', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      name: Sequelize.STRING
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('real_estate_types');
  }
};
