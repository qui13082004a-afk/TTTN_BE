const importService = require("../services/import.service");

exports.importSinhVien = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Chưa upload file" });
    
    const count = await importService.importSinhVienFromExcel(req.file.path);
    res.json({ message: `Import thành công ${count} sinh viên` });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};