const XLSX = require("xlsx");
const bcrypt = require("bcrypt");
const sinhVienRepo = require("../repositories/sinhVien.repository");

class ImportService {
  async importSinhVienFromExcel(filePath) {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    if (data.length === 0) {
      throw new Error("File rỗng");
    }

    let inserted = 0;
    let skipped = 0;
    const warnings = [];

    const defaultPassword = await bcrypt.hash("123456", 10);

    for (const [index, row] of data.entries()) {
      const hoLot = (row["Họ lót"] || "").toString().trim();
      const ten = (row["Tên"] || "").toString().trim();
      const email = (row["Email"] || "").toString().trim();

      const hoTenDayDu = `${hoLot} ${ten}`.trim();

      if (!hoTenDayDu || !email) {
        skipped++;
        warnings.push(`Dòng ${index + 2} thiếu dữ liệu`);
        continue;
      }

      const exist = await sinhVienRepo.findByEmail(email);

      if (exist) {
        skipped++;
        warnings.push(`Dòng ${index + 2} email đã tồn tại`);
        continue;
      }

      await sinhVienRepo.create({
        ho_ten: hoTenDayDu,
        email: email,
        mat_khau: defaultPassword
      });

      inserted++;
    }

    return {
      inserted,
      skipped,
      warnings
    };
  }
}

module.exports = new ImportService();