const { Op } = require("sequelize");
const LopHoc = require("../models/lop_hoc.model");
const NhomHoc = require("../models/nhom_hoc.model");
const ThanhVienNhom = require("../models/thanh_vien_nhom.model");
const SinhVienLopHoc = require("../models/sinh_vien_lop_hoc.model");

const joinGroup = async (id_sinh_vien, id_nhom) => {
  const group = await NhomHoc.findOne({
    where: { id_nhom },
    include: [
      {
        model: LopHoc,
        as: "lop_hoc"
      }
    ]
  });

  if (!group) {
    throw new Error("Không tìm thấy nhóm");
  }

  const now = new Date();
  if (now > new Date(group.lop_hoc.han_chot_dang_ky)) {
    throw new Error("Đã hết thời gian đăng ký nhóm");
  }

  const inClass = await SinhVienLopHoc.findOne({
    where: {
      id_sinh_vien,
      id_lop: group.id_lop
    }
  });

  if (!inClass) {
    throw new Error("Sinh viên không thuộc lớp này");
  }

  const existed = await ThanhVienNhom.findOne({
    where: { id_sinh_vien }
  });

  if (existed) {
    throw new Error("Sinh viên đã có nhóm");
  }

  const totalMembers = await ThanhVienNhom.count({
    where: { id_nhom }
  });

  if (totalMembers >= group.so_luong_toi_da) {
    throw new Error("Nhóm đã đủ số lượng tối đa");
  }

  await ThanhVienNhom.create({
    id_nhom,
    id_sinh_vien,
    vai_tro_noi_bo: "thanh_vien",
    ngay_gia_nhap: new Date()
  });

  return {
    success: true,
    message: "Tham gia nhóm thành công"
  };
};

module.exports = {
  joinGroup
};