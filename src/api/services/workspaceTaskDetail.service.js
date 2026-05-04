const CongViec = require("../models/cong_viec.model");
const SinhVien = require("../models/sinh_vien.model");
const NhatKy = require("../models/nhat_ky.model");
const ThanhVienNhom = require("../models/thanh_vien_nhom.model");

const getTaskDetail = async (id_cong_viec, id_sinh_vien) => {

  // Lấy task
  const task = await CongViec.findByPk(id_cong_viec);

  if (!task) {
    throw new Error("Không tìm thấy công việc");
  }

  // Check user có thuộc nhóm
  const member = await ThanhVienNhom.findOne({
    where: {
      id_nhom: task.id_nhom,
      id_sinh_vien
    }
  });

  if (!member) {
    throw new Error("Bạn không thuộc nhóm này");
  }

  // Lấy task full info
  const fullTask = await CongViec.findByPk(id_cong_viec, {
    include: [
      {
        model: SinhVien,
        attributes: ["id_sinh_vien", "ho_ten", "avatar"]
      }
    ]
  });

  // Lấy lịch sử
  const logs = await NhatKy.findAll({
    where: { id_cong_viec },
    order: [["id_nhat_ky", "DESC"]]
  });

  return {
    success: true,
    data: {
      id_cong_viec: fullTask.id_cong_viec,
      ten_cong_viec: fullTask.ten_cong_viec,
      mo_ta: fullTask.mo_ta,
      trang_thai: fullTask.trang_thai,
      han_chot: fullTask.han_chot,
      muc_do_uu_tien: fullTask.muc_do_uu_tien,
      nguoi_phu_trach: fullTask.sinh_vien,
      lich_su: logs
    }
  };
};

module.exports = {
  getTaskDetail
};