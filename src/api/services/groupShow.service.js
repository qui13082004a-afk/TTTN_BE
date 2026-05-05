const { Op } = require("sequelize");
const LopHoc = require("../models/lop_hoc.model");
const NhomHoc = require("../models/nhom_hoc.model");
const ThanhVienNhom = require("../models/thanh_vien_nhom.model");
const GiangVien = require("../models/giang_vien.model");

const getGroups = async (studentId, keyword = "", id_lop = null) => {
  const whereCondition = {};

if (id_lop) {
  whereCondition.id_lop = id_lop;
}

if (keyword) {
  whereCondition[Op.or] = [
    { ten_nhom: { [Op.like]: `%${keyword}%` } },
    { "$lop_hoc.ten_lop$": { [Op.like]: `%${keyword}%` } }
  ];
}

  const groups = await NhomHoc.findAll({
    where: whereCondition,
    include: [
  {
    model: LopHoc,
    as: "lop_hoc",
    attributes: ["ten_lop", "han_chot_dang_ky"]
  },
  {
    model: ThanhVienNhom,
    as: "thanh_vien",
    attributes: ["id_sinh_vien"],
    required: false   
  }
]
  });

  const now = new Date();

  const result = await Promise.all(
    groups.map(async (group) => {
      const isMember = group.thanh_vien?.some(
        (tv) => tv.id_sinh_vien === studentId
      );

      const totalMembers = await ThanhVienNhom.count({
        where: { id_nhom: group.id_nhom }
      });

      const deadline = group.lop_hoc?.han_chot_dang_ky;

      let trang_thai = "Không xác định";
      if (deadline) {
        trang_thai =
          new Date(deadline) > now ? "Còn hạn" : "Hết hạn";
      }

      return {
        id_nhom: group.id_nhom,
        id_lop: group.id_lop, 
        ten_nhom: group.ten_nhom,
        ten_mon_hoc: group.lop_hoc?.ten_lop || "",
        so_thanh_vien: totalMembers,
        so_luong_toi_da: group.so_luong_toi_da,
        trang_thai,
        is_tham_gia: isMember ? "Đã tham gia" : "Chưa tham gia"
      };
    })
  );

  return result;
};

module.exports = {
  getGroups
};