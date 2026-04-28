const express = require("express");
const router = express.Router();
const multer = require("multer");
const classController = require("../controllers/class.controller");
const { authenticateToken, authorizeLecturer } = require("../middlewares/auth.middleware");

const upload = multer({ dest: "uploads/" });

// Tao lop hoc moi
router.post("/", authenticateToken, authorizeLecturer, classController.createClass);

// Lay toan bo danh sach lop hoc
router.get("/", classController.getAllClasses);

// Tim lop hoc theo ten lop hoac ma mon hoc
router.get("/search/class", classController.searchByClassName);

// Tim lop hoc theo ten giang vien
router.get("/search/lecturer", classController.searchByLecturerName);

// Lay danh sach lop hoc cua mot giang vien
router.get("/lecturer/:id_giang_vien", authenticateToken, authorizeLecturer, classController.getClassesByLecturer);

// Kiem tra lop co the xoa cung hay chi nen an
router.get("/:id/delete-check", authenticateToken, authorizeLecturer, classController.getDeleteCheck);

// An lop hoc de bao toan du lieu hoat dong
router.patch("/:id/hide", authenticateToken, authorizeLecturer, classController.hideClass);

// Them mot sinh vien vao lop bang email
router.post("/:id/students/manual", authenticateToken, authorizeLecturer, classController.addStudentToClassByEmail);

// Import danh sach sinh vien vao lop bang file Excel
router.post("/:id/students/import", authenticateToken, authorizeLecturer, upload.single("file"), classController.importStudentsToClass);

// Lay danh sach sinh vien cua lop, ho tro tim kiem theo MSSV hoac ho ten
router.get("/:id/students", authenticateToken, authorizeLecturer, classController.getStudentsByClassId);

// Lay danh sach nhom cua lop, phuc vu tab Quan ly nhom
router.get("/:id/groups", authenticateToken, authorizeLecturer, classController.getGroupsByClassId);

// Lay thong ke nhanh cho man Quan ly nhom: da co nhom, chua co nhom, trang thai han dang ky, trang thai nut bam
router.get("/:id/group-management-summary", authenticateToken, authorizeLecturer, classController.getGroupManagementSummary);

// Lay danh sach yeu cau chuyen nhom dang cho duyet cua lop, sap xep don moi nhat len truoc theo id yeu cau
router.get("/:id/group-change-requests", authenticateToken, authorizeLecturer, classController.getPendingGroupChangeRequestsByClass);

// Dem so luong yeu cau chuyen nhom dang cho duyet cua lop de hien badge
router.get("/:id/group-change-requests/pending-count", authenticateToken, authorizeLecturer, classController.getPendingGroupChangeRequestCountByClass);

// Lay danh sach cac nhom con cho de hien popup chon nhom khi gan sinh vien thu cong
router.get("/:id/available-groups", authenticateToken, authorizeLecturer, classController.getAvailableGroupsByClassId);

// Tao nhom moi cho lop khi con trong thoi gian dang mo
router.post("/:id/groups", authenticateToken, authorizeLecturer, classController.createGroupForClass);

// Gan thu cong mot sinh vien vao mot nhom cu the, co chan truong hop nhom day
router.post("/:id/groups/:groupId/members", authenticateToken, authorizeLecturer, classController.assignStudentToGroup);

// Chon nhom truong cho mot nhom
router.patch("/:id/groups/:groupId/leader", authenticateToken, authorizeLecturer, classController.assignGroupLeader);

// Lay danh sach sinh vien trong lop nhung chua co nhom
router.get("/:id/ungrouped-students", authenticateToken, authorizeLecturer, classController.getUngroupedStudentsByClassId);

// Phan nhom tu dong cho cac sinh vien chua co nhom sau khi het han dang ky
router.post("/:id/auto-group", authenticateToken, authorizeLecturer, classController.autoGroupStudents);

// Lay chi tiet lop hoc theo ID de hien tieu de va thong tin lop
router.get("/:id", classController.getClassById);

// Cap nhat thong tin lop hoc
router.patch("/:id", classController.updateClass);

// Xoa lop hoc
router.delete("/:id", authenticateToken, authorizeLecturer, classController.deleteClass);

module.exports = router;
