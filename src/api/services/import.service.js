const XLSX = require("xlsx");
const bcrypt = require("bcrypt");
const sinhVienRepo = require("../repositories/sinhVien.repository");

class ImportService {
  async importSinhVienFromExcel(filePath) {
    // 1. Đọc file Excel
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    if (data.length === 0) throw new Error("File rỗng");

    let inserted = 0;
    const warnings = [];
    const defaultPassword = await bcrypt.hash("123456", 10);

    for (const [index, row] of data.entries()) {
      // 2. Lấy dữ liệu theo đúng tên cột trong ảnh Excel của bạn
      // Lưu ý: Tên key phải viết y hệt tên cột ở dòng đầu tiên của file Excel
      const hoLot = (row["Họ lót"] || "").toString().trim();
      const ten = (row["Tên"] || "").toString().trim();
      const email = (row["Email"] || "").toString().trim();
      const maSV = row["Mã sinh viên"];

      // 3. Kiểm tra dữ liệu bắt buộc
      if (!ten) {
        throw new Error(`Dòng ${index + 2} bị thiếu Tên`);
      }
      if (!email) {
        warnings.push(`Dòng ${index + 2} có tên nhưng thiếu Email`);
        continue;
      }

      const exist = await sinhVienRepo.findByEmail(email);
      if (exist) {
        warnings.push(`Dòng ${index + 2} đã có tài khoản trong hệ thống`);
        continue;
      }

      const hoTenDayDu = `${hoLot} ${ten}`.trim();

      await sinhVienRepo.create({
        ho_ten: hoTenDayDu,
        email: email,
        mat_khau: defaultPassword,
      });
      
      inserted++;
    }
    return { inserted, warnings };
  }
}

module.exports = new ImportService();