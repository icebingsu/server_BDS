'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('real_estate_comments', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      real_estate_id: { type: Sequelize.INTEGER, references: { model: 'real_estates', key: 'id' } },
      user_id: { type: Sequelize.INTEGER, references: { model: 'users', key: 'id' } },
      content: Sequelize.TEXT,
      parent_id: { type: Sequelize.INTEGER, references: { model: 'real_estate_comments', key: 'id' }, allowNull: true },
      created_at: Sequelize.DATE,
      updated_at: Sequelize.DATE,
      is_edited: Sequelize.BOOLEAN
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('real_estate_comments');
  }
};
