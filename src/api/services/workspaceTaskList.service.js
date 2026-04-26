const CongViec = require("../models/cong_viec.model");
const SinhVien = require("../models/sinh_vien.model");

const getTasksByGroup = async (id_nhom) => {
  const tasks = await CongViec.findAll({
    where: { id_nhom },
    include: [
      {
        model: SinhVien,
        attributes: ["id_sinh_vien", "ho_ten", "avatar"]
      }
    ],
    order: [["han_chot", "ASC"]]
  });

  const result = {
    can_lam: [],
    dang_lam: [],
    hoan_thanh: []
  };

  tasks.forEach(task => {
    const item = {
      id_cong_viec: task.id_cong_viec,
      ten_cong_viec: task.ten_cong_viec,
      mo_ta: task.mo_ta,
      han_chot: task.han_chot,
      muc_do_uu_tien: task.muc_do_uu_tien,
      nguoi_phu_trach: task.sinh_vien
        ? {
            id_sinh_vien: task.sinh_vien.id_sinh_vien,
            ho_ten: task.sinh_vien.ho_ten,
            avatar: task.sinh_vien.avatar
          }
        : null
    };

    if (task.trang_thai === "can_lam") {
      result.can_lam.push(item);
    } else if (task.trang_thai === "dang_lam") {
      result.dang_lam.push(item);
    } else if (task.trang_thai === "hoan_thanh") {
      result.hoan_thanh.push(item);
    }
  });

  return {
    success: true,
    data: result
  };
};

module.exports = {
  getTasksByGroup
};