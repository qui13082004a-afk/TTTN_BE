const lopHocRepo = require("../repositories/lopHoc.repository");
const { GiangVien } = require("../models");

class LopHocService {
  async createClass(data) {
    const { id_giang_vien, ten_lop, han_chot_dang_ky_nhom } = data;

    // Kiểm tra dữ liệu bắt buộc
    if (!id_giang_vien) {
      throw new Error("ID giảng viên không được để trống");
    }
    if (!ten_lop) {
      throw new Error("Tên lớp không được để trống");
    }

    // Kiểm tra giảng viên có tồn tại không
    const lecturer = await GiangVien.findByPk(id_giang_vien);
    if (!lecturer) {
      throw new Error(`Giảng viên có ID ${id_giang_vien} không tồn tại`);
    }

    // Tạo lớp học
    const newClass = await lopHocRepo.create({
      id_giang_vien,
      ten_lop: ten_lop.trim(),
      han_chot_dang_ky_nhom: han_chot_dang_ky_nhom || null,
    });

    return newClass;
  }

  async getClassById(id) {
    const lopHoc = await lopHocRepo.findById(id);
    if (!lopHoc) throw new Error("Lớp học không tồn tại");
    return lopHoc;
  }

  async getClassesByLecturer(id_giang_vien) {
    const classes = await lopHocRepo.findByLecturerId(id_giang_vien);
    return classes;
  }

  async getAllClasses() {
    return await lopHocRepo.findAll();
  }

  async updateClass(id, data) {
    const updated = await lopHocRepo.update(id, data);
    if (!updated) throw new Error("Cập nhật lớp học thất bại");
    return updated;
  }

  async deleteClass(id) {
    const deleted = await lopHocRepo.delete(id);
    if (!deleted) throw new Error("Xóa lớp học thất bại");
    return deleted;
  }
}

module.exports = new LopHocService();