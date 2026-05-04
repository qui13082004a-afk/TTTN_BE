const bcrypt = require("bcrypt");
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
        "ma_lop",
        "ho_ten",
        "email",
        "sdt",
        "avatar",
        "khoa",
        "ngay_sinh",
        "gioi_tinh",
        "trang_thai",
        "updated_at",
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
        "updated_at",
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

    // if (!normalizedEmail.endsWith("@student.stu.edu.vn")) {
    //   throw new Error("Email sinh viên không hợp lệ");
    // }

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

  async changePassword(actor, { current_password, new_password, confirm_password }) {
    const actorId = actor?.role === "sinhvien" ? actor?.id_sinh_vien : actor?.id_giang_vien;

    if (!actor || !actorId || !actor.role) {
      throw new Error("Khong xac dinh duoc nguoi dung dang dang nhap");
    }

    const currentPassword = String(current_password || "");
    const newPassword = String(new_password || "");
    const confirmPassword = String(confirm_password || "");

    if (!currentPassword) {
      const error = new Error("Mật khẩu hiện tại không được để trống");
      error.field = "current_password";
      throw error;
    }

    if (!newPassword) {
      const error = new Error("Mật khẩu mới không được để trống");
      error.field = "new_password";
      throw error;
    }

    if (!confirmPassword) {
      const error = new Error("Nhập lại mật khẩu không được để trống");
      error.field = "confirm_password";
      throw error;
    }

    const model = actor.role === "sinhvien" ? SinhVien : GiangVien;
    const primaryKey = actor.role === "sinhvien" ? "id_sinh_vien" : "id_giang_vien";
    const user = await model.findByPk(actorId, {
      attributes: [primaryKey, "mat_khau", "updated_at"],
    });

    if (!user) {
      throw new Error("Khong tim thay tai khoan");
    }

    const isCurrentPasswordMatch = await bcrypt.compare(currentPassword, user.mat_khau);
    if (!isCurrentPasswordMatch) {
      const error = new Error("Mật khẩu hiện tại không chính xác");
      error.field = "current_password";
      throw error;
    }

    if (newPassword.length < 6) {
      const error = new Error("Mật khẩu mới phải có ít nhất 6 ký tự");
      error.field = "new_password";
      throw error;
    }

    const isSameAsCurrent = await bcrypt.compare(newPassword, user.mat_khau);
    if (isSameAsCurrent) {
      const error = new Error("Mật khẩu mới không được trùng với mật khẩu cũ");
      error.field = "new_password";
      throw error;
    }

    if (confirmPassword !== newPassword) {
      const error = new Error("Mật khẩu nhập lại không khớp");
      error.field = "confirm_password";
      throw error;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await user.update({
      mat_khau: hashedPassword,
      updated_at: new Date(),
    });

    return {
      message: "Đổi mật khẩu thành công. Vui lòng đăng nhập lại!",
      force_logout: true,
    };
  }
}

module.exports = new UserService();
