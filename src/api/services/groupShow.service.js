const { Op, Sequelize } = require("sequelize");
const LopHoc = require("../models/lop_hoc.model");
const NhomHoc = require("../models/nhom_hoc.model");
const ThanhVienNhom = require("../models/thanh_vien_nhom.model");
const GiangVien = require("../models/giang_vien.model");

const getGroups = async (studentId, keyword = "") => {
  const whereCondition = keyword
    ? {
        [Op.or]: [
          {
            ten_nhom: {
              [Op.like]: `%${keyword}%`
            }
          },
          Sequelize.where(
            Sequelize.col("lop_hoc.ten_lop"),
            {
              [Op.like]: `%${keyword}%`
            }
          )
        ]
      }
    : {};

  const groups = await NhomHoc.findAll({
    subQuery: false,
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
        attributes: [],
        where: {
          id_sinh_vien: studentId
        }
      }
    ],
    where: whereCondition
  });

  const result = await Promise.all(
    groups.map(async (group) => {
      const totalMembers = await ThanhVienNhom.count({
        where: {
          id_nhom: group.id_nhom
        }
      });

      return {
        id_nhom: group.id_nhom,
        //ma_nhom: group.ma_nhom,
        ten_nhom: group.ten_nhom,
        ten_mon_hoc: group.lop_hoc?.ten_lop || "",
        ten_giang_vien: group.lop_hoc?.giang_vien?.ho_ten || "",
        so_thanh_vien: totalMembers,
        trang_thai: "Đang hoạt động"
      };
    })
  );

  return result;
};

module.exports = {
  getGroups
};