const importService = require("../services/import.service");

exports.importSinhVien = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Chưa upload file"
      });
    }

    const result = await importService.importSinhVienFromExcel(req.file.path);

    res.json({
      message: "Import thành công",
      inserted: result.inserted,
      skipped: result.skipped,
      warnings: result.warnings
    });

  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
};