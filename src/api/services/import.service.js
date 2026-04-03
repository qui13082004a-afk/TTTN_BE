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
    const defaultPassword = await bcrypt.hash("123456", 10);

    for (const [index, row] of data.entries()) {
      // 2. Lấy dữ liệu theo đúng tên cột trong ảnh Excel của bạn
      // Lưu ý: Tên key phải viết y hệt tên cột ở dòng đầu tiên của file Excel
      const hoLot = row["Họ lót"] || ""; 
      const ten = row["Tên"] || "";
      const email = row["Email"];
      const maSV = row["Mã sinh viên"]; 

      // 3. Kiểm tra dữ liệu bắt buộc (Email là quan trọng nhất để định danh)
      if (!email) {
        throw new Error(`Dòng ${index + 2} bị thiếu Email`);
      }

      // 4. Kiểm tra xem sinh viên đã tồn tại chưa (Dùng email)
      const exist = await sinhVienRepo.findByEmail(email);
      if (exist) continue;

      // 5. Gộp Họ lót và Tên thành ho_ten để lưu vào Model SinhVien
      const hoTenDayDu = `${hoLot} ${ten}`.trim();

      await sinhVienRepo.create({
        ho_ten: hoTenDayDu, // Khớp với trường ho_ten trong model
        email: email,       // Khớp với trường email trong model
        mat_khau: defaultPassword // Khớp với trường mat_khau trong model
      });
      
      inserted++;
    }
    return inserted;
  }
}

module.exports = new ImportService();