const importService = require("../services/import.service");

exports.importSinhVien = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Chua upload file" });
    }

    const result = await importService.importSinhVienFromExcel(req.file.path);

    return res.json({
      message: `Import thanh cong ${result.inserted} sinh vien moi, bo qua ${result.skipped} sinh vien da co tai khoan`,
      inserted: result.inserted,
      skipped: result.skipped,
      warnings: result.warnings,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
