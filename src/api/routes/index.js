const express = require("express");
const router = express.Router();

const authRoute = require("./auth.route");
const importRoute = require("./import.route");
const userRoute = require("./user.route");
const classRoute = require("./class.route");
const moveRoute = require("./move.route");
const kickRoute = require("./kick_student.route");
const dashboardRoute = require("./dashboard.route");
const calendarRoute = require("./calendar.route");

// Nhóm API xác thực và tài khoản
router.use("/auth", authRoute);

// Nhóm API import dữ liệu sinh viên
router.use("/import", importRoute);

// Nhóm API lấy thông tin người dùng
router.use("/users", userRoute);

// Nhóm API quản lý lớp học, sinh viên và nhóm học
router.use("/classes", classRoute);

// Nhóm API chuyển sinh viên giữa các nhóm
router.use("/move", moveRoute);

// Nhóm API xóa sinh viên khỏi nhóm
router.use("/kick", kickRoute);

// Nhóm API dữ liệu bảng điều khiển giảng viên
router.use("/dashboard", dashboardRoute);

// Nhóm API lịch làm việc và sự kiện theo ngày/tháng
router.use("/calendar", calendarRoute);

module.exports = router;
