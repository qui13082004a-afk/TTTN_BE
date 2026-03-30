const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");

const SinhVien = require("./models/sinh_vien.model");

// API LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Tìm user theo email
    const user = await SinhVien.findOne({
      where: { email: email },
    });

    if (!user) {
      return res.status(400).json({ message: "Sai email" });
    }

    // 2. So sánh password
    const isMatch = await bcrypt.compare(password, user.mat_khau);

    if (password !== user.mat_khau) {
      return res.status(400).json({ message: "Sai mật khẩu" });
    }

    // 3. Trả kết quả
    res.json({
      message: "Đăng nhập thành công",
      user,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

module.exports = router;