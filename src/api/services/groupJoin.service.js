const { Op } = require("sequelize");
const LopHoc = require("../models/lop_hoc.model");
const NhomHoc = require("../models/nhom_hoc.model");
const ThanhVienNhom = require("../models/thanh_vien_nhom.model");
const SinhVienLopHoc = require("../models/sinh_vien_lop_hoc.model");
const GiangVien = require("../models/giang_vien.model");

const joinGroups = async (id_sinh_vien, id_nhom) => {
  const j_group = await NhomHoc.findOne({
    where: { id_nhom },
    include: [
      {
        model: LopHoc,
        as: "lop_hoc"
      }
    ]
  });

  if (!j_group) {
    throw new Error("Không tìm thấy nhóm");
  }

  if (j_group.lop_hoc?.han_chot_dang_ky) {
    const now = new Date();
    const deadline = new Date(j_group.lop_hoc.han_chot_dang_ky);

    if (now > deadline) {
      throw new Error("Đã hết thời gian đăng ký nhóm");
    }
  }

  const inClass = await SinhVienLopHoc.findOne({
    where: {
      id_sinh_vien,
      id_lop: j_group.id_lop
    }
  });

  if (!inClass) {
    throw new Error("Sinh viên không thuộc lớp này");
  }

  const existed = await ThanhVienNhom.findOne({
    include: [
      {
        model: NhomHoc,
        where: {
          id_lop: j_group.id_lop
        }
      }
    ],
    where: {
      id_sinh_vien
    }
  });

  if (existed) {
    throw new Error("Sinh viên đã có nhóm trong lớp này");
  }

  const totalMembers = await ThanhVienNhom.count({
    where: { id_nhom }
  });

  if (totalMembers >= j_group.so_luong_toi_da) {
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

const joinByCode = async (id_sinh_vien, ma_nhom) => {
  const group = await NhomHoc.findOne({
    where: { ma_nhom }
  });

  if (!group) {
    throw new Error("Mã nhóm không tồn tại");
  }

  return await joinGroups(id_sinh_vien, group.id_nhom);
};

module.exports = {
  joinGroups,
  joinByCode
};