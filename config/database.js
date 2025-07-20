const { Sequelize } = require('sequelize');
require('dotenv').config(); 
// Lấy cấu hình từ biến môi trường (.env)
const DB_NAME     = process.env.DB_NAME     || 'real_estate_db';
const DB_USER     = process.env.DB_USER     || 'root';
const DB_PASS     = process.env.DB_PASS     || '';
const DB_HOST     = process.env.DB_HOST     || '127.0.0.1';
const DB_DIALECT  = process.env.DB_DIALECT  || 'mysql';
const DB_PORT     = process.env.DB_PORT     || 3306;

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
  host:     DB_HOST,
  port:     DB_PORT,
  dialect:  DB_DIALECT,
  logging:  false,        // bật true để debug SQL
  define: {
    underscored:    true,  // dùng created_at thay vì createdAt
    freezeTableName: true  // table name giống model
  }
});

module.exports = sequelize;
