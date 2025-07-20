'use strict';

module.exports = (sequelize, DataTypes) => {
  const Contact = sequelize.define('Contact', {
    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    zalo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {
    tableName: 'contacts',
    timestamps: false, // Vì migration không có created_at / updated_at
    underscored: true, // Dùng contact_id thay vì contactId nếu dùng snake_case
  });
  Contact.associate = function(models) {
    Contact.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user',
    });
    Contact.hasMany(models.RealEstateAppointment, {
      foreignKey: 'contact_id',
      as: 'appointments',
    });
  };

  return Contact;
};
