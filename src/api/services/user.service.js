const { SinhVien, GiangVien } = require("../models");

class UserService {
  getLecturerRole(lecturer) {
    const adminEmails = String(process.env.ADMIN_EMAILS || "admin@example.com")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean);

    return adminEmails.includes(String(lecturer?.email || "").toLowerCase())
      ? "admin"
      : "giangvien";
  }

  async getStudentById(id) {
    if (!id) {
      return null;
    }

    const student = await SinhVien.findByPk(id, {
      attributes: [
        "id_sinh_vien",
        "mssv",
        "ho_ten",
        "email",
        "sdt",
        "avatar",
        "khoa",
        "ngay_sinh",
        "gioi_tinh",
        "trang_thai",
      ],
    });

    if (student) {
      return { ...student.toJSON(), role: "sinhvien" };
    }

    return null;
  }

  async getLecturerById(id) {
    if (!id) {
      return null;
    }

    const lecturer = await GiangVien.findByPk(id, {
      attributes: [
        "id_giang_vien",
        "ma_giang_vien",
        "ho_ten",
        "email",
        "sdt",
        "avatar_url",
        "khoa",
        "hoc_ham",
        "hoc_vi",
        "trang_thai",
      ],
    });

    if (lecturer) {
      return {
        ...lecturer.toJSON(),
        role: this.getLecturerRole(lecturer),
      };
    }

    return null;
  }

  async getProfileById(id) {
    if (!id) {
      return null;
    }

    const lecturer = await this.getLecturerById(id);
    if (lecturer) {
      return lecturer;
    }

    return await this.getStudentById(id);
  }

  async getProfileByEmail(email) {
    const normalizedEmail = String(email || "").trim().toLowerCase();
    if (!normalizedEmail) {
      return null;
    }

    const lecturer = await GiangVien.findOne({ where: { email: normalizedEmail } });
    if (lecturer) {
      return {
        ...lecturer.toJSON(),
        role: this.getLecturerRole(lecturer),
      };
    }

    const student = await SinhVien.findOne({ where: { email: normalizedEmail } });
    if (student) {
      return {
        ...student.toJSON(),
        role: "sinhvien",
      };
    }

    return null;
  }
}

module.exports = new UserService();
