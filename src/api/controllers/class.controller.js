const lopHocService = require("../services/lopHoc.service");

exports.createClass = async (req, res) => {
  try {
    const { id_giang_vien, ten_lop, han_chot_dang_ky_nhom } = req.body;

    const newClass = await lopHocService.createClass({
      id_giang_vien,
      ten_lop,
      han_chot_dang_ky_nhom,
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