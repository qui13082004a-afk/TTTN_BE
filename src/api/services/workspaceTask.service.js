const NhomHoc = require("../models/nhom_hoc.model");
const LopHoc = require("../models/lop_hoc.model");
const ThanhVienNhom = require("../models/thanh_vien_nhom.model");
const CongViec = require("../models/cong_viec.model");

const createTask = async (id_nhom, data = {}) => {
  const {
    id_sinh_vien,
    ten_cong_viec,
    mo_ta,
    han_chot,
    id_sinh_vien_phu_trach
  } = data;

  if (!id_sinh_vien) {
    throw new Error("Thiếu id_sinh_vien");
  }

  if (!id_sinh_vien_phu_trach) {
    throw new Error("Thiếu người phụ trách");
  }

  if (!ten_cong_viec) {
    throw new Error("Thiếu tên công việc");
  }

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

  const assignedMember = await ThanhVienNhom.findOne({
    where: {
      id_nhom,
      id_sinh_vien: id_sinh_vien_phu_trach
    }
  });

  if (!assignedMember) {
    throw new Error("Người phụ trách không thuộc nhóm");
  }

  if (!ten_cong_viec || ten_cong_viec.trim() === "") {
    throw new Error("Tên công việc không được để trống");
  }

  const task = await CongViec.create({
    id_nhom,
    ten_cong_viec,
    mo_ta,
    han_chot,
    id_sinh_vien_phu_trach,
    trang_thai: "can_lam"
  });

  return {
    success: true,
    message: "Tạo task thành công",
    data: task
  };
};

const createLecturerTask = async (id_nhom, actor, data = {}) => {
  const {
    ten_cong_viec,
    han_chot
  } = data;

  if (!actor || !["giangvien", "admin"].includes(actor.role)) {
    throw new Error("Chi giang vien hoac admin moi co quyen tao cong viec cho nhom");
  }

  if (!ten_cong_viec || ten_cong_viec.trim() === "") {
    throw new Error("Ten cong viec khong duoc de trong");
  }

  if (!han_chot) {
    throw new Error("Han chot khong duoc de trong");
  }

  const deadline = new Date(han_chot);
  if (Number.isNaN(deadline.getTime())) {
    throw new Error("Han chot khong hop le");
  }

  const group = await NhomHoc.findByPk(id_nhom);
  if (!group) {
    throw new Error("Khong tim thay nhom");
  }

  const lopHoc = await LopHoc.findByPk(group.id_lop);
  if (!lopHoc) {
    throw new Error("Khong tim thay lop hoc cua nhom");
  }

  if (
    actor.role !== "admin" &&
    Number(lopHoc.id_giang_vien) !== Number(actor.id_giang_vien)
  ) {
    throw new Error("Ban khong co quyen tao cong viec cho nhom nay");
  }

  const task = await CongViec.create({
    id_nhom,
    ten_cong_viec: ten_cong_viec.trim(),
    han_chot: deadline,
    id_sinh_vien_phu_trach: null,
    trang_thai: "can_lam"
  });

  return {
    success: true,
    message: "Tao cong viec cho nhom thanh cong",
    data: task
  };
};

const getGroupProgress = async (id_nhom) => {
  const totalTasks = await CongViec.count({
    where: { id_nhom }
  });

  const completedTasks = await CongViec.count({
    where: {
      id_nhom,
      trang_thai: "hoan_thanh"
    }
  });

  const progress =
    totalTasks === 0
      ? 0
      : Math.round((completedTasks / totalTasks) * 100);

  return {
    success: true,
    data: {
      id_nhom,
      tong_task: totalTasks,
      task_hoan_thanh: completedTasks,
      tien_do_phan_tram: progress
    }
  };
};

module.exports = {
  createTask,
  createLecturerTask,
  getGroupProgress
};
