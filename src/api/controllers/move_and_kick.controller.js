const adminService = require("../services/move_and_kick.service");

exports.moveStudent = async (req, res) => {
  try {
    const { id_sinh_vien, id_nhom_from, id_nhom_to } = req.body;

    const result = await adminService.moveStudent({
      id_sinh_vien,
      id_nhom_from,
      id_nhom_to,
    });

    res.json({
      message: "Di chuyển sinh viên thành công.",
      result,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.kickStudent = async (req, res) => {
  try {
    const { id_sinh_vien, id_nhom } = req.body;

    const result = await adminService.kickStudent({
      id_sinh_vien,
      id_nhom,
    });

    res.json({
      message: "Xóa sinh viên khỏi nhóm thành công.",
      result,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
