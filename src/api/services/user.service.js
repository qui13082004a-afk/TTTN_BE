const { SinhVien, GiangVien } = require("../models");

class UserService {
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
      return { ...student.toJSON(), role: "sinhvien" };
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
      return { ...lecturer.toJSON(), role: "giangvien" };
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
}

module.exports = new UserService();