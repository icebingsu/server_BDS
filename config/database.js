const { Sequelize } = require('sequelize');
require('dotenv').config(); 

// Lấy cấu hình từ biến môi trường (.env)
const DB_NAME     = process.env.DB_NAME     || '';
const DB_USER     = process.env.DB_USER     || '';
const DB_PASSWORD = process.env.DB_PASSWORD || '';   // ✅ Sửa lại ở đây
const DB_HOST     = process.env.DB_HOST     || '';
const DB_DIALECT  = process.env.DB_DIALECT  || '';
const DB_PORT     = process.env.DB_PORT     || 3306;

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host:     DB_HOST,
  port:     DB_PORT,
  dialect:  DB_DIALECT,
  logging:  false,        // bật true để debug SQL
  define: {
    underscored:     true,  // dùng created_at thay vì createdAt
    freezeTableName: true   // table name giống model
  },
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: true,
    }
  }
});

module.exports = sequelize;
