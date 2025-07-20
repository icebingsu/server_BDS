'use strict';

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    phone: DataTypes.STRING,
    password: DataTypes.STRING,
    avatar_url: DataTypes.STRING,
    role: DataTypes.STRING,
    is_verified: DataTypes.BOOLEAN
  }, {
    tableName: 'users',
    underscored: true,
    timestamps: true
  });

  return User;
};
