const lopHocService = require("../services/lopHoc.service");
const fs = require("fs/promises");

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

    const updated = await lopHocService.updateClass(id, {
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

exports.deleteClass = async (req, res) => {
  try {
    const { id } = req.params;
    await lopHocService.deleteClass(id);

    res.json({
      message: "Xoa lop hoc thanh cong",
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.searchByClassName = async (req, res) => {
  try {
    const { ten_lop } = req.query;

    if (!ten_lop) {
      return res.status(400).json({ message: "Ten lop khong duoc de trong" });
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
    const result = await lopHocService.getStudentsByClassId(Number(id), req.user);

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

    const result = await lopHocService.importStudentsToClassFromFile({
      id_lop: Number(id),
      filePath: req.file.path,
      actor: req.user,
    });

    res.json({
      message: `Da them ${result.inserted} sinh vien vao lop`,
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
