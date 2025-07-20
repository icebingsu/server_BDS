'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('real_estate_images', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      real_estate_id: {
        type: Sequelize.INTEGER,
        references: { model: 'real_estates', key: 'id' },
        onDelete: 'CASCADE',
      },
      url: Sequelize.STRING,
      public_id: Sequelize.STRING,
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('real_estate_images');
  },
};
