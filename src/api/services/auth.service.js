const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sinhVienRepo = require("../repositories/sinhVien.repository");
const { GiangVien } = require("../models");

class AuthService {
  async login(email, password) {
    let user = await GiangVien.findOne({ where: { email } });
    let role = "giangvien";

    if (!user) {
      user = await sinhVienRepo.findByEmail(email);
      role = "sinhvien";
    }

    if (!user) throw new Error("Sai email");

    const isMatch = await bcrypt.compare(password, user.mat_khau);
    if (!isMatch) throw new Error("Sai mật khẩu");

    const token = jwt.sign(
      {
        id: role === "giangvien" ? user.id_giang_vien : user.id_sinh_vien,
        email: user.email
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" }
    );

    return {
      user: {
        id: role === "giangvien" ? user.id_giang_vien : user.id_sinh_vien,
        ho_ten: user.ho_ten,
        email: user.email,
        role
      },
      token
    };
  }
}

module.exports = new AuthService();