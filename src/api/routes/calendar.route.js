const express = require("express");
const router = express.Router();
const calendarController = require("../controllers/calendar.controller");
const { authenticateToken, authorizeLecturer } = require("../middlewares/auth.middleware");

// Lấy danh sách lớp của giảng viên trong kỳ hiện tại để đổ vào dropdown bộ lọc "Chọn lớp"
router.get("/classes", authenticateToken, authorizeLecturer, calendarController.getCalendarClasses);

// Lấy dữ liệu sự kiện trong một tháng để FE vẽ chấm đỏ trên lịch, có thể lọc theo lớp
router.get("/month-events", authenticateToken, authorizeLecturer, calendarController.getMonthEvents);

// Lấy danh sách chi tiết sự kiện của một ngày cụ thể, có thể lọc theo lớp và sắp xếp theo giờ tăng dần
router.get("/day-events", authenticateToken, authorizeLecturer, calendarController.getDayEvents);

module.exports = router;
