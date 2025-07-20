'use strict';
module.exports = (sequelize, DataTypes) => {
  const RealEstateImage = sequelize.define('RealEstateImage', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    real_estate_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    public_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    tableName: 'real_estate_images',
    underscored: true,
    timestamps: false,
  });

  RealEstateImage.associate = function(models) {
    RealEstateImage.belongsTo(models.RealEstate, {
      foreignKey: 'real_estate_id',
      onDelete: 'CASCADE',
    });
  };

  return RealEstateImage;
};
