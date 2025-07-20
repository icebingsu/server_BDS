'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('real_estate_maps', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      real_estate_id: { type: Sequelize.INTEGER, references: { model: 'real_estates', key: 'id' } },
      map_type: Sequelize.STRING,
      zoom_level: Sequelize.INTEGER,
      geojson: Sequelize.TEXT
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('real_estate_maps');
  }
};
