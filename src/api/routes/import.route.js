const express = require("express");
const router = express.Router();
const multer = require("multer");
const importController = require("../controllers/import.controller");

const upload = multer({ dest: "uploads/" });

// Import danh sách sinh viên từ file Excel, sinh viên đã có tài khoản sẽ được bỏ qua
router.post("/import-sinh-vien", upload.single("file"), importController.importSinhVien);

module.exports = router;
