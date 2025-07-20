'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('real_estate_reviews', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      real_estate_id: { type: Sequelize.INTEGER, references: { model: 'real_estates', key: 'id' } },
      user_id: { type: Sequelize.INTEGER, references: { model: 'users', key: 'id' } },
      rating: Sequelize.INTEGER,
      comment: Sequelize.TEXT,
      created_at: Sequelize.DATE
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('real_estate_reviews');
  }
}
