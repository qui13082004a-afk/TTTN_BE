const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sinhVienRepo = require("../repositories/sinhVien.repository");
const { GiangVien } = require("../models");

class AuthService {
  async registerLecturer({ ho_ten, email, password }) {
    const fullName = (ho_ten || "").trim();
    const normalizedEmail = (email || "").trim().toLowerCase();
    const rawPassword = String(password || "");

    if (!fullName) {
      throw new Error("Họ tên giảng viên không được để trống");
    }

    if (!normalizedEmail) {
      throw new Error("Email không được để trống");
    }

    if (!rawPassword) {
      throw new Error("Mật khẩu không được để trống");
    }

    const lecturer = await GiangVien.findOne({ where: { email: normalizedEmail } });
    if (lecturer) {
      throw new Error("Email này đã được dùng cho tài khoản giảng viên");
    }

    const student = await sinhVienRepo.findByEmail(normalizedEmail);
    if (student) {
      throw new Error("Email này đã được dùng cho tài khoản sinh viên");
    }

    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    const newLecturer = await GiangVien.create({
      ho_ten: fullName,
      email: normalizedEmail,
      mat_khau: hashedPassword,
      role: "giangvien",
    });

    return {
      id_giang_vien: newLecturer.id_giang_vien,
      ho_ten: newLecturer.ho_ten,
      email: newLecturer.email,
      role: "giangvien",
    };
  }

  async login(email, password) {
    const normalizedEmail = (email || "").trim().toLowerCase();
    let user = await GiangVien.findOne({ where: { email: normalizedEmail } });
    let role = "giangvien";

    if (!user) {
      user = await sinhVienRepo.findByEmail(normalizedEmail);
      role = "sinhvien";
    } else {
      role = user.role || "giangvien";
    }

    if (!user) throw new Error("Sai email");

    const isMatch = await bcrypt.compare(password, user.mat_khau);
    if (!isMatch) throw new Error("Sai mật khẩu");

    const token = jwt.sign(
      {
        id: role === "sinhvien" ? user.id_sinh_vien : user.id_giang_vien,
        email: user.email,
        role,
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" }
    );

    return {
      user: {
        id: role === "sinhvien" ? user.id_sinh_vien : user.id_giang_vien,
        ho_ten: user.ho_ten,
        email: user.email,
        role
      },
      token
    };
  }
}

module.exports = new AuthService();
