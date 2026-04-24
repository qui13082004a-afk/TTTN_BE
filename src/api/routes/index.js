const express = require("express");
const router = express.Router();

const authRoute = require("./auth.route");
const importRoute = require("./import.route");
const userRoute = require("./user.route");
const classRoute = require("./class.route");
const moveRoute = require("./move.route");
const kickRoute = require("./kick_student.route");

const groupRoute = require("./group.route");
const dashboardRoute = require("./dashboard.route");
const calendarRoute = require("./calendar.route");
const groupChangeRequestRoute = require("./group_change_request.route");

// CỦA BẠN
const groupJoin = require("./group_join.route");
const groupShow = require("./group_show.route");
const studentHomeRoute = require("./studentHome.route");
const studentDashboardRoute = require("./studentDashboard.route");
const studentProfileRoute = require("./studentProfile.route");
const studentScheduleRoute = require("./studentSchedule.route");
const studentCourseRoute = require("./studentCourse.route");
const workspaceRoute = require("./workspace.route");

// Nhom API xac thuc va tai khoan
router.use("/auth", authRoute);

// Nhom API import du lieu sinh vien
router.use("/import", importRoute);

// Nhom API lay thong tin nguoi dung
router.use("/users", userRoute);

// Nhom API quan ly lop hoc, sinh vien va nhom hoc
router.use("/classes", classRoute);

// Nhom API chuyen sinh vien giua cac nhom
router.use("/move", moveRoute);

// Nhom API xoa sinh vien khoi nhom
router.use("/kick", kickRoute);

// Nhóm học
router.use("/groups", groupRoute);

// Nhom API du lieu bang dieu khien giang vien
router.use("/dashboard", dashboardRoute);

// Nhom API lich lam viec va su kien
router.use("/calendar", calendarRoute);

// Nhom API yeu cau chuyen nhom
router.use("/group-change-requests", groupChangeRequestRoute);

// 👉 GIỮ CỦA BẠN
router.use("/group-join", groupJoin);
router.use("/group-show", groupShow);
router.use("/student-home", studentHomeRoute);
router.use("/student-dashboard", studentDashboardRoute);
router.use("/student-profile", studentProfileRoute);
router.use("/student-schedule", studentScheduleRoute);
router.use("/student-courses", studentCourseRoute);
router.use("/workspace", workspaceRoute);

module.exports = router;