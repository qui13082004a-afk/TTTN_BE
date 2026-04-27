const NhomHoc = require("../models/nhom_hoc.model");
const ThanhVienNhom = require("../models/thanh_vien_nhom.model");
const CongViec = require("../models/cong_viec.model");

const createTask = async (id_nhom, data = {}) => {
  const {
    id_sinh_vien,
    ten_cong_viec,
    mo_ta,
    han_chot,
    id_sinh_vien_phu_trach
  } = data;

  if (!id_sinh_vien) {
    throw new Error("Thiếu id_sinh_vien");
  }

  if (!id_sinh_vien_phu_trach) {
    throw new Error("Thiếu người phụ trách");
  }

  if (!ten_cong_viec) {
    throw new Error("Thiếu tên công việc");
  }

  const group = await NhomHoc.findByPk(id_nhom);

  if (!group) {
    throw new Error("Không tìm thấy nhóm");
  }

  const currentMember = await ThanhVienNhom.findOne({
    where: {
      id_nhom,
      id_sinh_vien
    }
  });

  if (!currentMember) {
    throw new Error("Bạn không thuộc nhóm này");
  }

  const assignedMember = await ThanhVienNhom.findOne({
    where: {
      id_nhom,
      id_sinh_vien: id_sinh_vien_phu_trach
    }
  });

  if (!assignedMember) {
    throw new Error("Người phụ trách không thuộc nhóm");
  }

  if (!ten_cong_viec || ten_cong_viec.trim() === "") {
    throw new Error("Tên công việc không được để trống");
  }

  const task = await CongViec.create({
    id_nhom,
    ten_cong_viec,
    mo_ta,
    han_chot,
    id_sinh_vien_phu_trach,
    trang_thai: "can_lam"
  });

  return {
    success: true,
    message: "Tạo task thành công",
    data: task
  };
};

module.exports = {
  createTask
};