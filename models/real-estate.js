'use strict';

module.exports = (sequelize, DataTypes) => {
  const RealEstate = sequelize.define('RealEstate', {
    title: DataTypes.STRING,
    slug: { type: DataTypes.STRING, unique: true },
    description: DataTypes.TEXT,
    price: DataTypes.DECIMAL,
    discount_price: DataTypes.DECIMAL,
    area: DataTypes.FLOAT,
    bedrooms: DataTypes.INTEGER,
    bathrooms: DataTypes.INTEGER,
    floors: DataTypes.INTEGER,
    direction: DataTypes.STRING,
    legal_status: DataTypes.STRING,
    cadastral:DataTypes.STRING,
    furniture: DataTypes.STRING,
    type_id: DataTypes.INTEGER,
    category_id: DataTypes.INTEGER,
    status: DataTypes.STRING,
    address: DataTypes.STRING,
    ward: DataTypes.STRING,
    district: DataTypes.STRING,
    city: DataTypes.STRING,
    posted_at: DataTypes.DATE,
    is_favorite: DataTypes.BOOLEAN,
    latitude: DataTypes.FLOAT,
    longitude: DataTypes.FLOAT,
    amenities: DataTypes.STRING,
  }, {
    tableName: 'real_estates',
    underscored: true,
    timestamps: false
  });
  RealEstate.associate = function(models) {
    RealEstate.belongsTo(models.RealEstateType, {
      foreignKey: 'type_id', as: 'type'
    });
     RealEstate.belongsTo(models.Category, {
      foreignKey: 'category_id', as: 'category'
    });
    RealEstate.hasMany(models.RealEstateImage, {
      foreignKey: 'real_estate_id', as: 'images'
    });
  };

  return RealEstate;
};
