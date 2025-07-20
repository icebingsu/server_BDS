'use strict';

module.exports = (sequelize, DataTypes) => {
  const RealEstateType = sequelize.define('RealEstateType', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: 'real_estate_types',
    timestamps: false
  });

  RealEstateType.associate = (models) => {
    RealEstateType.hasMany(models.RealEstate, {
      foreignKey: 'type_id',
      as: 'real_estates',
    });
  };

  return RealEstateType;
};