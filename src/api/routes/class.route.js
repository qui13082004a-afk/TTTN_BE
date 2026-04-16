const express = require("express");
const router = express.Router();
const multer = require("multer");
const classController = require("../controllers/class.controller");
const { authenticateToken, authorizeLecturer } = require("../middlewares/auth.middleware");

const upload = multer({ dest: "uploads/" });

// Create class
router.post("/", authenticateToken, authorizeLecturer, classController.createClass);

// Get all classes
router.get("/", classController.getAllClasses);

// Search by class name (đặt trước /:id để tránh conflict)
router.get("/search/class", classController.searchByClassName);

// Search by lecturer name (đặt trước /:id để tránh conflict)
router.get("/search/lecturer", classController.searchByLecturerName);

// Get classes by lecturer
router.get("/lecturer/:id_giang_vien", classController.getClassesByLecturer);

// Add students to class
router.post("/:id/students/manual", authenticateToken, authorizeLecturer, classController.addStudentToClassByEmail);
router.post("/:id/students/import", authenticateToken, authorizeLecturer, upload.single("file"), classController.importStudentsToClass);
router.get("/:id/students", authenticateToken, authorizeLecturer, classController.getStudentsByClassId);

// Get class by ID
router.get("/:id", classController.getClassById);

// Update class
router.patch("/:id", classController.updateClass);

// Delete class
router.delete("/:id", classController.deleteClass);

module.exports = router;
