'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('real_estate_features', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      real_estate_id: { type: Sequelize.INTEGER, references: { model: 'real_estates', key: 'id' } },
      feature: Sequelize.STRING
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('real_estate_features');
  }
};
