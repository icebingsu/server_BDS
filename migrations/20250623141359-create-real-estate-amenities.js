'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Tạo bảng amenities
    await queryInterface.createTable('amenities', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: Sequelize.STRING, allowNull: false }
    });
    // Tạo bảng trung gian real_estate_amenities
    await queryInterface.createTable('real_estate_amenities', {
      real_estate_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'real_estates',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      amenity_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'amenities',
          key: 'id'
        },
        onDelete: 'CASCADE'
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('real_estate_amenities');
    await queryInterface.dropTable('amenities');
  }
};
