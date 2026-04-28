const fs = require("fs/promises");
const lopHocService = require("../services/lopHoc.service");
const importService = require("../services/import.service");
const groupChangeRequestService = require("../services/groupChangeRequest.service");

exports.createClass = async (req, res) => {
  try {
    const {
      id_giang_vien,
      ten_lop,
      ma_lop,
      id_mon_hoc,
      hoc_ky,
      si_so_toi_da,
      so_nhom_toi_da,
      mo_ta,
      han_chot_dang_ky,
      han_chot_dang_ky_nhom,
    } = req.body;

    const newClass = await lopHocService.createClass({
      id_giang_vien,
      ten_lop,
      ma_lop,
      id_mon_hoc,
      hoc_ky,
      si_so_toi_da,
      so_nhom_toi_da,
      mo_ta,
      han_chot_dang_ky,
      han_chot_dang_ky_nhom,
      actor: req.user,
    });

    res.status(201).json({
      message: "Tao lop hoc thanh cong",
      class: newClass,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getClassById = async (req, res) => {
  try {
    const { id } = req.params;
    const lopHoc = await lopHocService.getClassById(Number(id));

    res.json({
      class: lopHoc,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

exports.getClassesByLecturer = async (req, res) => {
  try {
    const { id_giang_vien } = req.params;
    const classes = await lopHocService.getClassesByLecturer(Number(id_giang_vien));

    res.json({
      count: classes.length,
      classes,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getAllClasses = async (req, res) => {
  try {
    const classes = await lopHocService.getAllClasses();

    res.json({
      count: classes.length,
      classes,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateClass = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      ten_lop,
      ma_lop,
      id_mon_hoc,
      hoc_ky,
      si_so_toi_da,
      so_nhom_toi_da,
      mo_ta,
      trang_thai,
      han_chot_dang_ky,
      han_chot_dang_ky_nhom,
    } = req.body;

    const updated = await lopHocService.updateClass(Number(id), {
      ten_lop,
      ma_lop,
      id_mon_hoc,
      hoc_ky,
      si_so_toi_da,
      so_nhom_toi_da,
      mo_ta,
      trang_thai,
      han_chot_dang_ky,
      han_chot_dang_ky_nhom,
    });

    res.json({
      message: "Cap nhat lop hoc thanh cong",
      class: updated,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getDeleteCheck = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await lopHocService.getDeleteCheck(Number(id), req.user);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.hideClass = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await lopHocService.hideClass(Number(id), req.user);

    res.json({
      message: "An lop hoc thanh cong",
      class: result,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteClass = async (req, res) => {
  try {
    const { id } = req.params;
    await lopHocService.deleteClass(Number(id), req.user);

    res.json({
      message: "Xoa lop hoc thanh cong",
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.searchByClassName = async (req, res) => {
  try {
    const keyword = req.query.keyword || req.query.ten_lop || req.query.ma_mon_hoc;

    if (!keyword) {
      return res.status(400).json({ message: "Tu khoa tim kiem khong duoc de trong" });
    }

    const classes = await lopHocService.searchClasses(keyword);

    res.json({
      count: classes.length,
      keyword,
      classes,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.searchByLecturerName = async (req, res) => {
  try {
    const { ten_giang_vien } = req.query;

    if (!ten_giang_vien) {
      return res.status(400).json({ message: "Ten giang vien khong duoc de trong" });
    }

    const classes = await lopHocService.searchByLecturerName(ten_giang_vien);

    res.json({
      count: classes.length,
      classes,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getStudentsByClassId = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await lopHocService.getStudentsByClassId(Number(id), req.user, req.query.q);

    res.json({
      class: result.class,
      count: result.students.length,
      students: result.students,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getGroupsByClassId = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await lopHocService.getGroupsByClassId(Number(id), req.user);

    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getGroupManagementSummary = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await lopHocService.getGroupManagementSummary(Number(id), req.user);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getPendingGroupChangeRequestsByClass = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await groupChangeRequestService.getPendingRequestsByClass(Number(id), req.user);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getPendingGroupChangeRequestCountByClass = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await groupChangeRequestService.getPendingCountByClass(Number(id), req.user);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getAvailableGroupsByClassId = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await lopHocService.getAvailableGroupsByClassId(Number(id), req.user);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.createGroupForClass = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await lopHocService.createGroupForClass(Number(id), req.user, req.body);

    res.status(201).json({
      message: "Tao nhom moi thanh cong",
      group: result,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.assignStudentToGroup = async (req, res) => {
  try {
    const { id, groupId } = req.params;
    const { id_sinh_vien } = req.body;
    const result = await lopHocService.assignStudentToGroup({
      id_lop: Number(id),
      id_nhom: Number(groupId),
      id_sinh_vien: Number(id_sinh_vien),
      actor: req.user,
    });

    res.json({
      message: "Them sinh vien vao nhom thanh cong",
      ...result,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getUngroupedStudentsByClassId = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await lopHocService.getUngroupedStudentsByClassId(Number(id), req.user);

    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.autoGroupStudents = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await lopHocService.autoGroupStudents(Number(id), req.user);

    res.json({
      message: "Phan nhom tu dong thanh cong",
      ...result,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.addStudentToClassByEmail = async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body;

    const result = await lopHocService.addStudentToClassByEmail({
      id_lop: Number(id),
      email,
      actor: req.user,
    });

    const message = result.created
      ? "Them sinh vien vao lop thanh cong"
      : "Sinh vien da co trong lop";

    res.json({
      message,
      student: result.student,
      class: result.class,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.importStudentsToClass = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({ message: "Chua upload file danh sach sinh vien" });
    }

    const result = await importService.importStudentsToClassFromFile({
      id_lop: Number(id),
      filePath: req.file.path,
      actor: req.user,
    });

    res.json({
      message: `Da them ${result.inserted} sinh vien vao lop`,
      class: result.class,
      createdAccounts: result.createdAccounts,
      warnings: result.warnings,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  } finally {
    if (req.file?.path) {
      await fs.unlink(req.file.path).catch(() => {});
    }
  }
};
