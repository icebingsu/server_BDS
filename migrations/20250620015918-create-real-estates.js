'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('real_estates', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      title: Sequelize.STRING,
      slug: { type: Sequelize.STRING, unique: true },
      description: Sequelize.TEXT,
      price: {
        type: Sequelize.DECIMAL(15, 0),
        allowNull: false
      },
      discount_price: {
        type: Sequelize.DECIMAL(15, 0),
        allowNull: false
      },
      area: Sequelize.FLOAT,
      bedrooms: Sequelize.INTEGER,
      bathrooms: Sequelize.INTEGER,
      floors: Sequelize.INTEGER,
      direction: Sequelize.STRING,
      legal_status: Sequelize.STRING,
      furniture: Sequelize.STRING,
      type_id: {
        type: Sequelize.INTEGER,
        references: { model: 'real_estate_types', key: 'id' }
      },
      category_id: {
        type: Sequelize.INTEGER,
        references: { model: 'real_estate_categories', key: 'id' }
      },
      status: Sequelize.STRING,
      contact_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'contacts',
          key: 'id'
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      },
      address: Sequelize.STRING,
      ward: Sequelize.STRING,
      district: Sequelize.STRING,
      city: Sequelize.STRING,
      posted_at: Sequelize.DATE,
      is_favorite: Sequelize.BOOLEAN,
      latitude: Sequelize.FLOAT,
      longitude: Sequelize.FLOAT,
      cadastral: Sequelize.STRING,
      rating: { type: Sequelize.INTEGER, defaultValue: 0 },
      isNew: { type: Sequelize.BOOLEAN, defaultValue: true },
      highlighted: { type: Sequelize.BOOLEAN, defaultValue: false }, // 👈 Trường mới
      amenities: {
        type: Sequelize.TEXT,
        allowNull: true
      }
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('real_estates');
  }
};
