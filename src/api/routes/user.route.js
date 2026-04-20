const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const { authenticateToken } = require("../middlewares/auth.middleware");

// Lấy thông tin sinh viên theo ID
router.get("/student/:id", userController.getStudentById);

// Lấy thông tin giảng viên theo ID
router.get("/lecturer/:id", userController.getLecturerById);

// Lấy thông tin tài khoản đang đăng nhập
router.get("/me", authenticateToken, userController.getCurrentUser);

module.exports = router;
