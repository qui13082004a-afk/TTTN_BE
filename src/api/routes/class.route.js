const express = require("express");
const router = express.Router();
const multer = require("multer");
const classController = require("../controllers/class.controller");
const { authenticateToken, authorizeLecturer } = require("../middlewares/auth.middleware");

const upload = multer({ dest: "uploads/" });

// Tạo lớp học mới
router.post("/", authenticateToken, authorizeLecturer, classController.createClass);

// Lấy toàn bộ danh sách lớp học
router.get("/", classController.getAllClasses);

// Tìm lớp học theo tên lớp hoặc mã môn học
router.get("/search/class", classController.searchByClassName);

// Tìm lớp học theo tên giảng viên
router.get("/search/lecturer", classController.searchByLecturerName);

// Lấy danh sách lớp học theo giảng viên
router.get("/lecturer/:id_giang_vien", authenticateToken, authorizeLecturer, classController.getClassesByLecturer);

// Kiểm tra lớp có thể xóa cứng hay chỉ nên ẩn
router.get("/:id/delete-check", authenticateToken, authorizeLecturer, classController.getDeleteCheck);

// Ẩn lớp học để bảo toàn dữ liệu hoạt động
router.patch("/:id/hide", authenticateToken, authorizeLecturer, classController.hideClass);

// Thêm một sinh viên vào lớp bằng email
router.post("/:id/students/manual", authenticateToken, authorizeLecturer, classController.addStudentToClassByEmail);

// Import danh sách sinh viên vào lớp bằng file Excel
router.post("/:id/students/import", authenticateToken, authorizeLecturer, upload.single("file"), classController.importStudentsToClass);

// Lấy danh sách sinh viên của lớp
router.get("/:id/students", authenticateToken, authorizeLecturer, classController.getStudentsByClassId);

// Lấy danh sách các nhóm trong lớp
router.get("/:id/groups", authenticateToken, authorizeLecturer, classController.getGroupsByClassId);

// Lấy danh sách sinh viên trong lớp nhưng chưa có nhóm
router.get("/:id/ungrouped-students", authenticateToken, authorizeLecturer, classController.getUngroupedStudentsByClassId);

// Tự động phân nhóm sinh viên cho lớp
router.post("/:id/auto-group", authenticateToken, authorizeLecturer, classController.autoGroupStudents);

// Lấy chi tiết lớp học theo ID
router.get("/:id", classController.getClassById);

// Cập nhật thông tin lớp học
router.patch("/:id", classController.updateClass);

// Xóa lớp học
router.delete("/:id", authenticateToken, authorizeLecturer, classController.deleteClass);

module.exports = router;
