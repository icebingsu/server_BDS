module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define('Category', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    is_homepage: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    can_delete: {
      type: DataTypes.BOOLEAN,
      allowNull: true,        
      defaultValue: true        
    }
  }, {
    tableName: 'real_estate_categories',
    timestamps: false
  });

  Category.associate = function(models) {
    Category.hasMany(models.RealEstate, {
      foreignKey: "category_id",
      as: "real_estates"
    });
  }

  return Category;
};
