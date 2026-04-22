const { Op } = require("sequelize");
const LopHoc = require("../models/lop_hoc.model");
const NhomHoc = require("../models/nhom_hoc.model");
const ThanhVienNhom = require("../models/thanh_vien_nhom.model");
const SinhVienLopHoc = require("../models/sinh_vien_lop_hoc.model");
const GiangVien = require("../models/giang_vien.model");

const getGroups = async (studentId, keyword = "") => {
  const s_group = await NhomHoc.findAll({
    include: [
      {
        model: LopHoc,
        as: "lop_hoc",
        attributes: ["ten_lop", "han_chot_dang_ky"],
        include: [
          {
            model: GiangVien,
            attributes: ["ho_ten"]
          }
        ]
      },
      {
        model: ThanhVienNhom,
        where: { id_sinh_vien: studentId },
        attributes: ["id_sinh_vien"]
      }
    ],
    where: keyword
      ? {
          ten_nhom: {
            [Op.like]: `%${keyword}%`
          }
        }
      : {}
  });

  return s_group.map(group => ({
    id_nhom: group.id_nhom,
    ten_nhom: group.ten_nhom,
    ten_mon_hoc: group.lop_hoc?.ten_lop,
    ten_giang_vien: group.lop_hoc?.giang_vien?.ho_ten,
    so_thanh_vien: group.thanh_vien_nhoms?.length || 0,
    trang_thai: group.trang_thai || "Đang hoạt động"
  }));
};

module.exports = {
  getGroups
};