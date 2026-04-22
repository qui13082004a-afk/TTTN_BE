const importService = require("../services/import.service");

exports.importSinhVien = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Chưa upload file",
      });
    }

    const result = await importService.importSinhVienFromExcel(req.file.path);

    return res.json({
      message: `Import thành công ${result.inserted} sinh viên mới, bỏ qua ${result.skipped} sinh viên đã có tài khoản`,
      inserted: result.inserted,
      skipped: result.skipped,
      warnings: result.warnings,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};