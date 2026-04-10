const { SinhVien, GiangVien } = require("../models");

class UserService {
  async getProfileByEmail(email) {
    const normalizedEmail = email.toString().trim().toLowerCase();
    if (!normalizedEmail) return null;

    const student = await SinhVien.findOne({
      where: { email: normalizedEmail },
      attributes: ["id_sinh_vien", "ho_ten", "email"],
    });
    if (student) {
      return {
        role: "sinhvien",
        ...student.toJSON(),
      };
    }

    const lecturer = await GiangVien.findOne({
      where: { email: normalizedEmail },
      attributes: ["id_giang_vien", "ho_ten", "email"],
    });
    if (lecturer) {
      return {
        role: "giangvien",
        ...lecturer.toJSON(),
      };
    }

    return null;
  }

  async getProfileById(id) {
    if (!id) return null;

    // Kiểm tra SinhVien trước
    const student = await SinhVien.findByPk(id, {
      attributes: ["id_sinh_vien", "ho_ten", "email"],
    });

    if (student) {
      return {
        role: "sinhvien",
        ...student.toJSON(),
      };
    }

    // Nếu không tìm thấy SinhVien, kiểm tra GiangVien
    const lecturer = await GiangVien.findByPk(id, {
      attributes: ["id_giang_vien", "ho_ten", "email"],
    });

    if (lecturer) {
      return {
        role: "giangvien",
        ...lecturer.toJSON(),
      };
    }

    return null;
  }
  
  async getStudentById(id) {
    console.log("getStudentById called with id:", id);

    if (!id) {
      console.log("Missing id");
      return null;
    }

    const student = await SinhVien.findByPk(id, {
      attributes: ["id_sinh_vien", "ho_ten", "email"],
    });
    console.log("SinhVien result:", student);

    if (student) {
      return student.toJSON();
    }

    return null;
  }

  async getLecturerById(id) {
    console.log("getLecturerById called with id:", id);

    if (!id) {
      console.log("Missing id");
      return null;
    }

    const lecturer = await GiangVien.findByPk(id, {
      attributes: ["id_giang_vien", "ho_ten", "email"],
    });
    console.log("GiangVien result:", lecturer);

    if (lecturer) {
      return lecturer.toJSON();
    }

    return null;
  }
}

module.exports = new UserService();