// E:\Web_Bất_Động_Sản\server\controllers\AuthenticationController.js
const { User } = require('../models');   
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'KimHungQuaDepTrai';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '3d';
console.log('User model:', User);
const AuthenticationController = {
  // POST /api/register
  async register(req, res) {
    try {
      const { name, email, phone, password } = req.body;
      const existing = await User.findOne({ where: { email } });
      if (existing) {
        return res.status(400).json({ message: 'Email đã tồn tại' });
      }
      const hashed = await bcrypt.hash(password, 10);
      const user = await User.create({
        name,
        email,
        phone: phone || null,
        password: hashed,
        role: 'user',         
        is_verified: false,   
        avatar_url: null,
      });
      return res.status(201).json({
        message: 'Đăng ký thành công',
        user: {
          id:          user.id,
          name:        user.name,
          email:       user.email,
          phone:       user.phone,
          avatar_url:  user.avatar_url,
          role:        user.role,
          is_verified: user.is_verified,
          created_at:  user.created_at,
          updated_at:  user.updated_at
        }
      });
    } catch (err) {
      console.error('Register error:', err);
      return res.status(500).json({ message: 'Lỗi máy chủ' });
    }
  },

  // POST /api/login
  async login(req, res) {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(400).json({ message: 'Email không đúng' });
      }
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res.status(400).json({ message: 'Mật khẩu không đúng' });
      }
      const payload = { id: user.id, role: user.role };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn:  JWT_EXPIRES_IN });
      return res.json({
        message: 'Đăng nhập thành công',
        token,
        user: {
          id:          user.id,
          name:        user.name,
          email:       user.email,
          phone:       user.phone,
          avatar_url:  user.avatar_url,
          role:        user.role,
          is_verified: user.is_verified,
          created_at:  user.created_at,
          updated_at:  user.updated_at
        }
      });
    } catch (err) {
      console.error('Login error:', err);
      return res.status(500).json({ message: 'Lỗi máy chủ' });
    }
  },
  async InfoUser(req, res) {
    try {
      const auth = req.headers.authorization;
      if (!auth || !auth.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Không có token' });
      }
      const token = auth.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password'] }
      });
      if (!user) {
        return res.status(404).json({ message: 'Không tìm thấy người dùng' });
      }
      return res.json(user);
    } catch (err) {
      console.error('Me error:', err);
      return res.status(401).json({ message: 'Token không hợp lệ' });
    }
  }
};

module.exports = AuthenticationController;
