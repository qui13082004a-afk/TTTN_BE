const CongViec = require("../models/cong_viec.model");
const NhatKy = require("../models/nhat_ky.model");
const ThanhVienNhom = require("../models/thanh_vien_nhom.model");
const SinhVien = require("../models/sinh_vien.model");

const updateTaskStatus = async (id_cong_viec, data) => {
  const { id_sinh_vien, trang_thai } = data;

  const validStatus = ["can_lam", "dang_lam", "hoan_thanh"];

  if (!validStatus.includes(trang_thai)) {
    throw new Error("Trạng thái không hợp lệ");
  }

  const task = await CongViec.findByPk(id_cong_viec);

  if (!task) {
    throw new Error("Không tìm thấy công việc");
  }

  const member = await ThanhVienNhom.findOne({
    where: {
      id_nhom: task.id_nhom,
      id_sinh_vien
    }
  });

  if (!member) {
    throw new Error("Bạn không thuộc nhóm này");
  }

  await task.update({
    trang_thai
  });

  let tien_do_moi = 0;

  if (trang_thai === "can_lam") tien_do_moi = 0;
  if (trang_thai === "dang_lam") tien_do_moi = 50;
  if (trang_thai === "hoan_thanh") tien_do_moi = 100;

  await NhatKy.create({
    id_cong_viec: task.id_cong_viec,
    tien_do_moi,
    ghi_chu: `Cập nhật trạng thái thành ${trang_thai}`
  });

  return {
    success: true,
    message: "Cập nhật trạng thái thành công",
    data: {
      id_cong_viec: task.id_cong_viec,
      trang_thai,
      tien_do_moi
    }
  };
};

module.exports = {
  updateTaskStatus
};