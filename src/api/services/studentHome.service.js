const { Op } = require("sequelize");
const SinhVien = require("../models/sinh_vien.model");
const LopHoc = require("../models/lop_hoc.model");
const SinhVienLopHoc = require("../models/sinh_vien_lop_hoc.model");
const NhomHoc = require("../models/nhom_hoc.model");
const GiangVien = require("../models/giang_vien.model");
const ThanhVienNhom = require("../models/thanh_vien_nhom.model");

const getStudentHome = async (id_sinh_vien) => {
  //const student = await SinhVien.findByPk(id_sinh_vien);

const student = await SinhVien.findOne({
  where: {
    id_sinh_vien
  }
});

  if (!student) {
    throw new Error("Không tìm thấy sinh viên");
  }

  const classes = await SinhVienLopHoc.findAll({
    where: { id_sinh_vien },
    include: [
      {
        model: LopHoc,
        as: "lop_hoc",
        include: [
          {
            model: GiangVien,
            as: "giang_vien"
          }
        ]
      }
    ]
  });

  const now = new Date();

  const availableClasses = classes.map(item => {
    const cls = item.lop_hoc;
    const isOpen = cls.han_chot_dang_ky && new Date(cls.han_chot_dang_ky) >= now;

    return {
      id_lop: cls.id_lop,
      ten_lop: cls.ten_lop,
      ma_lop: cls.ma_lop,
      giang_vien: cls.giang_vien?.ho_ten || "",
      han_chot_dang_ky: cls.han_chot_dang_ky,
      cho_phep_tao_nhom: isOpen
    };
  });

  return {
    success: true,
    data: {
      sinh_vien: {
        id: student.id_sinh_vien,
        ho_ten: student.ho_ten,
        email: student.email
      },
      lop_hoc: availableClasses
    }
  };
};

// const createGroup = async (id_sinh_vien, id_lop, ten_nhom) => {
//   const lop = await LopHoc.findByPk(id_lop);

//   if (!lop) {
//     throw new Error("Không tìm thấy lớp học");
//   }

//   if (lop.han_chot_dang_ky) {
//     const now = new Date();
//     const deadline = new Date(lop.han_chot_dang_ky);

//     if (now > deadline) {
//       throw new Error("Lớp đã hết hạn tạo nhóm");
//     }
//   }

//   const inClass = await SinhVienLopHoc.findOne({
//     where: {
//       id_sinh_vien,
//       id_lop
//     }
//   });

//   if (!inClass) {
//     throw new Error("Sinh viên không thuộc lớp này");
//   }

//   const existed = await ThanhVienNhom.findOne({
//     include: [
//       {
//         model: NhomHoc,
//         where: { id_lop }
//       }
//     ],
//     where: { id_sinh_vien }
//   });

//   if (existed) {
//     throw new Error("Sinh viên đã có nhóm trong lớp này");
//   }

//   const totalGroup = await NhomHoc.count({
//     where: { id_lop }
//   });

//   const ma_nhom = String(totalGroup + 1).padStart(2, "0");

//   const newGroup = await NhomHoc.create({
//     id_lop,
//     ten_nhom,
//     ma_nhom,
//     id_nhom_truong: id_sinh_vien
//   });

//   await ThanhVienNhom.create({
//     id_nhom: newGroup.id_nhom,
//     id_sinh_vien,
//     vai_tro_noi_bo: "truong_nhom",
//     ngay_gia_nhap: new Date()
//   });

//   return {
//     success: true,
//     message: "Tạo nhóm thành công",
//     data: newGroup
//   };
// };

module.exports = {
  getStudentHome
  //createGroup
};