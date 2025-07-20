const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config(); 
const puppeteer = require("puppeteer"); // ✅ Thêm Puppeteer

const sequelize = require('./config/database');
const authRoutes = require('./router/AuthenticationRouter');
const categoryRoutes = require('./router/Real-Estate-Category');
const TypeRoutes = require('./router/Real-Estate-Type');
const realEstateRoutes = require('./router/Real-Estate');
const realEstateImageRoutes = require("./router/RealEstateImages");

const realEstateAppointments = require("./router/Real-Estate-Appointments");
const app = express();
app.use(cors({
  origin: "*",
  credentials: true
}));
app.use(bodyParser.json());
// api đăng nhập đăng kí thông tin cá nhân
app.use('/api/auth', authRoutes); 
// api quản lý danh mục bất động sản
app.use('/api/categories', categoryRoutes);
// apu quản lý bất động sản type 
app.use('/api/type', TypeRoutes);
// api CRUD Bất động sản;
app.use('/api/real-estates', realEstateRoutes);
// update ảnh
app.use('/api/update-images', realEstateImageRoutes);
// đặt lịnh xem nhà
app.use('/api/appointments', realEstateAppointments);
// Home




app.get('/', (req, res) => res.send('Welcome to Bất Động Sản API!'));

// Khởi động server
(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Kết nối CSDL thành công');
    app.listen(process.env.PORT || 3000, () => {
      console.log(`🚀 Server chạy tại http://localhost:${process.env.PORT || 3000}`);
    });
  } catch (err) {
    console.error('❌ Kết nối CSDL thất bại:', err);
  }
})();
