const express = require("express");
const router = express.Router();
const multer = require("multer");
const classController = require("../controllers/class.controller");
const { authenticateToken, authorizeLecturer } = require("../middlewares/auth.middleware");

const upload = multer({ dest: "uploads/" });

router.post("/", authenticateToken, authorizeLecturer, classController.createClass);
router.get("/", classController.getAllClasses);
router.get("/search/class", classController.searchByClassName);
router.get("/search/lecturer", classController.searchByLecturerName);
router.get("/lecturer/:id_giang_vien", authenticateToken, authorizeLecturer, classController.getClassesByLecturer);
router.get("/:id/delete-check", authenticateToken, authorizeLecturer, classController.getDeleteCheck);
router.patch("/:id/hide", authenticateToken, authorizeLecturer, classController.hideClass);
router.post("/:id/students/manual", authenticateToken, authorizeLecturer, classController.addStudentToClassByEmail);
router.post("/:id/students/import", authenticateToken, authorizeLecturer, upload.single("file"), classController.importStudentsToClass);
router.get("/:id/students", authenticateToken, authorizeLecturer, classController.getStudentsByClassId);
router.get("/:id/groups", authenticateToken, authorizeLecturer, classController.getGroupsByClassId);
router.get("/:id/group-management-summary", authenticateToken, authorizeLecturer, classController.getGroupManagementSummary);
router.get("/:id/available-groups", authenticateToken, authorizeLecturer, classController.getAvailableGroupsByClassId);
router.post("/:id/groups", authenticateToken, authorizeLecturer, classController.createGroupForClass);
router.post("/:id/groups/:groupId/members", authenticateToken, authorizeLecturer, classController.assignStudentToGroup);
router.get("/:id/ungrouped-students", authenticateToken, authorizeLecturer, classController.getUngroupedStudentsByClassId);
router.post("/:id/auto-group", authenticateToken, authorizeLecturer, classController.autoGroupStudents);
router.get("/:id", classController.getClassById);
router.patch("/:id", classController.updateClass);
router.delete("/:id", authenticateToken, authorizeLecturer, classController.deleteClass);

module.exports = router;
