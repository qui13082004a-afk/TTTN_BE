const XLSX = require("xlsx");
const bcrypt = require("bcrypt");
const sinhVienRepo = require("../repositories/sinhVien.repository");

class ImportService {
  async importSinhVienFromExcel(filePath) {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    if (data.length === 0) {
      throw new Error("File rong");
    }

    let inserted = 0;
    let skipped = 0;
    const warnings = [];
    const defaultPassword = await bcrypt.hash("123456", 10);

    for (const [index, row] of data.entries()) {
      const lineNumber = index + 2;
      const hoLot = (row["Ho lot"] || row["Họ lót"] || "").toString().trim();
      const ten = (row["Ten"] || row["Tên"] || "").toString().trim();
      const email = (row["Email"] || "").toString().trim().toLowerCase();
      const maSV = (row["Mã sinh viên"] || row["Ma sinh vien"] || row.MSSV || "").toString().trim();

      if (!ten) {
        throw new Error(`Dong ${lineNumber} bi thieu Ten`);
      }

      if (!email && !maSV) {
        warnings.push(`Dong ${lineNumber} thieu ca Email va MSSV nen khong the tao tai khoan`);
        continue;
      }

      const existedAccount = await sinhVienRepo.findExistingAccount({
        email: email || null,
        mssv: maSV || null,
      });

      if (existedAccount) {
        skipped++;
        warnings.push(`Dong ${lineNumber} da co tai khoan trong he thong`);
        continue;
      }

      const hoTenDayDu = `${hoLot} ${ten}`.trim();
      const generatedEmail = email || `${maSV}@student.stu.edu.vn`.toLowerCase();

      await sinhVienRepo.create({
        mssv: maSV || null,
        ho_ten: hoTenDayDu,
        email: generatedEmail,
        mat_khau: defaultPassword,
      });

      inserted++;
    }

    return { inserted, skipped, warnings };
  }
}

module.exports = new ImportService();
