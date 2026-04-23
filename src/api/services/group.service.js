const { Op } = require("sequelize");
const LopHoc = require("../models/lop_hoc.model");
const NhomHoc = require("../models/nhom_hoc.model");
const ThanhVienNhom = require("../models/thanh_vien_nhom.model");
const SinhVienLopHoc = require("../models/sinh_vien_lop_hoc.model");
const GiangVien = require("../models/giang_vien.model");
const SinhVien = require("../models/sinh_vien.model");

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

  if (group.lop_hoc?.han_chot_dang_ky) {
    const now = new Date();
    const deadline = new Date(group.lop_hoc.han_chot_dang_ky);

    if (now > deadline) {
      throw new Error("Đã hết thời gian đăng ký nhóm");
    }
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
    include: [
      {
        model: NhomHoc,
        where: {
          id_lop: group.id_lop
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

const getMyGroups = async (studentId, keyword = "") => {
  const groups = await NhomHoc.findAll({
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

  return groups.map(group => ({
    id_nhom: group.id_nhom,
    ten_nhom: group.ten_nhom,
    ten_mon_hoc: group.lop_hoc?.ten_lop,
    ten_giang_vien: group.lop_hoc?.giang_vien?.ho_ten,
    so_thanh_vien: group.thanh_vien_nhoms?.length || 0,
    trang_thai: group.trang_thai || "Đang hoạt động"
  }));
};

const getStudentsByGroupId = async (groupId, actor) => {
  const normalizedGroupId = Number(groupId);

  if (!normalizedGroupId) {
    throw new Error("ID nhom khong hop le");
  }

  const group = await NhomHoc.findByPk(normalizedGroupId, {
    include: [
      {
        model: LopHoc,
        as: "lop_hoc",
        attributes: ["id_lop", "ma_lop", "ten_lop", "id_giang_vien"]
      },
      {
        model: SinhVien,
        attributes: ["id_sinh_vien", "mssv", "ho_ten", "email", "trang_thai"],
        through: {
          attributes: ["vai_tro_noi_bo", "ngay_gia_nhap"]
        }
      }
    ]
  });

  if (!group) {
    throw new Error("Khong tim thay nhom");
  }

  if (
    actor?.role !== "admin" &&
    actor?.id_giang_vien &&
    Number(group.lop_hoc?.id_giang_vien) !== Number(actor.id_giang_vien)
  ) {
    throw new Error("Ban khong co quyen xem nhom nay");
  }

  const students = Array.isArray(group.sinh_viens)
    ? [...group.sinh_viens]
      .sort((a, b) => String(a.ho_ten || "").localeCompare(String(b.ho_ten || ""), "vi"))
      .map((student) => {
        const json = student.toJSON();
        return {
          id_sinh_vien: json.id_sinh_vien,
          mssv: json.mssv,
          ho_ten: json.ho_ten,
          email: json.email,
          trang_thai: json.trang_thai,
          vai_tro_noi_bo: json.thanh_vien_nhom?.vai_tro_noi_bo || null,
          ngay_gia_nhap: json.thanh_vien_nhom?.ngay_gia_nhap || null
        };
      })
    : [];

  return {
    group: {
      id_nhom: group.id_nhom,
      ma_nhom: group.ma_nhom,
      ten_nhom: group.ten_nhom,
      so_luong_toi_da: group.so_luong_toi_da
    },
    class: group.lop_hoc
      ? {
        id_lop: group.lop_hoc.id_lop,
        ma_lop: group.lop_hoc.ma_lop,
        ten_lop: group.lop_hoc.ten_lop
      }
      : null,
    count: students.length,
    students
  };
};

module.exports = {
  joinGroup,
  getMyGroups,
  getStudentsByGroupId
};
