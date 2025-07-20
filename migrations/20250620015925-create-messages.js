'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('messages', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      conversation_id: { type: Sequelize.INTEGER, references: { model: 'conversations', key: 'id' } },
      sender_id: { type: Sequelize.INTEGER, references: { model: 'users', key: 'id' } },
      message: Sequelize.TEXT,
      sent_at: Sequelize.DATE,
      is_read: Sequelize.BOOLEAN
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('messages');
  }
};
