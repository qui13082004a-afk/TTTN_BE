const NhomHoc = require("../models/nhom_hoc.model");
const ThanhVienNhom = require("../models/thanh_vien_nhom.model");
const SinhVien = require("../models/sinh_vien.model");

const getGroupMembers = async (id_nhom, id_sinh_vien) => {
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

  const isLeader = Number(group.id_nhom_truong) === Number(id_sinh_vien);

  const members = await ThanhVienNhom.findAll({
    where: { id_nhom },
    include: [
      {
        model: SinhVien,
        attributes: [
          "id_sinh_vien",
          "mssv",
          "ho_ten",
          "email",
          "avatar"
        ]
      }
    ],
    order: [["ngay_gia_nhap", "ASC"]]
  });

  return {
    success: true,
    data: members.map(item => ({
      id_sinh_vien: item.sinh_vien.id_sinh_vien,
      mssv: item.sinh_vien.mssv,
      ho_ten: item.sinh_vien.ho_ten,
      email: item.sinh_vien.email,
      avatar: item.sinh_vien.avatar,
      vai_tro:
        Number(group.id_nhom_truong) === Number(item.id_sinh_vien)
          ? "Trưởng nhóm"
          : "Thành viên",
      ngay_gia_nhap: item.ngay_gia_nhap,
      co_the_xoa:
        isLeader &&
        Number(item.id_sinh_vien) !== Number(group.id_nhom_truong)
    }))
  };
};

module.exports = {
  getGroupMembers
};