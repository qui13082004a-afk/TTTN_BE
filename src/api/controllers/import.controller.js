const importService = require("../services/import.service");

exports.importSinhVien = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Chưa upload file" });
    
    const result = await importService.importSinhVienFromExcel(req.file.path);
    if (typeof result === "object") {
      return res.json({
        message: `Import thành công ${result.inserted} sinh viên`,
        warnings: result.warnings,
      });
    }

    res.json({ message: `Import thành công ${result} sinh viên` });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};