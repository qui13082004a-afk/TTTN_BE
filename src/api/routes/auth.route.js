const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { authenticateToken, authorizeAdmin } = require("../middlewares/auth.middleware");

// Đăng ký tài khoản giảng viên mới, chỉ admin được phép thực hiện
router.post("/register-lecturer", authenticateToken, authorizeAdmin, authController.registerLecturer);

// Đăng nhập hệ thống, trả về thông tin người dùng và JWT token
router.post("/login", authController.login);

module.exports = router;
