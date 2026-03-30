const express = require("express");
const router = express.Router();
const multer = require("multer");
const XLSX = require("xlsx");
const bcrypt = require("bcrypt");

const SinhVien = require("./models/sinh_vien.model");

// cấu hình upload file
const upload = multer({ dest: "uploads/" });

//test
router.get("/test", (req, res) => {
  res.send("IMPORT OK");
});

router.post("/import-sinh-vien", upload.single("file"), async (req, res) => {
  try {
    // 1. kiểm tra có file không
    if (!req.file) {
      return res.status(400).json({ message: "Chưa upload file" });
    }

    // 2. đọc file Excel
    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    // 3. kiểm tra dữ liệu
    if (data.length === 0) {
      return res.status(400).json({ message: "File rỗng" });
    }

    let inserted = 0;

    for (let i = 0; i < data.length; i++) {
      const row = data[i];

      const name = row["ho_ten"];
      const email = row["email"];

      // validate
      if (!name || !email) {
        return res.status(400).json({
          message: `Dòng ${i + 2} thiếu dữ liệu`,
        });
      }

      // check email trùng
      const exist = await SinhVien.findOne({ 
        where: {email:email} 
      });
      if (exist) {
        continue; // bỏ qua nếu trùng
      }

      // tạo password mặc định
      const password = await bcrypt.hash("123456", 10);

      // lưu DB
      await SinhVien.create({
        ho_ten: name,
        email: email,
        mat_khau: password,
      });

      inserted++;
    }

    return res.json({
      message: `Import thành công ${inserted} sinh viên`,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Lỗi server" });
  }
});

module.exports = router;