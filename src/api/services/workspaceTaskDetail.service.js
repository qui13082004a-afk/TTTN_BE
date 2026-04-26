const CongViec = require("../models/cong_viec.model");
const SinhVien = require("../models/sinh_vien.model");
const NhatKy = require("../models/nhat_ky.model");

const getTaskDetail = async (id_cong_viec) => {
  const task = await CongViec.findByPk(id_cong_viec, {
    include: [
      {
        model: SinhVien,
        attributes: ["id_sinh_vien", "ho_ten", "avatar"]
      }
    ]
  });

  if (!task) {
    throw new Error("Không tìm thấy công việc");
  }

  const logs = await NhatKy.findAll({
    where: {
      id_cong_viec
    },
    order: [["id_nhat_ky", "DESC"]]
  });

  return {
    success: true,
    data: {
      id_cong_viec: task.id_cong_viec,
      ten_cong_viec: task.ten_cong_viec,
      mo_ta: task.mo_ta,
      trang_thai: task.trang_thai,
      han_chot: task.han_chot,
      muc_do_uu_tien: task.muc_do_uu_tien,
      nguoi_phu_trach: task.sinh_vien,
      lich_su: logs
    }
  };
};

module.exports = {
  getTaskDetail
};