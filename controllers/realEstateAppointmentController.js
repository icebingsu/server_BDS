const { Contact, RealEstateAppointment, RealEstate, User } = require('../models');

module.exports = {
  async create(req, res) {
    const { name, phone, Mail, mail, user_id, date, time, desc, real_estate_id } = req.body;

    if (!real_estate_id || !date || !time) {
      return res.status(400).json({
        error: "Thiếu thông tin bắt buộc (real_estate_id, ngày hoặc giờ)",
      });
    }

    try {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) {
        return res.status(400).json({ error: "Ngày không hợp lệ" });
      }

      const dateStrOnly = dateObj.toISOString().split("T")[0];
      const timeStr = time.length === 5 ? time : time.padStart(5, "0");
      const combinedDateTimeStr = `${dateStrOnly}T${timeStr}`;
      const appointment_time = new Date(combinedDateTimeStr);

      if (isNaN(appointment_time.getTime())) {
        return res.status(400).json({ error: "Thời gian hẹn không hợp lệ" });
      }

      if (appointment_time < new Date()) {
        return res.status(400).json({ error: "Không thể đặt lịch ở thời điểm đã qua" });
      }

      let contact = null;

      if (user_id) {
        // ✅ Kiểm tra user tồn tại
        const user = await User.findByPk(user_id);
        if (!user) {
          return res.status(400).json({ error: "Người dùng không tồn tại (user_id không hợp lệ)" });
        }

        // ✅ Tìm contact theo user
        contact = await Contact.findOne({ where: { user_id } });

        if (!contact) {
          contact = await Contact.create({
            name: name || null,
            phone: phone || null,
            email: Mail || mail || null,
            user_id,
          });
        }
      } else {
        // Không có user_id, tạo contact ẩn danh
        contact = await Contact.create({
          name: name || null,
          phone: phone || null,
          email: Mail || mail || null,
        });
      }

      // Tạo lịch hẹn
      const appointment = await RealEstateAppointment.create({
        real_estate_id: Number(real_estate_id),
        contact_name: name || null,
        contact_phone: phone || null,
        contact_email: Mail || mail || null,
        contact_id: contact.id,
        appointment_time,
        note: desc || null,
        status: "pending",
      });

      return res.status(201).json(appointment);
    } catch (err) {
      console.error("❌ Lỗi tạo lịch hẹn:", err);
      return res.status(500).json({
        error: "Lỗi hệ thống khi tạo lịch hẹn",
        details: err.message,
      });
    }
  },
  async getByRealEstate(req, res) {
    try {
      const { real_estate_id } = req.params;

      const appointments = await RealEstateAppointment.findAll({
        where: { real_estate_id },
        order: [["appointment_time", "ASC"]],
      });

      return res.json(appointments);
    } catch (err) {
      return res.status(500).json({ error: "Lỗi lấy lịch hẹn" });
    }
  },
  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const appointment = await RealEstateAppointment.findByPk(id);
      if (!appointment)
        return res.status(404).json({ error: "Không tìm thấy lịch hẹn" });

      appointment.status = status;
      await appointment.save();

      return res.json(appointment);
    } catch (err) {
      return res.status(500).json({ error: "Lỗi cập nhật trạng thái" });
    }
  },
  async getRealEstateByUser(req, res) {
    try {
      const { id_user } = req.params;
      // 🔍 Tìm tất cả contact thuộc user
      const contacts = await Contact.findAll({
        where: { user_id: id_user },
        attributes: ['id'],
      });

      const contactIds = contacts.map((c) => c.id);

      if (contactIds.length === 0) {
        return res.json([]); // ❌ Không có contact nào → không có lịch hẹn
      }

      // 📅 Tìm tất cả lịch hẹn theo contact_id
      const appointments = await RealEstateAppointment.findAll({
        where: { contact_id: contactIds },
        include: [
          {
            model: RealEstate,
            as: 'real_estate',
            attributes: ['id', 'title', 'price', 'address'],
          },
        ],
        order: [['appointment_time', 'DESC']],
      });

      return res.json(appointments);
    } catch (err) {
      console.error('❌ Lỗi lấy lịch hẹn theo user:', err);
      return res.status(500).json({ error: 'Lỗi hệ thống khi lấy lịch hẹn' });
    }
  }
};
