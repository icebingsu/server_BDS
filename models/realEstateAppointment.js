'use strict';

module.exports = (sequelize, DataTypes) => {
  const RealEstateAppointment = sequelize.define('RealEstateAppointment', {
    real_estate_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    contact_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    contact_phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    contact_email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    contact_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    appointment_time: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    note: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'pending',
    },
  }, {
    tableName: 'appointments',         
    modelName: 'RealEstateAppointment',
    timestamps: true,
    underscored: true,
  });

  RealEstateAppointment.associate = function(models) {
    RealEstateAppointment.belongsTo(models.RealEstate, {
      foreignKey: 'real_estate_id',
      as: 'real_estate',
    });

    RealEstateAppointment.belongsTo(models.User, {
      foreignKey: 'contact_id',
      as: 'user',
    });
  };

  return RealEstateAppointment;
};
