const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sinhVienRepo = require("../repositories/sinhVien.repository");

class AuthService {
  async login(email, password) {
    const user = await sinhVienRepo.findByEmail(email);
    if (!user) throw new Error("Sai email");

    const isMatch = await bcrypt.compare(password, user.mat_khau);
    if (!isMatch) throw new Error("Sai mật khẩu");

    // Tạo JWT token
    const token = jwt.sign(
      {
        id: user.id_sinh_vien,
        email: user.email,
        role: "sinhvien"
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" }
    );

    return {
      user: {
        id: user.id_sinh_vien,
        ho_ten: user.ho_ten,
        email: user.email,
        role: "sinhvien"
      },
      token
    };
  }
}

module.exports = new AuthService();