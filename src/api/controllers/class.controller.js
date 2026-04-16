const lopHocService = require("../services/lopHoc.service");
const fs = require("fs/promises");

exports.createClass = async (req, res) => {
  try {
    const { id_giang_vien, ten_lop, han_chot_dang_ky_nhom } = req.body;

    const newClass = await lopHocService.createClass({
      id_giang_vien,
      ten_lop,
      han_chot_dang_ky_nhom,
      actor: req.user,
    });

    res.status(201).json({
      message: "Tạo lớp học thành công",
      class: newClass,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getClassById = async (req, res) => {
  try {
    const { id } = req.params;

    const lopHoc = await lopHocService.getClassById(id);

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

    const classes = await lopHocService.getClassesByLecturer(id_giang_vien);

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
    const { ten_lop, han_chot_dang_ky_nhom } = req.body;

    const updated = await lopHocService.updateClass(id, {
      ten_lop,
      han_chot_dang_ky_nhom,
    });

    res.json({
      message: "Cập nhật lớp học thành công",
      class: updated,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteClass = async (req, res) => {
  try {
    const { id } = req.params;

    await lopHocService.deleteClass(id);

    res.json({
      message: "Xóa lớp học thành công",
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.searchByClassName = async (req, res) => {
  try {
    const { ten_lop } = req.query;

    if (!ten_lop) {
      return res.status(400).json({ message: "Tên lớp không được để trống" });
    }

    const classes = await lopHocService.searchByClassName(ten_lop);

    res.json({
      count: classes.length,
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
      return res.status(400).json({ message: "Tên giảng viên không được để trống" });
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

    const result = await lopHocService.getStudentsByClassId(
      Number(id),
      req.user
    );

    res.json({
      class: result.class,
      count: result.students.length,
      students: result.students,
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
      ? "Thêm sinh viên vào lớp thành công"
      : "Sinh viên đã có trong lớp";

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
      return res.status(400).json({ message: "Chưa upload file danh sách sinh viên" });
    }

    const result = await lopHocService.importStudentsToClassFromFile({
      id_lop: Number(id),
      filePath: req.file.path,
      actor: req.user,
    });

    res.json({
      message: `Đã thêm ${result.inserted} sinh viên vào lớp`,
      class: result.class,
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
