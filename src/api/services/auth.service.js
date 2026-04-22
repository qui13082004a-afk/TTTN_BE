const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sinhVienRepo = require("../repositories/sinhVien.repository");
const { GiangVien } = require("../models");

class AuthService {
  getLecturerRole(lecturer) {
    const adminEmails = String(process.env.ADMIN_EMAILS || "admin@example.com")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean);

    return adminEmails.includes(String(lecturer?.email || "").toLowerCase())
      ? "admin"
      : "giangvien";
  }

  async registerLecturer({ ho_ten, email, password }) {
    const fullName = (ho_ten || "").trim();
    const normalizedEmail = (email || "").trim().toLowerCase();
    const rawPassword = String(password || "");

    if (!fullName) {
      throw new Error("Ho ten giang vien khong duoc de trong");
    }

    if (!normalizedEmail) {
      throw new Error("Email khong duoc de trong");
    }

    if (!rawPassword) {
      throw new Error("Mat khau khong duoc de trong");
    }

    const lecturer = await GiangVien.findOne({ where: { email: normalizedEmail } });
    if (lecturer) {
      throw new Error("Email nay da duoc dung cho tai khoan giang vien");
    }

    const student = await sinhVienRepo.findByEmail(normalizedEmail);
    if (student) {
      throw new Error("Email nay da duoc dung cho tai khoan sinh vien");
    }

    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    const newLecturer = await GiangVien.create({
      ho_ten: fullName,
      email: normalizedEmail,
      mat_khau: hashedPassword,
    });

    return {
      id_giang_vien: newLecturer.id_giang_vien,
      ho_ten: newLecturer.ho_ten,
      email: newLecturer.email,
      role: this.getLecturerRole(newLecturer),
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
      role = this.getLecturerRole(user);
    }

    if (!user) {
      throw new Error("Sai email");
    }

    const isMatch = await bcrypt.compare(password, user.mat_khau);
    if (!isMatch) {
      throw new Error("Sai mat khau");
    }

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
        role,
      },
      token,
    };
  }
}

module.exports = new AuthService();
