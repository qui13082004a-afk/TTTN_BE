const SinhVienLopHoc = require("../models/sinh_vien_lop_hoc.model");
const LopHoc = require("../models/lop_hoc.model");
const GiangVien = require("../models/giang_vien.model");

const getMyCourses = async (id_sinh_vien) => {
  const courses = await SinhVienLopHoc.findAll({
    where: {
      id_sinh_vien
    },
    include: [
      {
        model: LopHoc,
        as: "lop_hoc",
        attributes: [
          "id_lop",
          "ma_lop",
          "ten_lop",
          "han_chot_dang_ky"
        ],
        include: [
          {
            model: GiangVien,
            attributes: ["ho_ten"]
          }
        ]
      }
    ]
  });

  return {
    success: true,
    data: courses.map(item => ({
      id_lop: item.lop_hoc.id_lop,
      ma_mon: item.lop_hoc.ma_lop,
      ten_mon: item.lop_hoc.ten_lop,
      giang_vien: item.lop_hoc.GiangVien?.ho_ten || null,
      han_chot_dang_ky: item.lop_hoc.han_chot_dang_ky
    }))
  };
};

module.exports = {
  getMyCourses
};