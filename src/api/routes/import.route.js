const express = require("express");
const router = express.Router();
const multer = require("multer");
const importController = require("../controllers/import.controller");

const upload = multer({ dest: "uploads/" });

router.post("/import-sinh-vien", upload.single("file"), importController.importSinhVien);


module.exports = router;