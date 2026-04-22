const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboard.controller");
const { authenticateToken, authorizeLecturer } = require("../middlewares/auth.middleware");

// Lấy dữ liệu 4 thẻ thống kê trên bảng điều khiển giảng viên
router.get("/lecturer/summary", authenticateToken, authorizeLecturer, dashboardController.getLecturerSummary);

// Lấy danh sách lớp cần xử lý, ví dụ lớp đã hết hạn đăng ký nhưng còn sinh viên chưa có nhóm
router.get("/lecturer/pending-actions", authenticateToken, authorizeLecturer, dashboardController.getPendingActions);

// Lấy danh sách thông báo thuộc các lớp và nhóm do giảng viên quản lý
router.get("/lecturer/notifications", authenticateToken, authorizeLecturer, dashboardController.getNotifications);

module.exports = router;
