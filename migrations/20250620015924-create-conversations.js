'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('conversations', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      real_estate_id: { type: Sequelize.INTEGER, references: { model: 'real_estates', key: 'id' } },
      sender_id: { type: Sequelize.INTEGER, references: { model: 'users', key: 'id' } },
      receiver_id: { type: Sequelize.INTEGER, references: { model: 'users', key: 'id' } },
      created_at: Sequelize.DATE,
      last_message_at: Sequelize.DATE
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('conversations');
  }
};
